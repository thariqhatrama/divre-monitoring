const supabase = require('../db/supabase');

const applySegFilters = (query, filters = {}) => {
  if (filters.aktif) {
    query = query.eq('aktif', filters.aktif === 'true');
  }
  return query;
};

const listSeg7 = async (filters = {}) => {
  let query = supabase
    .from('master_seg7')
    .select('*')
    .order('kode', { ascending: true });

  query = applySegFilters(query, filters);

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

const listSeg8 = async (filters = {}) => {
  let query = supabase
    .from('master_seg8')
    .select('*')
    .order('kode', { ascending: true });

  query = applySegFilters(query, filters);

  if (filters.parent_kode) {
    query = query.eq('parent_kode', filters.parent_kode);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

const listSeg9 = async (filters = {}) => {
  let query = supabase
    .from('master_seg9')
    .select('*')
    .order('kode', { ascending: true });

  query = applySegFilters(query, filters);

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

module.exports = {
  listSeg7,
  listSeg8,
  listSeg9,
};
