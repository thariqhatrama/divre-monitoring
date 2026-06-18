const bcrypt = require('bcryptjs')
const branchModel = require('../models/branch.model')
const coaModel = require('../models/coa.model')
const userModel = require('../models/user.model')
const masterSegModel = require('../models/master_seg.model')

const KATEGORI_RAB = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']
const TIPE_FV = ['F', 'V']
const BRANCH_TYPES = ['cabang', 'unit_pelayanan']
const USER_ROLES = ['kepala_divre', 'pm', 'admin']

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
  if (error?.code === '23505') {
    return { status: 409, code: 'DUPLICATE_DATA', message: 'Data master sudah ada' }
  }

  if (error?.code === '23503') {
    return { status: 400, code: 'INVALID_REFERENCE', message: 'Referensi data master tidak valid' }
  }

  if (error?.code === '23514') {
    return { status: 400, code: 'VALIDATION_ERROR', message: 'Nilai field tidak sesuai constraint database' }
  }

  return { status: 500, code: 'MASTER_DATA_ERROR', message: error.message }
}

function requireString(value, fieldName) {
  if (typeof value !== 'string' || value.trim() === '') {
    return `${fieldName} wajib berupa string dan tidak boleh kosong`
  }

  return null
}

function optionalBoolean(value, fieldName) {
  if (value !== undefined && typeof value !== 'boolean') {
    return `${fieldName} wajib berupa boolean`
  }

  return null
}

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : value
}

function pickDefined(payload) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  )
}

function validateCoa(body, isCreate = false) {
  const errors = []

  if (isCreate) {
    const kodeError = requireString(body.kode_seg5, 'kode_seg5')
    if (kodeError) errors.push(kodeError)
  } else if (body.kode_seg5 !== undefined) {
    errors.push('kode_seg5 tidak bisa diubah')
  }

  if (isCreate || body.nama !== undefined) {
    const namaError = requireString(body.nama, 'nama')
    if (namaError) errors.push(namaError)
  }

  if (body.kategori_rab !== undefined && !KATEGORI_RAB.includes(body.kategori_rab)) {
    errors.push('kategori_rab harus salah satu dari I, II, III, IV, V, VI, VII')
  }

  if (body.tipe_fv !== undefined && !TIPE_FV.includes(body.tipe_fv)) {
    errors.push('tipe_fv harus F atau V')
  }

  const aktifError = optionalBoolean(body.aktif, 'aktif')
  if (aktifError) errors.push(aktifError)

  return errors
}

function buildCoaPayload(body, includeKode = false) {
  return pickDefined({
    kode_seg5: includeKode ? cleanString(body.kode_seg5) : undefined,
    nama: cleanString(body.nama),
    seg4_default: body.seg4_default === null ? null : cleanString(body.seg4_default),
    kategori_rab: body.kategori_rab,
    tipe_fv: body.tipe_fv,
    aktif: body.aktif
  })
}

function validateBranch(body, isCreate = false) {
  const errors = []

  if (isCreate || body.kode_seg23 !== undefined) {
    const kodeError = requireString(body.kode_seg23, 'kode_seg23')
    if (kodeError) errors.push(kodeError)
  }

  if (isCreate || body.nama !== undefined) {
    const namaError = requireString(body.nama, 'nama')
    if (namaError) errors.push(namaError)
  }

  if ((isCreate || body.tipe !== undefined) && !BRANCH_TYPES.includes(body.tipe)) {
    errors.push('tipe harus cabang atau unit_pelayanan')
  }

  if (body.parent_id !== undefined && body.parent_id !== null && typeof body.parent_id !== 'string') {
    errors.push('parent_id wajib berupa string UUID atau null')
  }

  const aktifError = optionalBoolean(body.aktif, 'aktif')
  if (aktifError) errors.push(aktifError)

  return errors
}

function buildBranchPayload(body) {
  return pickDefined({
    kode_seg23: cleanString(body.kode_seg23),
    nama: cleanString(body.nama),
    tipe: body.tipe,
    parent_id: body.parent_id === '' ? null : body.parent_id,
    aktif: body.aktif
  })
}

function validateUser(body, isCreate = false) {
  const errors = []

  if (isCreate || body.nama !== undefined) {
    const namaError = requireString(body.nama, 'nama')
    if (namaError) errors.push(namaError)
  }

  if (isCreate || body.email !== undefined) {
    const emailError = requireString(body.email, 'email')
    if (emailError) errors.push(emailError)
  }

  if (isCreate || body.role !== undefined) {
    if (!USER_ROLES.includes(body.role)) {
      errors.push('role harus kepala_divre, pm, atau admin')
    }
  }

  if (isCreate || body.password !== undefined) {
    const passwordError = requireString(body.password, 'password')
    if (passwordError) errors.push(passwordError)
  }

  if (body.cabang_id !== undefined && body.cabang_id !== null && typeof body.cabang_id !== 'string') {
    errors.push('cabang_id wajib berupa string UUID atau null')
  }

  if ((isCreate || body.role !== undefined || body.cabang_id !== undefined) && body.role === 'pm' && !body.cabang_id) {
    errors.push('PM wajib memiliki cabang_id')
  }

  const aktifError = optionalBoolean(body.aktif, 'aktif')
  if (aktifError) errors.push(aktifError)

  return errors
}

async function buildUserPayload(body, includePassword = false) {
  const cabangId = body.role && body.role !== 'pm' ? null : (body.cabang_id === '' ? null : body.cabang_id)
  const payload = pickDefined({
    nama: cleanString(body.nama),
    email: typeof body.email === 'string' ? body.email.trim().toLowerCase() : body.email,
    role: body.role,
    cabang_id: cabangId,
    aktif: body.aktif
  })

  if (includePassword || body.password !== undefined) {
    payload.password_hash = await bcrypt.hash(body.password, 10)
  }

  return payload
}

async function listCoa(req, res) {
  try {
    const data = await coaModel.listCoa(req.query)
    return success(res, data)
  } catch (error) {
    const mapped = mapModelError(error)
    return errorResponse(res, mapped.status, mapped.code, mapped.message)
  }
}

async function createCoa(req, res) {
  const errors = validateCoa(req.body, true)
  if (errors.length) {
    return errorResponse(res, 400, 'VALIDATION_ERROR', errors.join('; '))
  }

  try {
    const data = await coaModel.createCoa(buildCoaPayload(req.body, true))
    return success(res, data, 201)
  } catch (error) {
    const mapped = mapModelError(error)
    return errorResponse(res, mapped.status, mapped.code, mapped.message)
  }
}

async function updateCoa(req, res) {
  const errors = validateCoa(req.body, false)
  if (errors.length) {
    return errorResponse(res, 400, 'VALIDATION_ERROR', errors.join('; '))
  }

  try {
    const data = await coaModel.updateCoa(req.params.kodeSeg5, buildCoaPayload(req.body))

    if (!data) {
      return errorResponse(res, 404, 'NOT_FOUND', 'COA tidak ditemukan')
    }

    return success(res, data)
  } catch (error) {
    const mapped = mapModelError(error)
    return errorResponse(res, mapped.status, mapped.code, mapped.message)
  }
}

async function listBranches(req, res) {
  try {
    const data = await branchModel.listBranches(req.query)
    return success(res, data)
  } catch (error) {
    const mapped = mapModelError(error)
    return errorResponse(res, mapped.status, mapped.code, mapped.message)
  }
}

async function createBranch(req, res) {
  const errors = validateBranch(req.body, true)
  if (errors.length) {
    return errorResponse(res, 400, 'VALIDATION_ERROR', errors.join('; '))
  }

  try {
    const data = await branchModel.createBranch(buildBranchPayload(req.body))
    return success(res, data, 201)
  } catch (error) {
    const mapped = mapModelError(error)
    return errorResponse(res, mapped.status, mapped.code, mapped.message)
  }
}

async function updateBranch(req, res) {
  const errors = validateBranch(req.body, false)
  if (errors.length) {
    return errorResponse(res, 400, 'VALIDATION_ERROR', errors.join('; '))
  }

  try {
    const data = await branchModel.updateBranch(req.params.id, buildBranchPayload(req.body))

    if (!data) {
      return errorResponse(res, 404, 'NOT_FOUND', 'Cabang tidak ditemukan')
    }

    return success(res, data)
  } catch (error) {
    const mapped = mapModelError(error)
    return errorResponse(res, mapped.status, mapped.code, mapped.message)
  }
}

async function listUsers(req, res) {
  try {
    const data = await userModel.listUsers(req.query)
    return success(res, data)
  } catch (error) {
    const mapped = mapModelError(error)
    return errorResponse(res, mapped.status, mapped.code, mapped.message)
  }
}

async function createUser(req, res) {
  const errors = validateUser(req.body, true)
  if (errors.length) {
    return errorResponse(res, 400, 'VALIDATION_ERROR', errors.join('; '))
  }

  try {
    const data = await userModel.createUser(await buildUserPayload(req.body, true))
    return success(res, data, 201)
  } catch (error) {
    const mapped = mapModelError(error)
    return errorResponse(res, mapped.status, mapped.code, mapped.message)
  }
}

async function updateUser(req, res) {
  const errors = validateUser(req.body, false)
  if (errors.length) {
    return errorResponse(res, 400, 'VALIDATION_ERROR', errors.join('; '))
  }

  try {
    const data = await userModel.updateUser(req.params.id, await buildUserPayload(req.body))

    if (!data) {
      return errorResponse(res, 404, 'NOT_FOUND', 'User tidak ditemukan')
    }

    return success(res, data)
  } catch (error) {
    const mapped = mapModelError(error)
    return errorResponse(res, mapped.status, mapped.code, mapped.message)
  }
}

async function listSeg7(req, res) {
  try {
    const data = await masterSegModel.listSeg7(req.query)
    return success(res, data)
  } catch (error) {
    const mapped = mapModelError(error)
    return errorResponse(res, mapped.status, mapped.code, mapped.message)
  }
}

async function listSeg8(req, res) {
  try {
    const data = await masterSegModel.listSeg8(req.query)
    return success(res, data)
  } catch (error) {
    const mapped = mapModelError(error)
    return errorResponse(res, mapped.status, mapped.code, mapped.message)
  }
}

async function listSeg9(req, res) {
  try {
    const data = await masterSegModel.listSeg9(req.query)
    return success(res, data)
  } catch (error) {
    const mapped = mapModelError(error)
    return errorResponse(res, mapped.status, mapped.code, mapped.message)
  }
}

module.exports = {
  listCoa,
  createCoa,
  updateCoa,
  listBranches,
  createBranch,
  updateBranch,
  listUsers,
  createUser,
  updateUser,
  listSeg7,
  listSeg8,
  listSeg9
}
