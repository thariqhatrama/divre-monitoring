function toNumber(value) {
  const numberValue = Number(value || 0)
  return Number.isFinite(numberValue) ? numberValue : 0
}

export function calculateLineTotalIdr({ qty, harga_satuan }) {
  return Math.round(toNumber(qty) * toNumber(harga_satuan))
}

export function calculateNilaiIdr({ nilai }) {
  return Math.round(toNumber(nilai))
}
