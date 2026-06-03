const supabase = require('../db/supabase')

async function findUserByEmail(email) {
  const { data, error } = await supabase
    .from('users')
    .select('id, nama, email, password_hash, role, cabang_id, aktif')
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
    .select('id, nama, email, role, cabang_id, aktif')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

module.exports = {
  findUserByEmail,
  findUserById
}
