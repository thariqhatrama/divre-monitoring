const KATEGORI_RAB = ['I', 'II', 'III', 'IV', 'V', 'VI']
const SUBKON_ACCOUNT = '4422'

function toNumber(value) {
  const numberValue = Number(value || 0)
  return Number.isFinite(numberValue) ? numberValue : 0
}

function roundPercent(value) {
  if (!Number.isFinite(value)) return null
  return Math.round(value * 100) / 100
}

function getMarginStatus(marginPercent) {
  if (!Number.isFinite(marginPercent)) return null
  if (marginPercent >= 15) return 'aman'
  if (marginPercent >= 6) return 'perhatian'
  if (marginPercent >= 0) return 'kritis'
  return 'rugi'
}

function sumRabTotals(items = []) {
  const totalsByKategori = Object.fromEntries(KATEGORI_RAB.map((kategori) => [kategori, 0]))
  let totalRabIdr = 0
  let totalSubkon4422Idr = 0

  for (const item of items) {
    const total = toNumber(item.total_idr)
    totalsByKategori[item.kategori] = (totalsByKategori[item.kategori] || 0) + total
    totalRabIdr += total

    if (String(item.kode_akun_seg5) === SUBKON_ACCOUNT) {
      totalSubkon4422Idr += total
    }
  }

  return {
    totals_by_kategori: totalsByKategori,
    total_rab_idr: totalRabIdr,
    total_subkon_4422_idr: totalSubkon4422Idr
  }
}

function calculateProjectValueIdr(project) {
  const nilaiProyek = toNumber(project?.nilai_proyek)
  const kursIdr = toNumber(project?.kurs_idr_proyek || 1) || 1

  return Math.round(nilaiProyek * kursIdr)
}

function calculateRabMargin(project, items = []) {
  const nilaiProyekIdr = calculateProjectValueIdr(project)
  const totals = sumRabTotals(items)

  if (nilaiProyekIdr <= 0) {
    return {
      ...totals,
      nilai_proyek_idr: nilaiProyekIdr,
      margin_idr: null,
      margin_persen: null,
      status_margin: null,
      persen_subkon: null
    }
  }

  const marginIdr = nilaiProyekIdr - totals.total_rab_idr
  const marginPersen = roundPercent((marginIdr / nilaiProyekIdr) * 100)
  const persenSubkon = roundPercent((totals.total_subkon_4422_idr / nilaiProyekIdr) * 100)

  return {
    ...totals,
    nilai_proyek_idr: nilaiProyekIdr,
    margin_idr: marginIdr,
    margin_persen: marginPersen,
    status_margin: getMarginStatus(marginPersen),
    persen_subkon: persenSubkon
  }
}

function sumRealisasiTotals(items = []) {
  let totalRealisasiIdr = 0

  for (const item of items) {
    totalRealisasiIdr += toNumber(item.total_idr)
  }

  return {
    total_realisasi_idr: totalRealisasiIdr
  }
}

function calculateRealisasiMargin(project, rabItems = [], realisasiItems = []) {
  const rabMargin = calculateRabMargin(project, rabItems)
  const totals = sumRealisasiTotals(realisasiItems)
  const nilaiProyekIdr = rabMargin.nilai_proyek_idr

  if (nilaiProyekIdr <= 0) {
    return {
      margin_rab: rabMargin,
      ...totals,
      margin_idr: null,
      margin_persen: null,
      delta_margin: null,
      status_margin: null
    }
  }

  const marginIdr = nilaiProyekIdr - totals.total_realisasi_idr
  const marginPersen = roundPercent((marginIdr / nilaiProyekIdr) * 100)
  const deltaMargin = Number.isFinite(rabMargin.margin_persen)
    ? roundPercent(marginPersen - rabMargin.margin_persen)
    : null

  return {
    margin_rab: rabMargin,
    ...totals,
    nilai_proyek_idr: nilaiProyekIdr,
    margin_idr: marginIdr,
    margin_persen: marginPersen,
    delta_margin: deltaMargin,
    status_margin: getMarginStatus(marginPersen)
  }
}

module.exports = {
  getMarginStatus,
  sumRabTotals,
  calculateProjectValueIdr,
  calculateRabMargin,
  sumRealisasiTotals,
  calculateRealisasiMargin
}
