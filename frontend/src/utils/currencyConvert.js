export const SUPPORTED_CURRENCIES = ['IDR', 'USD']

function toNumber(value) {
  const numberValue = Number(value || 0)
  return Number.isFinite(numberValue) ? numberValue : 0
}

export function normalizeCurrency(value) {
  const currency = String(value || 'IDR').trim().toUpperCase()
  return SUPPORTED_CURRENCIES.includes(currency) ? currency : 'IDR'
}

export function normalizeKurs(mataUang, kursIdr) {
  const currency = normalizeCurrency(mataUang)

  if (currency === 'IDR') return 1

  const numberValue = Number(kursIdr)
  if (!Number.isInteger(numberValue) || numberValue <= 1) return null

  return numberValue
}

export function convertToIDR(amount, mataUang, kursIdr) {
  const kurs = normalizeKurs(mataUang, kursIdr)
  if (!kurs) return 0

  return Math.round(toNumber(amount) * kurs)
}

export function calculateLineTotalIdr({ qty, harga_satuan, mata_uang, kurs_idr }) {
  const subtotal = toNumber(qty) * toNumber(harga_satuan)
  return convertToIDR(subtotal, mata_uang, kurs_idr)
}

export function calculateNilaiIdr({ nilai, mata_uang, kurs_idr }) {
  return convertToIDR(nilai, mata_uang, kurs_idr)
}
