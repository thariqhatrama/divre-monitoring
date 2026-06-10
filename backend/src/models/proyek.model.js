const supabase = require('../db/supabase')

const PROJECT_SELECT = `
  id,
  nama,
  nomor_spmk,
  seg11_no,
  cabang_id,
  cabang:branches(id, kode_seg23, nama, tipe),
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

function applyProjectFilters(query, filters = {}) {
  if (filters.status) {
    query = query.eq('status', filters.status)
  } else if (filters.include_arsip !== 'true') {
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

  if (filters.q) {
    query = query.or(`nama.ilike.%${filters.q}%,klien.ilike.%${filters.q}%,nomor_spmk.ilike.%${filters.q}%`)
  }

  return query
}

function withRabGate(project) {
  if (!project) {
    return project
  }

  return {
    ...project,
    rab_locked: !project.seg11_no
  }
}

async function listProjects(filters = {}) {
  let query = supabase
    .from('projects')
    .select(PROJECT_SELECT)
    .order('created_at', { ascending: false })

  query = applyProjectFilters(query, filters)

  const { data, error } = await query

  if (error) {
    throw error
  }

  return data.map(withRabGate)
}

async function findProjectById(id) {
  const { data, error } = await supabase
    .from('projects')
    .select(PROJECT_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error) {
    throw error
  }

  return withRabGate(data)
}

async function createProject(payload) {
  const { data, error } = await supabase
    .from('projects')
    .insert(payload)
    .select(PROJECT_SELECT)
    .single()

  if (error) {
    throw error
  }

  return withRabGate(data)
}

async function updateProject(id, payload) {
  const { data, error } = await supabase
    .from('projects')
    .update(payload)
    .eq('id', id)
    .select(PROJECT_SELECT)
    .maybeSingle()

  if (error) {
    throw error
  }

  return withRabGate(data)
}

async function archiveProject(id) {
  return updateProject(id, { status: 'arsip' })
}

module.exports = {
  listProjects,
  findProjectById,
  createProject,
  updateProject,
  archiveProject
}
