const coaModel = require('../models/coa.model')
const proyekModel = require('../models/proyek.model')
const rabModel = require('../models/rab.model')
const marginService = require('../services/margin.service')
const kursService = require('../services/kurs.service')

const KATEGORI_RAB = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']
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
    return { status: 400, code: 'INVALID_REFERENCE', message: 'Referensi RAB tidak valid' }
  }

  if (error?.code === '23514') {
    return { status: 400, code: 'VALIDATION_ERROR', message: 'Nilai field RAB tidak sesuai constraint database' }
  }

  return { status: 500, code: 'RAB_ERROR', message: error.message }
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

function canReadProjectRab(user, project) {
  if (user.role === 'admin' || user.role === 'kepala_divre') return true
  if (user.role === 'pm') return project.cabang_id === user.cabang_id
  return false
}

function canMutateProjectRab(user, project) {
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

  if (!canReadProjectRab(req.user, project)) {
    errorResponse(res, 403, 'FORBIDDEN', 'User tidak memiliki akses ke RAB proyek ini')
    return null
  }

  return project
}

function validateRabBody(body, { isCreate = false } = {}) {
  const errors = []

  if (body.total_idr !== undefined) {
    errors.push('total_idr tidak boleh dikirim karena dihitung otomatis oleh database')
  }

  if (isCreate || body.kategori !== undefined) {
    if (!KATEGORI_RAB.includes(body.kategori)) {
      errors.push('kategori harus salah satu dari I, II, III, IV, V, VI, VII')
    }
  }

  if (isCreate || body.kode_akun_seg5 !== undefined) {
    if (typeof body.kode_akun_seg5 !== 'string' || body.kode_akun_seg5.trim() === '') {
      errors.push('kode_akun_seg5 wajib berupa string dan tidak boleh kosong')
    }
  }

  if (isCreate || body.uraian !== undefined) {
    if (typeof body.uraian !== 'string' || body.uraian.trim() === '') {
      errors.push('uraian wajib diisi')
    }
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

  return errors
}

function validateCurrencyAndKurs(merged, errors) {
  if (!CURRENCIES.includes(merged.mata_uang)) {
    errors.push('mata_uang harus IDR atau USD')
    return
  }

  if (merged.mata_uang === 'USD' && merged.kurs_idr !== undefined && merged.kurs_idr !== null && merged.kurs_idr !== '') {
    const kursIdr = normalizeInteger(merged.kurs_idr)
    if (!Number.isInteger(kursIdr) || kursIdr <= 1) {
      errors.push('kurs_idr wajib berupa integer > 1 untuk mata uang USD')
    }
  }
}

async function validateCoa(body) {
  const coa = await coaModel.findActiveCoaByKode(cleanString(body.kode_akun_seg5))

  if (!coa) {
    return {
      error: { status: 400, code: 'INVALID_COA_ACCOUNT', message: 'Kode akun COA tidak ditemukan atau tidak aktif' },
      coa: null
    }
  }

  if (coa.kategori_rab && coa.kategori_rab !== body.kategori) {
    return {
      error: { status: 400, code: 'COA_CATEGORY_MISMATCH', message: 'Kategori RAB tidak sesuai kategori akun COA' },
      coa
    }
  }

  return { error: null, coa }
}

function buildRabPayload(body, { userId, coa, isCreate = false, resolvedKurs } = {}) {
  const qty = normalizeNumber(body.qty)
  const hargaSatuan = normalizeInteger(body.harga_satuan)
  const kursIdr = resolvedKurs ?? normalizeInteger(body.kurs_idr)

  const payload = pickDefined({
    kategori: body.kategori,
    kode_akun_seg5: cleanString(body.kode_akun_seg5),
    seg4_kode: emptyToNull(cleanString(body.seg4_kode)) || coa?.seg4_default || undefined,
    uraian: cleanString(body.uraian),
    qty: Number.isNaN(qty) ? body.qty : qty,
    satuan: emptyToNull(cleanString(body.satuan)),
    mata_uang: body.mata_uang || (isCreate ? 'IDR' : undefined),
    harga_satuan: Number.isNaN(hargaSatuan) ? body.harga_satuan : hargaSatuan,
    kurs_idr: Number.isNaN(kursIdr) ? body.kurs_idr : kursIdr,
    updated_by: userId
  })

  if (isCreate && payload.kurs_idr === undefined) {
    payload.kurs_idr = 1
  }

  if (payload.mata_uang === 'IDR') {
    payload.kurs_idr = 1
  }

  delete payload.total_idr
  return payload
}

async function buildValidatedPayload(body, res, { isCreate = false, existing = null, userId } = {}) {
  const errors = validateRabBody(body, { isCreate })
  const merged = {
    ...existing,
    ...body,
    kategori: body.kategori ?? existing?.kategori,
    kode_akun_seg5: body.kode_akun_seg5 ?? existing?.kode_akun_seg5,
    mata_uang: body.mata_uang ?? existing?.mata_uang ?? (isCreate ? 'IDR' : undefined),
    kurs_idr: body.kurs_idr ?? existing?.kurs_idr
  }

  validateCurrencyAndKurs(merged, errors)

  if (errors.length) {
    errorResponse(res, 400, 'VALIDATION_ERROR', errors.join('; '))
    return null
  }

  const resolvedKurs = await kursService.resolveInputKurs(merged.mata_uang, merged.kurs_idr)

  const { error, coa } = await validateCoa(merged)
  if (error) {
    errorResponse(res, error.status, error.code, error.message)
    return null
  }

  const shouldApplyCoaDefaults = isCreate || body.kode_akun_seg5 !== undefined || body.seg4_kode !== undefined

  return buildRabPayload(body, {
    userId,
    coa: shouldApplyCoaDefaults ? coa : null,
    isCreate,
    resolvedKurs
  })
}

async function listRabItems(req, res) {
  try {
    const project = await getProjectOrRespond(req.params.id, req, res)
    if (!project) return null

    const items = await rabModel.listRabItemsByProject(project.id)
    const marginRab = marginService.calculateRabMargin(project, items)

    return success(res, {
      project: {
        id: project.id,
        nama: project.nama,
        seg11_no: project.seg11_no,
        cabang_id: project.cabang_id,
        nilai_proyek: project.nilai_proyek,
        mata_uang_proyek: project.mata_uang_proyek,
        kurs_idr_proyek: project.kurs_idr_proyek,
        rab_locked: false
      },
      items,
      totals_by_kategori: marginRab.totals_by_kategori,
      total_rab_idr: marginRab.total_rab_idr,
      margin_rab: marginRab,
      can_edit: canMutateProjectRab(req.user, project)
    })
  } catch (error) {
    const mapped = mapModelError(error)
    return errorResponse(res, mapped.status, mapped.code, mapped.message)
  }
}

async function createRabItem(req, res) {
  try {
    const project = await getProjectOrRespond(req.params.id, req, res)
    if (!project) return null

    if (!canMutateProjectRab(req.user, project)) {
      return errorResponse(res, 403, 'FORBIDDEN', 'User tidak bisa mengubah RAB proyek ini')
    }

    const payload = await buildValidatedPayload(req.body, res, {
      isCreate: true,
      userId: req.user.id
    })
    if (!payload) return null

    const data = await rabModel.createRabItem(project.id, payload)
    await rabModel.createAuditLog({
      tabel: 'rab_items',
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

async function updateRabItem(req, res) {
  try {
    const item = await rabModel.findRabItemById(req.params.itemId)
    if (!item) {
      return errorResponse(res, 404, 'NOT_FOUND', 'Item RAB tidak ditemukan')
    }

    const project = await getProjectOrRespond(item.project_id, req, res)
    if (!project) return null

    if (!canMutateProjectRab(req.user, project)) {
      return errorResponse(res, 403, 'FORBIDDEN', 'User tidak bisa mengubah RAB proyek ini')
    }

    const payload = await buildValidatedPayload(req.body, res, {
      isCreate: false,
      existing: item,
      userId: req.user.id
    })
    if (!payload) return null

    const data = await rabModel.updateRabItem(req.params.itemId, payload)
    await rabModel.createAuditLog({
      tabel: 'rab_items',
      record_id: data.id,
      aksi: 'UPDATE',
      nilai_lama: item,
      nilai_baru: data,
      user_id: req.user.id
    })

    return success(res, data)
  } catch (error) {
    const mapped = mapModelError(error)
    return errorResponse(res, mapped.status, mapped.code, mapped.message)
  }
}

async function deleteRabItem(req, res) {
  try {
    const item = await rabModel.findRabItemById(req.params.itemId)
    if (!item) {
      return errorResponse(res, 404, 'NOT_FOUND', 'Item RAB tidak ditemukan')
    }

    const project = await getProjectOrRespond(item.project_id, req, res)
    if (!project) return null

    if (!canMutateProjectRab(req.user, project)) {
      return errorResponse(res, 403, 'FORBIDDEN', 'User tidak bisa mengubah RAB proyek ini')
    }

    const data = await rabModel.deleteRabItem(req.params.itemId)
    await rabModel.createAuditLog({
      tabel: 'rab_items',
      record_id: item.id,
      aksi: 'DELETE',
      nilai_lama: item,
      nilai_baru: null,
      user_id: req.user.id
    })

    return success(res, data || { id: req.params.itemId })
  } catch (error) {
    const mapped = mapModelError(error)
    return errorResponse(res, mapped.status, mapped.code, mapped.message)
  }
}

module.exports = {
  listRabItems,
  createRabItem,
  updateRabItem,
  deleteRabItem
}
