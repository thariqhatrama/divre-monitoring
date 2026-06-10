const supabase = require('../db/supabase')

const REALISASI_SELECT = `
  id,
  rab_item_id,
  project_id,
  tanggal_realisasi,
  qty,
  satuan,
  mata_uang,
  harga_satuan,
  kurs_idr,
  total_idr,
  catatan,
  created_by,
  created_at,
  updated_at
`

async function listRealisasiByProject(projectId) {
  const { data, error } = await supabase
    .from('realisasi_items')
    .select(REALISASI_SELECT)
    .eq('project_id', projectId)
    .order('tanggal_realisasi', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data
}

async function findRealisasiById(id) {
  const { data, error } = await supabase
    .from('realisasi_items')
    .select(REALISASI_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

async function createRealisasi(payload) {
  const { data, error } = await supabase
    .from('realisasi_items')
    .insert(payload)
    .select(REALISASI_SELECT)
    .single()

  if (error) {
    throw error
  }

  return data
}

async function updateRealisasi(id, payload) {
  const { data, error } = await supabase
    .from('realisasi_items')
    .update(payload)
    .eq('id', id)
    .select(REALISASI_SELECT)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

async function deleteRealisasi(id) {
  const { data, error } = await supabase
    .from('realisasi_items')
    .delete()
    .eq('id', id)
    .select(REALISASI_SELECT)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

async function createAuditLog({ tabel, record_id, aksi, nilai_lama, nilai_baru, user_id }) {
  const { data, error } = await supabase
    .from('audit_log')
    .insert({ tabel, record_id, aksi, nilai_lama, nilai_baru, user_id })
    .select('id, tabel, record_id, aksi, user_id, waktu')
    .single()

  if (error) {
    throw error
  }

  return data
}

module.exports = {
  listRealisasiByProject,
  findRealisasiById,
  createRealisasi,
  updateRealisasi,
  deleteRealisasi,
  createAuditLog
}
