const supabase = require('../db/supabase')

function applyCoaFilters(query, filters = {}) {
  if (filters.aktif === 'true') {
    query = query.eq('aktif', true)
  }

  if (filters.aktif === 'false') {
    query = query.eq('aktif', false)
  }

  if (filters.kategori_rab) {
    query = query.eq('kategori_rab', filters.kategori_rab)
  }

  if (filters.q) {
    query = query.or(`kode_seg5.ilike.%${filters.q}%,nama.ilike.%${filters.q}%`)
  }

  return query
}

async function listCoa(filters = {}) {
  let query = supabase
    .from('coa_accounts')
    .select('kode_seg5, nama, seg4_default, kategori_rab, tipe_fv, aktif, updated_at')
    .order('kode_seg5', { ascending: true })

  query = applyCoaFilters(query, filters)

  const { data, error } = await query

  if (error) {
    throw error
  }

  return data
}

async function createCoa(payload) {
  const { data, error } = await supabase
    .from('coa_accounts')
    .insert(payload)
    .select('kode_seg5, nama, seg4_default, kategori_rab, tipe_fv, aktif, updated_at')
    .single()

  if (error) {
    throw error
  }

  return data
}

async function updateCoa(kodeSeg5, payload) {
  const { data, error } = await supabase
    .from('coa_accounts')
    .update(payload)
    .eq('kode_seg5', kodeSeg5)
    .select('kode_seg5, nama, seg4_default, kategori_rab, tipe_fv, aktif, updated_at')
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

async function findActiveCoaByKode(kodeSeg5) {
  const { data, error } = await supabase
    .from('coa_accounts')
    .select('kode_seg5, nama, seg4_default, kategori_rab, tipe_fv, aktif, updated_at')
    .eq('kode_seg5', kodeSeg5)
    .eq('aktif', true)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

module.exports = {
  listCoa,
  createCoa,
  updateCoa,
  findActiveCoaByKode
}
