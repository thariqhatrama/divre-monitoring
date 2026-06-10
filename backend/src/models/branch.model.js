const supabase = require('../db/supabase')

function applyBranchFilters(query, filters = {}) {
  if (filters.tipe) {
    query = query.eq('tipe', filters.tipe)
  }

  if (filters.parent_id) {
    query = query.eq('parent_id', filters.parent_id)
  }

  if (filters.q) {
    query = query.or(`kode_seg23.ilike.%${filters.q}%,nama.ilike.%${filters.q}%`)
  }

  return query
}

async function listBranches(filters = {}) {
  let query = supabase
    .from('branches')
    .select('id, kode_seg23, nama, tipe, parent_id, updated_at')
    .order('kode_seg23', { ascending: true })

  query = applyBranchFilters(query, filters)

  const { data, error } = await query

  if (error) {
    throw error
  }

  return data
}

async function createBranch(payload) {
  const { data, error } = await supabase
    .from('branches')
    .insert(payload)
    .select('id, kode_seg23, nama, tipe, parent_id, updated_at')
    .single()

  if (error) {
    throw error
  }

  return data
}

async function updateBranch(id, payload) {
  const { data, error } = await supabase
    .from('branches')
    .update(payload)
    .eq('id', id)
    .select('id, kode_seg23, nama, tipe, parent_id, updated_at')
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

module.exports = {
  listBranches,
  createBranch,
  updateBranch
}
