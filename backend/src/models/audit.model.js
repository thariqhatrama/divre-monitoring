const supabase = require('../db/supabase')

const AUDIT_SELECT = `
  id,
  tabel,
  record_id,
  aksi,
  nilai_lama,
  nilai_baru,
  user_id,
  waktu
`

async function listAuditLogs(filters = {}) {
  const limit = Math.min(Number(filters.limit) || 100, 200)
  let query = supabase
    .from('audit_log')
    .select(AUDIT_SELECT)
    .in('tabel', ['rab_items', 'realisasi_items'])
    .order('waktu', { ascending: false })
    .limit(limit)

  if (filters.tabel && ['rab_items', 'realisasi_items'].includes(filters.tabel)) {
    query = query.eq('tabel', filters.tabel)
  }

  if (filters.aksi && ['INSERT', 'UPDATE', 'DELETE'].includes(filters.aksi)) {
    query = query.eq('aksi', filters.aksi)
  }

  const { data, error } = await query

  if (error) {
    throw error
  }

  const userIds = [...new Set((data || []).map((item) => item.user_id).filter(Boolean))]
  const usersById = {}

  if (userIds.length) {
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, nama, email, role')
      .in('id', userIds)

    if (userError) {
      throw userError
    }

    for (const user of users || []) {
      usersById[user.id] = user
    }
  }

  return (data || []).map((item) => ({
    ...item,
    user: usersById[item.user_id] || null
  }))
}

module.exports = {
  listAuditLogs
}
