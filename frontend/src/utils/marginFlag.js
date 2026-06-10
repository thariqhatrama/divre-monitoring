export function getMarginStatus(marginPercent) {
  const numberValue = Number(marginPercent)

  if (!Number.isFinite(numberValue)) return null
  if (numberValue >= 15) return 'aman'
  if (numberValue >= 6) return 'perhatian'
  if (numberValue >= 0) return 'kritis'
  return 'rugi'
}

export function getMarginStatusLabel(status) {
  const labels = {
    aman: 'Aman',
    perhatian: 'Perhatian',
    kritis: 'Kritis',
    rugi: 'Rugi'
  }

  return labels[status] || 'Belum dihitung'
}

export function getMarginStatusClass(status) {
  const classes = {
    aman: 'status-aman',
    perhatian: 'status-perhatian',
    kritis: 'status-kritis',
    rugi: 'status-rugi'
  }

  return classes[status] || 'status-draft'
}

export function calculateRabMargin({ nilaiProyekIdr, totalRabIdr }) {
  const nilai = Number(nilaiProyekIdr || 0)
  const totalRab = Number(totalRabIdr || 0)

  if (!Number.isFinite(nilai) || nilai <= 0) {
    return {
      margin_idr: null,
      margin_persen: null,
      status_margin: null
    }
  }

  const marginIdr = nilai - totalRab
  const marginPersen = Math.round(((marginIdr / nilai) * 100) * 100) / 100

  return {
    margin_idr: marginIdr,
    margin_persen: marginPersen,
    status_margin: getMarginStatus(marginPersen)
  }
}
