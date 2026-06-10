const supabase = require('../db/supabase')

function applyUserFilters(query, filters = {}) {
  if (filters.role) {
    query = query.eq('role', filters.role)
  }

  if (filters.aktif === 'true') {
    query = query.eq('aktif', true)
  }

  if (filters.aktif === 'false') {
    query = query.eq('aktif', false)
  }

  if (filters.cabang_id) {
    query = query.eq('cabang_id', filters.cabang_id)
  }

  if (filters.q) {
    query = query.or(`nama.ilike.%${filters.q}%,email.ilike.%${filters.q}%`)
  }

  return query
}

async function findUserByEmail(email) {
  const { data, error } = await supabase
    .from('users')
    .select('id, nama, email, password_hash, role, cabang_id, aktif, cabang:branches(id, kode_seg23, nama, tipe)')
    .eq('email', email)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

async function findUserById(id) {
  const { data, error } = await supabase
    .from('users')
    .select('id, nama, email, role, cabang_id, aktif, cabang:branches(id, kode_seg23, nama, tipe)')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

async function listUsers(filters = {}) {
  let query = supabase
    .from('users')
    .select('id, nama, email, role, cabang_id, aktif, created_at, updated_at, cabang:branches(id, kode_seg23, nama, tipe)')
    .order('nama', { ascending: true })

  query = applyUserFilters(query, filters)

  const { data, error } = await query

  if (error) {
    throw error
  }

  return data
}

async function createUser(payload) {
  const { data, error } = await supabase
    .from('users')
    .insert(payload)
    .select('id, nama, email, role, cabang_id, aktif, created_at, updated_at, cabang:branches(id, kode_seg23, nama, tipe)')
    .single()

  if (error) {
    throw error
  }

  return data
}

async function updateUser(id, payload) {
  const { data, error } = await supabase
    .from('users')
    .update(payload)
    .eq('id', id)
    .select('id, nama, email, role, cabang_id, aktif, created_at, updated_at, cabang:branches(id, kode_seg23, nama, tipe)')
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

module.exports = {
  findUserByEmail,
  findUserById,
  listUsers,
  createUser,
  updateUser
}
