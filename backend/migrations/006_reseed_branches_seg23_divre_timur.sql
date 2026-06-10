-- 006_reseed_branches_seg23_divre_timur.sql
-- Dashboard Monitoring Margin Proyek Divre Timur
-- Reseed master branches berdasarkan COA Tahun 2025 sheet "Seg 2 & 3".
-- Scope: Regional Timur saja. Kode lama (SBA/BJM/UP-*) tidak dihapus, tetapi
-- dinonaktifkan setelah FK users/projects dimigrasikan ke kode resmi.

ALTER TABLE branches
ADD COLUMN IF NOT EXISTS aktif boolean NOT NULL DEFAULT true;

-- =========================================================
-- 1. Parent Seg 2 Divre Timur (nonaktif untuk dropdown; parent relasi saja)
-- =========================================================

INSERT INTO branches (kode_seg23, nama, tipe, parent_id, aktif)
VALUES
  ('56', 'Cabang Balikpapan', 'cabang', NULL, false),
  ('57', 'Cabang Banjarmasin', 'cabang', NULL, false),
  ('58', 'Cabang Samarinda', 'cabang', NULL, false),
  ('59', 'Cabang Bontang', 'cabang', NULL, false),
  ('60', 'Cabang Pontianak', 'cabang', NULL, false),
  ('61', 'Cabang Sangatta', 'cabang', NULL, false),
  ('62', 'Cabang Batulicin', 'cabang', NULL, false),
  ('63', 'Cabang Tarakan', 'cabang', NULL, false),
  ('71', 'Cabang Surabaya', 'cabang', NULL, false),
  ('73', 'Cabang Makasar', 'cabang', NULL, false),
  ('74', 'Cabang Timika', 'cabang', NULL, false),
  ('75', 'Cabang Denpasar', 'cabang', NULL, false),
  ('77', 'Cabang Kendari', 'cabang', NULL, false)
ON CONFLICT (kode_seg23) DO UPDATE SET
  nama = EXCLUDED.nama,
  tipe = EXCLUDED.tipe,
  parent_id = EXCLUDED.parent_id,
  aktif = EXCLUDED.aktif;

-- =========================================================
-- 2. Child Seg 2.3 resmi Divre Timur (aktif untuk dropdown/project/user)
--    Seg 3 = 01 dianggap cabang operasional utama, Seg 3 > 01 unit pelayanan.
--    Kode kosong dari COA (57.05, 73.02, 73.06) tidak dimasukkan.
-- =========================================================

INSERT INTO branches (kode_seg23, nama, tipe, parent_id, aktif)
VALUES
  ('56.01', 'Balikpapan', 'cabang', NULL, true),
  ('56.02', 'Tanah Grogot', 'unit_pelayanan', NULL, true),

  ('57.01', 'Banjarmasin', 'cabang', NULL, true),
  ('57.02', 'Kelanis', 'unit_pelayanan', NULL, true),
  ('57.03', 'Ampah', 'unit_pelayanan', NULL, true),
  ('57.04', 'Sungai Putting', 'unit_pelayanan', NULL, true),
  ('57.06', 'Sampit', 'unit_pelayanan', NULL, true),

  ('58.01', 'Samarinda', 'cabang', NULL, true),
  ('58.02', 'Dondang', 'unit_pelayanan', NULL, true),
  ('58.03', 'Muara Badak', 'unit_pelayanan', NULL, true),

  ('59.01', 'Bontang', 'cabang', NULL, true),

  ('60.01', 'Pontianak', 'cabang', NULL, true),
  ('60.02', 'Kendawangan', 'unit_pelayanan', NULL, true),
  ('60.03', 'Pangkalan Bun', 'unit_pelayanan', NULL, true),

  ('61.01', 'Sangatta', 'cabang', NULL, true),
  ('61.02', 'Bengalon', 'unit_pelayanan', NULL, true),
  ('61.03', 'Sangkulirang', 'unit_pelayanan', NULL, true),

  ('62.01', 'Batulicin', 'cabang', NULL, true),
  ('62.02', 'IBT', 'unit_pelayanan', NULL, true),
  ('62.03', 'Sungai Danau', 'unit_pelayanan', NULL, true),

  ('63.01', 'Tarakan', 'cabang', NULL, true),
  ('63.02', 'Berau', 'unit_pelayanan', NULL, true),
  ('63.03', 'Sesayap', 'unit_pelayanan', NULL, true),
  ('63.04', 'Sebakis', 'unit_pelayanan', NULL, true),

  ('71.01', 'Surabaya', 'cabang', NULL, true),
  ('71.02', 'Gresik', 'unit_pelayanan', NULL, true),
  ('71.03', 'Unit Laboratorium Surabaya', 'unit_pelayanan', NULL, true),

  ('73.01', 'Makasar', 'cabang', NULL, true),
  ('73.03', 'Palu', 'unit_pelayanan', NULL, true),
  ('73.04', 'Manado', 'unit_pelayanan', NULL, true),
  ('73.05', 'Ambon', 'unit_pelayanan', NULL, true),
  ('73.07', 'Maluku Utara', 'unit_pelayanan', NULL, true),

  ('74.01', 'Timika', 'cabang', NULL, true),
  ('74.02', 'Jayapura', 'unit_pelayanan', NULL, true),
  ('74.03', 'Sorong', 'unit_pelayanan', NULL, true),

  ('75.01', 'Denpasar', 'cabang', NULL, true),
  ('75.02', 'Benete', 'unit_pelayanan', NULL, true),
  ('75.03', 'Lombok', 'unit_pelayanan', NULL, true),

  ('77.01', 'Kendari', 'cabang', NULL, true),
  ('77.02', 'Morowali', 'unit_pelayanan', NULL, true)
ON CONFLICT (kode_seg23) DO UPDATE SET
  nama = EXCLUDED.nama,
  tipe = EXCLUDED.tipe,
  aktif = EXCLUDED.aktif;

-- Set parent_id child ke parent Seg 2.
UPDATE branches child
SET parent_id = parent.id
FROM branches parent
WHERE child.kode_seg23 LIKE '%.%'
  AND parent.kode_seg23 = split_part(child.kode_seg23, '.', 1)
  AND child.kode_seg23 IN (
    '56.01','56.02',
    '57.01','57.02','57.03','57.04','57.06',
    '58.01','58.02','58.03',
    '59.01',
    '60.01','60.02','60.03',
    '61.01','61.02','61.03',
    '62.01','62.02','62.03',
    '63.01','63.02','63.03','63.04',
    '71.01','71.02','71.03',
    '73.01','73.03','73.04','73.05','73.07',
    '74.01','74.02','74.03',
    '75.01','75.02','75.03',
    '77.01','77.02'
  );

-- =========================================================
-- 3. Migrasi FK dari kode lama repo ke kode resmi COA.
--    Catatan: beberapa UP lama ternyata parent-nya tertukar dibanding COA resmi;
--    mapping mengikuti kode resmi COA, bukan parent lama.
-- =========================================================

WITH code_map(old_code, new_code) AS (
  VALUES
    ('BPP', '56.01'),
    ('UP-BPP-TGT', '56.02'),

    ('BJM', '57.01'),
    ('UP-BJM-KLN', '57.02'),
    ('UP-BJM-AMP', '57.03'),
    ('UP-BJM-SGP', '57.04'),
    ('UP-BJM-SPT', '57.06'),

    ('SMD', '58.01'),
    ('UP-PTK-DDG', '58.02'),
    ('UP-PTK-MBD', '58.03'),

    ('BTG', '59.01'),

    ('PTK', '60.01'),
    ('UP-SMD-KDW', '60.02'),
    ('UP-SMD-PKB', '60.03'),

    ('SGT', '61.01'),
    ('UP-SGT-BGL', '61.02'),
    ('UP-SGT-SKL', '61.03'),

    ('BTL', '62.01'),
    ('UP-BTL-IBT', '62.02'),
    ('UP-BTL-SDN', '62.03'),

    ('TRK', '63.01'),
    ('UP-TRK-BRU', '63.02'),
    ('UP-TRK-SSY', '63.03'),
    ('UP-TRK-SBK', '63.04'),

    ('SBA', '71.01'),
    ('UP-SBA-GSK', '71.02'),

    ('MKS', '73.01'),
    ('UP-MKS-PLU', '73.03'),
    ('UP-MKS-MND', '73.04'),
    ('UP-MKS-AMB', '73.05'),
    ('UP-MKS-MLU', '73.07'),

    ('TMK', '74.01'),
    ('UP-TMK-JYP', '74.02'),
    ('UP-TMK-SRG', '74.03'),

    ('DPS', '75.01'),
    ('UP-DPS-BNT', '75.02'),
    ('UP-DPS-LBK', '75.03'),

    ('KDR', '77.01'),
    ('UP-KDR-MRW', '77.02')
), resolved AS (
  SELECT old_branch.id AS old_id, new_branch.id AS new_id
  FROM code_map
  JOIN branches old_branch ON old_branch.kode_seg23 = code_map.old_code
  JOIN branches new_branch ON new_branch.kode_seg23 = code_map.new_code
)
UPDATE projects
SET cabang_id = resolved.new_id
FROM resolved
WHERE projects.cabang_id = resolved.old_id;

WITH code_map(old_code, new_code) AS (
  VALUES
    ('BPP', '56.01'),
    ('UP-BPP-TGT', '56.02'),
    ('BJM', '57.01'),
    ('UP-BJM-KLN', '57.02'),
    ('UP-BJM-AMP', '57.03'),
    ('UP-BJM-SGP', '57.04'),
    ('UP-BJM-SPT', '57.06'),
    ('SMD', '58.01'),
    ('UP-PTK-DDG', '58.02'),
    ('UP-PTK-MBD', '58.03'),
    ('BTG', '59.01'),
    ('PTK', '60.01'),
    ('UP-SMD-KDW', '60.02'),
    ('UP-SMD-PKB', '60.03'),
    ('SGT', '61.01'),
    ('UP-SGT-BGL', '61.02'),
    ('UP-SGT-SKL', '61.03'),
    ('BTL', '62.01'),
    ('UP-BTL-IBT', '62.02'),
    ('UP-BTL-SDN', '62.03'),
    ('TRK', '63.01'),
    ('UP-TRK-BRU', '63.02'),
    ('UP-TRK-SSY', '63.03'),
    ('UP-TRK-SBK', '63.04'),
    ('SBA', '71.01'),
    ('UP-SBA-GSK', '71.02'),
    ('MKS', '73.01'),
    ('UP-MKS-PLU', '73.03'),
    ('UP-MKS-MND', '73.04'),
    ('UP-MKS-AMB', '73.05'),
    ('UP-MKS-MLU', '73.07'),
    ('TMK', '74.01'),
    ('UP-TMK-JYP', '74.02'),
    ('UP-TMK-SRG', '74.03'),
    ('DPS', '75.01'),
    ('UP-DPS-BNT', '75.02'),
    ('UP-DPS-LBK', '75.03'),
    ('KDR', '77.01'),
    ('UP-KDR-MRW', '77.02')
), resolved AS (
  SELECT old_branch.id AS old_id, new_branch.id AS new_id
  FROM code_map
  JOIN branches old_branch ON old_branch.kode_seg23 = code_map.old_code
  JOIN branches new_branch ON new_branch.kode_seg23 = code_map.new_code
)
UPDATE users
SET cabang_id = resolved.new_id
FROM resolved
WHERE users.cabang_id = resolved.old_id;

-- =========================================================
-- 4. Nonaktifkan kode lama non-COA agar tidak muncul di dropdown baru.
-- =========================================================

UPDATE branches
SET aktif = false
WHERE kode_seg23 IN (
  'SBA','BJM','BPP','MKS','SMD','SGT','BTL','BTG','DPS','KDR','PTK','TRK','TMK',
  'UP-BPP-TGT',
  'UP-BJM-AMP','UP-BJM-KLN','UP-BJM-SPT','UP-BJM-SGP',
  'UP-BTL-IBT','UP-BTL-SDN',
  'UP-DPS-BNT','UP-DPS-LBK',
  'UP-KDR-MRW',
  'UP-MKS-AMB','UP-MKS-MND','UP-MKS-PLU','UP-MKS-MLU',
  'UP-PTK-DDG','UP-PTK-MBD',
  'UP-SMD-KDW','UP-SMD-PKB',
  'UP-SGT-BGL','UP-SGT-SKL',
  'UP-SBA-GSK',
  'UP-TRK-BRU','UP-TRK-SBK','UP-TRK-SSY',
  'UP-TMK-JYP','UP-TMK-SRG'
);
