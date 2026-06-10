const supabase = require('../db/supabase')

async function listKursHistory() {
  const { data, error } = await supabase
    .from('kurs_history')
    .select('id, mata_uang, kurs_idr, berlaku_mulai, dibuat_oleh, created_at')
    .eq('mata_uang', 'USD')
    .order('berlaku_mulai', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(25)

  if (error) {
    throw error
  }

  return data
}

async function getLatestKurs() {
  const { data, error } = await supabase
    .from('kurs_history')
    .select('id, mata_uang, kurs_idr, berlaku_mulai, dibuat_oleh, created_at')
    .eq('mata_uang', 'USD')
    .order('berlaku_mulai', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

async function createKurs(payload) {
  const { data, error } = await supabase
    .from('kurs_history')
    .insert(payload)
    .select('id, mata_uang, kurs_idr, berlaku_mulai, dibuat_oleh, created_at')
    .single()

  if (error) {
    throw error
  }

  return data
}

module.exports = {
  listKursHistory,
  getLatestKurs,
  createKurs
}
