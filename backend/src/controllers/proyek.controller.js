const proyekModel = require('../models/proyek.model')
const kursService = require('../services/kurs.service')

const PROJECT_STATUSES = ['draft', 'aktif', 'selesai', 'arsip']
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
    return { status: 400, code: 'INVALID_REFERENCE', message: 'Referensi proyek tidak valid' }
  }

  if (error?.code === '23514') {
    return { status: 400, code: 'VALIDATION_ERROR', message: 'Nilai field proyek tidak sesuai constraint database' }
  }

  return { status: 500, code: 'PROYEK_ERROR', message: error.message }
}

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : value
}

function emptyToNull(value) {
  if (value === '') {
    return null
  }

  return value
}

function pickDefined(payload) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  )
}

function normalizeInteger(value) {
  if (value === undefined || value === null || value === '') {
    return value
  }

  if (typeof value === 'number') {
    return Number.isInteger(value) ? value : NaN
  }

  if (typeof value === 'string' && /^\d+$/.test(value.trim())) {
    return Number(value.trim())
  }

  return NaN
}

function validateUuidString(value, fieldName, errors) {
  if (value !== undefined && value !== null && typeof value !== 'string') {
    errors.push(`${fieldName} wajib berupa string UUID atau null`)
  }
}

function validateProject(body, { isCreate = false, user } = {}) {
  const errors = []

  if (isCreate || body.nama !== undefined) {
    if (typeof body.nama !== 'string' || body.nama.trim() === '') {
      errors.push('nama wajib diisi')
    }
  }

  if (isCreate || body.nilai_proyek !== undefined) {
    const nilaiProyek = normalizeInteger(body.nilai_proyek)
    if (!Number.isInteger(nilaiProyek) || nilaiProyek < 0) {
      errors.push('nilai_proyek wajib berupa integer nominal proyek >= 0')
    }
  }

  if (body.kurs_idr_proyek !== undefined) {
    const kurs = normalizeInteger(body.kurs_idr_proyek)
    if (!Number.isInteger(kurs) || kurs <= 0) {
      errors.push('kurs_idr_proyek wajib berupa integer > 0')
    }
  }

  if (body.mata_uang_proyek !== undefined && !CURRENCIES.includes(body.mata_uang_proyek)) {
    errors.push('mata_uang_proyek harus IDR atau USD')
  }

  if (body.status !== undefined && !PROJECT_STATUSES.includes(body.status)) {
    errors.push('status harus draft, aktif, selesai, atau arsip')
  }

  if (body.seg11_no !== undefined && body.seg11_no !== null && body.seg11_no !== '') {
    const seg11 = String(body.seg11_no).trim()
    if (!/^\d{6}$/.test(seg11)) {
      errors.push('seg11_no wajib terdiri dari tepat 6 angka')
    }
  }

  if (isCreate && user?.role === 'admin' && (typeof body.cabang_id !== 'string' || body.cabang_id.trim() === '')) {
    errors.push('cabang_id wajib diisi untuk admin')
  }

  if (isCreate && user?.role === 'pm' && !user.cabang_id) {
    errors.push('PM wajib memiliki cabang_id sebelum membuat proyek')
  }

  validateUuidString(body.cabang_id, 'cabang_id', errors)
  validateUuidString(body.pm_user_id, 'pm_user_id', errors)

  return errors
}

async function resolveProjectKurs(body, { isCreate = false, existing = null } = {}) {
  const mataUang = body.mata_uang_proyek ?? existing?.mata_uang_proyek ?? (isCreate ? 'IDR' : undefined)

  if (!mataUang) {
    return undefined
  }

  const kursInput = body.kurs_idr_proyek ?? existing?.kurs_idr_proyek ?? (isCreate && mataUang === 'IDR' ? 1 : undefined)
  return kursService.resolveInputKurs(mataUang, kursInput)
}

function buildProjectPayload(body, { isCreate = false, user, resolvedKurs } = {}) {
  const nilaiProyek = normalizeInteger(body.nilai_proyek)
  const kursIdrProyek = resolvedKurs ?? normalizeInteger(body.kurs_idr_proyek)

  const payload = pickDefined({
    nama: cleanString(body.nama),
    nomor_spmk: emptyToNull(cleanString(body.nomor_spmk)),
    seg11_no: emptyToNull(cleanString(body.seg11_no)),
    cabang_id: emptyToNull(body.cabang_id),
    klien: emptyToNull(cleanString(body.klien)),
    nilai_proyek: Number.isNaN(nilaiProyek) ? body.nilai_proyek : nilaiProyek,
    mata_uang_proyek: body.mata_uang_proyek || (isCreate ? 'IDR' : undefined),
    kurs_idr_proyek: Number.isNaN(kursIdrProyek) ? body.kurs_idr_proyek : kursIdrProyek,
    tgl_mulai: emptyToNull(body.tgl_mulai),
    tgl_selesai: emptyToNull(body.tgl_selesai),
    portofolio_seg7: emptyToNull(cleanString(body.portofolio_seg7)),
    sub_portofolio_seg8: emptyToNull(cleanString(body.sub_portofolio_seg8)),
    pmu_kso_seg9: emptyToNull(cleanString(body.pmu_kso_seg9)),
    pm_user_id: emptyToNull(body.pm_user_id),
    status: body.status || (isCreate ? 'draft' : undefined)
  })

  if (isCreate) {
    payload.created_by = user.id

    if (payload.kurs_idr_proyek === undefined) {
      payload.kurs_idr_proyek = 1
    }
  }

  if (user.role === 'pm') {
    payload.cabang_id = user.cabang_id

    if (isCreate && !payload.pm_user_id) {
      payload.pm_user_id = user.id
    }
  }

  return payload
}

function canAccessProject(user, project) {
  if (!project || project.status === 'arsip') {
    return false
  }

  if (user.role === 'pm') {
    return project.cabang_id === user.cabang_id
  }

  return true
}

async function getAccessibleProject(req, res) {
  const project = await proyekModel.findProjectById(req.params.id)

  if (!project || project.status === 'arsip') {
    errorResponse(res, 404, 'NOT_FOUND', 'Proyek tidak ditemukan')
    return null
  }

  if (!canAccessProject(req.user, project)) {
    errorResponse(res, 403, 'FORBIDDEN', 'PM hanya bisa mengakses proyek cabangnya sendiri')
    return null
  }

  return project
}

async function listProjects(req, res) {
  try {
    if (req.user.role === 'pm' && !req.user.cabang_id) {
      return errorResponse(res, 403, 'FORBIDDEN', 'PM belum memiliki cabang_id')
    }

    const filters = { ...req.query }

    if (req.user.role === 'pm') {
      filters.cabang_id = req.user.cabang_id
    }

    const data = await proyekModel.listProjects(filters)
    return success(res, data)
  } catch (error) {
    const mapped = mapModelError(error)
    return errorResponse(res, mapped.status, mapped.code, mapped.message)
  }
}

async function getProject(req, res) {
  try {
    const project = await getAccessibleProject(req, res)
    if (!project) return null

    return success(res, project)
  } catch (error) {
    const mapped = mapModelError(error)
    return errorResponse(res, mapped.status, mapped.code, mapped.message)
  }
}

async function createProject(req, res) {
  const errors = validateProject(req.body, { isCreate: true, user: req.user })
  if (errors.length) {
    return errorResponse(res, 400, 'VALIDATION_ERROR', errors.join('; '))
  }

  try {
    const resolvedKurs = await resolveProjectKurs(req.body, { isCreate: true })
    const payload = buildProjectPayload(req.body, { isCreate: true, user: req.user, resolvedKurs })
    const data = await proyekModel.createProject(payload)
    return success(res, data, 201)
  } catch (error) {
    const mapped = mapModelError(error)
    return errorResponse(res, mapped.status, mapped.code, mapped.message)
  }
}

async function updateProject(req, res) {
  const errors = validateProject(req.body, { isCreate: false, user: req.user })
  if (errors.length) {
    return errorResponse(res, 400, 'VALIDATION_ERROR', errors.join('; '))
  }

  try {
    const currentProject = await getAccessibleProject(req, res)
    if (!currentProject) return null

    const resolvedKurs = await resolveProjectKurs(req.body, { isCreate: false, existing: currentProject })
    const payload = buildProjectPayload(req.body, { isCreate: false, user: req.user, resolvedKurs })
    const data = await proyekModel.updateProject(req.params.id, payload)

    if (!data) {
      return errorResponse(res, 404, 'NOT_FOUND', 'Proyek tidak ditemukan')
    }

    return success(res, data)
  } catch (error) {
    const mapped = mapModelError(error)
    return errorResponse(res, mapped.status, mapped.code, mapped.message)
  }
}

async function archiveProject(req, res) {
  try {
    const currentProject = await proyekModel.findProjectById(req.params.id)

    if (!currentProject || currentProject.status === 'arsip') {
      return errorResponse(res, 404, 'NOT_FOUND', 'Proyek tidak ditemukan')
    }

    const data = await proyekModel.archiveProject(req.params.id)
    return success(res, data)
  } catch (error) {
    const mapped = mapModelError(error)
    return errorResponse(res, mapped.status, mapped.code, mapped.message)
  }
}

module.exports = {
  listProjects,
  getProject,
  createProject,
  updateProject,
  archiveProject
}
