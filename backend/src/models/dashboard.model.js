const supabase = require('../db/supabase')

const PROJECT_SELECT = `
  id,
  nama,
  nomor_spmk,
  seg11_no,
  cabang_id,
  klien,
  nilai_proyek,
  mata_uang_proyek,
  kurs_idr_proyek,
  tgl_mulai,
  tgl_selesai,
  portofolio_seg7,
  sub_portofolio_seg8,
  pmu_kso_seg9,
  pm_user_id,
  status,
  created_by,
  created_at,
  updated_at
`

const RAB_SELECT = 'id, project_id, kategori, kode_akun_seg5, total_idr'
const REALISASI_SELECT = 'id, rab_item_id, project_id, total_idr'

function applyDashboardFilters(query, filters = {}) {
  if (filters.status) {
    query = query.eq('status', filters.status)
  } else {
    query = query.neq('status', 'arsip')
  }

  if (filters.cabang_id) {
    query = query.eq('cabang_id', filters.cabang_id)
  }

  if (filters.tahun) {
    const year = Number(filters.tahun)
    if (Number.isInteger(year)) {
      query = query.gte('tgl_mulai', `${year}-01-01`).lte('tgl_mulai', `${year}-12-31`)
    }
  }

  return query
}

async function listDashboardProjects(filters = {}) {
  let query = supabase
    .from('projects')
    .select(PROJECT_SELECT)
    .order('created_at', { ascending: false })

  query = applyDashboardFilters(query, filters)

  const { data, error } = await query

  if (error) {
    throw error
  }

  return data
}

async function listBranches() {
  const { data, error } = await supabase
    .from('branches')
    .select('id, kode_seg23, nama, tipe, parent_id')
    .order('kode_seg23', { ascending: true })

  if (error) {
    throw error
  }

  return data
}

async function listRabItemsByProjectIds(projectIds = []) {
  if (!projectIds.length) {
    return []
  }

  const { data, error } = await supabase
    .from('rab_items')
    .select(RAB_SELECT)
    .in('project_id', projectIds)

  if (error) {
    throw error
  }

  return data
}

async function listRealisasiItemsByProjectIds(projectIds = []) {
  if (!projectIds.length) {
    return []
  }

  const { data, error } = await supabase
    .from('realisasi_items')
    .select(REALISASI_SELECT)
    .in('project_id', projectIds)

  if (error) {
    throw error
  }

  return data
}

module.exports = {
  listDashboardProjects,
  listBranches,
  listRabItemsByProjectIds,
  listRealisasiItemsByProjectIds
}
