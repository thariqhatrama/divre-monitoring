const supabase = require('../db/supabase')

const RAB_SELECT = `
  id,
  project_id,
  kategori,
  kode_akun_seg5,
  seg4_kode,
  uraian,
  qty,
  satuan,
  mata_uang,
  harga_satuan,
  kurs_idr,
  total_idr,
  updated_by,
  created_at,
  updated_at
`

async function listRabItemsByProject(projectId) {
  const { data, error } = await supabase
    .from('rab_items')
    .select(RAB_SELECT)
    .eq('project_id', projectId)
    .order('kategori', { ascending: true })
    .order('updated_at', { ascending: false })

  if (error) {
    throw error
  }

  return data
}

async function findRabItemById(itemId) {
  const { data, error } = await supabase
    .from('rab_items')
    .select(RAB_SELECT)
    .eq('id', itemId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

async function createRabItem(projectId, payload) {
  const { data, error } = await supabase
    .from('rab_items')
    .insert({ ...payload, project_id: projectId })
    .select(RAB_SELECT)
    .single()

  if (error) {
    throw error
  }

  return data
}

async function updateRabItem(itemId, payload) {
  const { data, error } = await supabase
    .from('rab_items')
    .update(payload)
    .eq('id', itemId)
    .select(RAB_SELECT)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

async function deleteRabItem(itemId) {
  const { data, error } = await supabase
    .from('rab_items')
    .delete()
    .eq('id', itemId)
    .select(RAB_SELECT)
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
  listRabItemsByProject,
  findRabItemById,
  createRabItem,
  updateRabItem,
  deleteRabItem,
  createAuditLog
}
