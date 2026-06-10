const kursModel = require('../models/kurs.model')

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10)
}

function normalizeCurrency(mataUang = 'USD') {
  return String(mataUang || 'USD').trim().toUpperCase()
}

function normalizeInteger(value) {
  if (value === undefined || value === null || value === '') return value
  if (typeof value === 'number') return Number.isInteger(value) ? value : NaN
  if (typeof value === 'string' && /^\d+$/.test(value.trim())) return Number(value.trim())
  return NaN
}

function validateSupportedCurrency(mataUang) {
  const currency = normalizeCurrency(mataUang)

  if (!['IDR', 'USD'].includes(currency)) {
    const error = new Error('mata_uang hanya mendukung IDR atau USD')
    error.status = 400
    error.code = 'VALIDATION_ERROR'
    throw error
  }

  return currency
}

function validateKursInput(mataUang, kursIdr) {
  const currency = validateSupportedCurrency(mataUang)
  const kurs = normalizeInteger(kursIdr)

  if (currency === 'IDR') {
    return { mata_uang: currency, kurs_idr: 1 }
  }

  if (!Number.isInteger(kurs) || kurs <= 1) {
    const error = new Error('kurs_idr wajib integer lebih dari 1 untuk USD')
    error.status = 400
    error.code = 'VALIDATION_ERROR'
    throw error
  }

  return { mata_uang: currency, kurs_idr: kurs }
}

function idrKurs() {
  return {
    id: null,
    mata_uang: 'IDR',
    kurs_idr: 1,
    berlaku_mulai: todayIsoDate(),
    dibuat_oleh: null,
    created_at: null
  }
}

async function getLatestKurs(mataUang = 'USD') {
  const currency = validateSupportedCurrency(mataUang)

  if (currency === 'IDR') {
    return idrKurs()
  }

  const latest = await kursModel.getLatestKurs()

  if (!latest || Number(latest.kurs_idr) <= 1) {
    const error = new Error('Kurs USD terbaru belum tersedia')
    error.status = 404
    error.code = 'KURS_NOT_FOUND'
    throw error
  }

  return latest
}

async function listKursHistory(mataUang = 'USD') {
  const currency = validateSupportedCurrency(mataUang)

  if (currency === 'IDR') {
    return [idrKurs()]
  }

  return kursModel.listKursHistory()
}

async function resolveInputKurs(mataUang, kursIdr) {
  const currency = validateSupportedCurrency(mataUang)

  if (currency === 'IDR') {
    return 1
  }

  if (kursIdr === undefined || kursIdr === null || kursIdr === '') {
    const latest = await getLatestKurs('USD')
    return Number(latest.kurs_idr)
  }

  return validateKursInput('USD', kursIdr).kurs_idr
}

async function createKurs({ mata_uang = 'USD', kurs_idr, berlaku_mulai, dibuat_oleh }) {
  const normalized = validateKursInput(mata_uang, kurs_idr)

  if (normalized.mata_uang === 'IDR') {
    const error = new Error('Kurs IDR selalu 1 dan tidak perlu disimpan')
    error.status = 400
    error.code = 'VALIDATION_ERROR'
    throw error
  }

  return kursModel.createKurs({
    mata_uang: normalized.mata_uang,
    kurs_idr: normalized.kurs_idr,
    berlaku_mulai: berlaku_mulai || todayIsoDate(),
    dibuat_oleh
  })
}

module.exports = {
  getLatestKurs,
  listKursHistory,
  resolveInputKurs,
  createKurs,
  validateKursInput
}
