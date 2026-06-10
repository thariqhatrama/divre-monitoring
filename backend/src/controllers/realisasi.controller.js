const proyekModel = require('../models/proyek.model')
const rabModel = require('../models/rab.model')
const realisasiModel = require('../models/realisasi.model')
const kursService = require('../services/kurs.service')
const marginService = require('../services/margin.service')

const CURRENCIES = ['IDR', 'USD']

function success(res, data, status = 200) {
  return res.status(status).json({ success: true, data })
}

function errorResponse(res, status, code, message) {
  return res.status(status).json({
    success: false,
    error: { code, message }
  })
}

function mapModelError(error) {
  if (error?.status && error?.code) {
    return { status: error.status, code: error.code, message: error.message }
  }

  if (error?.code === '23503') {
    return { status: 400, code: 'INVALID_REFERENCE', message: 'Referensi realisasi tidak valid' }
  }

  if (error?.code === '23514') {
    return { status: 400, code: 'VALIDATION_ERROR', message: 'Nilai field realisasi tidak sesuai constraint database' }
  }

  return { status: 500, code: 'REALISASI_ERROR', message: error.message }
}

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : value
}

function emptyToNull(value) {
  return value === '' ? null : value
}

function pickDefined(payload) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  )
}

function normalizeInteger(value) {
  if (value === undefined || value === null || value === '') return value
  if (typeof value === 'number') return Number.isInteger(value) ? value : NaN
  if (typeof value === 'string' && /^\d+$/.test(value.trim())) return Number(value.trim())
  return NaN
}

function normalizeNumber(value) {
  if (value === undefined || value === null || value === '') return value
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : NaN
}

function canReadProject(user, project) {
  if (user.role === 'admin' || user.role === 'kepala_divre') return true
  if (user.role === 'pm') return project.cabang_id === user.cabang_id
  return false
}

function canMutateProject(user, project) {
  if (user.role === 'admin') return true
  if (user.role === 'pm') return project.cabang_id === user.cabang_id
  return false
}

async function getProjectOrRespond(projectId, req, res) {
  const project = await proyekModel.findProjectById(projectId)

  if (!project || project.status === 'arsip') {
    errorResponse(res, 404, 'PROJECT_NOT_FOUND', 'Proyek tidak ditemukan')
    return null
  }

  if (!canReadProject(req.user, project)) {
    errorResponse(res, 403, 'FORBIDDEN', 'User tidak memiliki akses ke realisasi proyek ini')
    return null
  }

  return project
}

function validateBody(body, { isCreate = false } = {}) {
  const errors = []

  if (body.total_idr !== undefined) {
    errors.push('total_idr tidak boleh dikirim karena dihitung otomatis oleh database')
  }

  if (body.rab_item_id !== undefined || body.project_id !== undefined || body.created_by !== undefined || body.created_at !== undefined) {
    errors.push('rab_item_id, project_id, created_by, dan created_at tidak boleh diubah dari endpoint realisasi')
  }

  if (isCreate || body.qty !== undefined) {
    const qty = normalizeNumber(body.qty)
    if (!Number.isFinite(qty) || qty < 0) {
      errors.push('qty wajib berupa angka >= 0')
    }
  }

  if (body.mata_uang !== undefined && !CURRENCIES.includes(body.mata_uang)) {
    errors.push('mata_uang harus IDR atau USD')
  }

  if (isCreate || body.harga_satuan !== undefined) {
    const hargaSatuan = normalizeInteger(body.harga_satuan)
    if (!Number.isInteger(hargaSatuan) || hargaSatuan < 0) {
      errors.push('harga_satuan wajib berupa integer >= 0')
    }
  }

  if (body.kurs_idr !== undefined) {
    const kursIdr = normalizeInteger(body.kurs_idr)
    if (!Number.isInteger(kursIdr) || kursIdr <= 0) {
      errors.push('kurs_idr wajib berupa integer > 0')
    }
  }

  if (body.tanggal_realisasi !== undefined && (typeof body.tanggal_realisasi !== 'string' || body.tanggal_realisasi.trim() === '')) {
    errors.push('tanggal_realisasi wajib berupa tanggal string')
  }

  return errors
}

async function buildPayload(body, { isCreate = false, existing = null, rabItem = null, userId } = {}) {
  const merged = {
    ...existing,
    ...body,
    mata_uang: body.mata_uang ?? existing?.mata_uang ?? rabItem?.mata_uang ?? (isCreate ? 'IDR' : undefined),
    kurs_idr: body.kurs_idr ?? existing?.kurs_idr ?? rabItem?.kurs_idr,
    satuan: body.satuan ?? existing?.satuan ?? rabItem?.satuan
  }

  const resolvedKurs = await kursService.resolveInputKurs(merged.mata_uang, merged.kurs_idr)
  const qty = normalizeNumber(body.qty)
  const hargaSatuan = normalizeInteger(body.harga_satuan)

  const payload = pickDefined({
    tanggal_realisasi: emptyToNull(body.tanggal_realisasi),
    qty: Number.isNaN(qty) ? body.qty : qty,
    satuan: emptyToNull(cleanString(body.satuan ?? (isCreate ? rabItem?.satuan : undefined))),
    mata_uang: body.mata_uang || (isCreate ? rabItem?.mata_uang || 'IDR' : undefined),
    harga_satuan: Number.isNaN(hargaSatuan) ? body.harga_satuan : hargaSatuan,
    kurs_idr: resolvedKurs,
    catatan: emptyToNull(cleanString(body.catatan)),
    created_by: isCreate ? userId : undefined
  })

  if (isCreate) {
    payload.rab_item_id = rabItem.id
    payload.project_id = rabItem.project_id
  }

  if (payload.mata_uang === 'IDR') {
    payload.kurs_idr = 1
  }

  delete payload.total_idr
  return payload
}

function buildAggregates(rabItems = [], realisasiItems = []) {
  const rabById = new Map(rabItems.map((item) => [item.id, item]))
  const totalsByRabItem = {}
  const accountMap = new Map()
  let totalRealisasiIdr = 0

  for (const item of realisasiItems) {
    const total = Number(item.total_idr || 0)
    const rabItem = rabById.get(item.rab_item_id)
    const accountCode = rabItem?.kode_akun_seg5 || 'UNKNOWN'

    totalsByRabItem[item.rab_item_id] = (totalsByRabItem[item.rab_item_id] || 0) + total
    totalRealisasiIdr += total

    const current = accountMap.get(accountCode) || {
      kode_akun_seg5: accountCode,
      kategori: rabItem?.kategori || null,
      rab_total_idr: 0,
      realisasi_total_idr: 0,
      selisih_idr: 0
    }

    current.realisasi_total_idr += total
    accountMap.set(accountCode, current)
  }

  for (const rabItem of rabItems) {
    const accountCode = rabItem.kode_akun_seg5
    const current = accountMap.get(accountCode) || {
      kode_akun_seg5: accountCode,
      kategori: rabItem.kategori,
      rab_total_idr: 0,
      realisasi_total_idr: 0,
      selisih_idr: 0
    }

    current.rab_total_idr += Number(rabItem.total_idr || 0)
    current.selisih_idr = current.rab_total_idr - current.realisasi_total_idr
    accountMap.set(accountCode, current)
  }

  return {
    total_realisasi_idr: totalRealisasiIdr,
    totals_by_rab_item: totalsByRabItem,
    totals_by_account: Array.from(accountMap.values()).map((item) => ({
      ...item,
      selisih_idr: item.rab_total_idr - item.realisasi_total_idr
    }))
  }
}

async function listRealisasi(req, res) {
  try {
    const project = await getProjectOrRespond(req.params.id, req, res)
    if (!project) return null

    const [rabItems, items] = await Promise.all([
      rabModel.listRabItemsByProject(project.id),
      realisasiModel.listRealisasiByProject(project.id)
    ])
    const aggregates = buildAggregates(rabItems, items)
    const margin = marginService.calculateRealisasiMargin(project, rabItems, items)

    return success(res, {
      project,
      rab_items: rabItems,
      items,
      ...aggregates,
      margin_realisasi: margin
    })
  } catch (error) {
    const mapped = mapModelError(error)
    return errorResponse(res, mapped.status, mapped.code, mapped.message)
  }
}

async function createRealisasi(req, res) {
  const errors = validateBody(req.body, { isCreate: true })
  if (errors.length) {
    return errorResponse(res, 400, 'VALIDATION_ERROR', errors.join('; '))
  }

  try {
    const rabItem = await rabModel.findRabItemById(req.params.itemId)
    if (!rabItem) {
      return errorResponse(res, 404, 'RAB_NOT_FOUND', 'Item RAB tidak ditemukan')
    }

    const project = await getProjectOrRespond(rabItem.project_id, req, res)
    if (!project) return null

    if (!canMutateProject(req.user, project)) {
      return errorResponse(res, 403, 'FORBIDDEN', 'User tidak bisa menambah realisasi proyek ini')
    }

    const payload = await buildPayload(req.body, { isCreate: true, rabItem, userId: req.user.id })
    const data = await realisasiModel.createRealisasi(payload)
    await realisasiModel.createAuditLog({
      tabel: 'realisasi_items',
      record_id: data.id,
      aksi: 'INSERT',
      nilai_lama: null,
      nilai_baru: data,
      user_id: req.user.id
    })

    return success(res, data, 201)
  } catch (error) {
    const mapped = mapModelError(error)
    return errorResponse(res, mapped.status, mapped.code, mapped.message)
  }
}

async function updateRealisasi(req, res) {
  const errors = validateBody(req.body)
  if (errors.length) {
    return errorResponse(res, 400, 'VALIDATION_ERROR', errors.join('; '))
  }

  try {
    const existing = await realisasiModel.findRealisasiById(req.params.id)
    if (!existing) {
      return errorResponse(res, 404, 'REALISASI_NOT_FOUND', 'Realisasi tidak ditemukan')
    }

    const project = await getProjectOrRespond(existing.project_id, req, res)
    if (!project) return null

    if (!canMutateProject(req.user, project)) {
      return errorResponse(res, 403, 'FORBIDDEN', 'User tidak bisa mengubah realisasi proyek ini')
    }

    const payload = await buildPayload(req.body, { existing, userId: req.user.id })
    const data = await realisasiModel.updateRealisasi(req.params.id, payload)
    await realisasiModel.createAuditLog({
      tabel: 'realisasi_items',
      record_id: data.id,
      aksi: 'UPDATE',
      nilai_lama: existing,
      nilai_baru: data,
      user_id: req.user.id
    })

    return success(res, data)
  } catch (error) {
    const mapped = mapModelError(error)
    return errorResponse(res, mapped.status, mapped.code, mapped.message)
  }
}

async function deleteRealisasi(req, res) {
  try {
    const existing = await realisasiModel.findRealisasiById(req.params.id)
    if (!existing) {
      return errorResponse(res, 404, 'REALISASI_NOT_FOUND', 'Realisasi tidak ditemukan')
    }

    const project = await getProjectOrRespond(existing.project_id, req, res)
    if (!project) return null

    if (!canMutateProject(req.user, project)) {
      return errorResponse(res, 403, 'FORBIDDEN', 'User tidak bisa menghapus realisasi proyek ini')
    }

    const data = await realisasiModel.deleteRealisasi(req.params.id)
    await realisasiModel.createAuditLog({
      tabel: 'realisasi_items',
      record_id: existing.id,
      aksi: 'DELETE',
      nilai_lama: existing,
      nilai_baru: null,
      user_id: req.user.id
    })

    return success(res, data || { id: req.params.id })
  } catch (error) {
    const mapped = mapModelError(error)
    return errorResponse(res, mapped.status, mapped.code, mapped.message)
  }
}

module.exports = {
  listRealisasi,
  createRealisasi,
  updateRealisasi,
  deleteRealisasi
}
