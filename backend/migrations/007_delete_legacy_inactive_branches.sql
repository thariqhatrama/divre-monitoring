-- 007_delete_legacy_inactive_branches.sql
-- Dashboard Monitoring Margin Proyek Divre Timur
--
-- Menghapus kode cabang lama/non-COA yang sudah dinonaktifkan karena salah pengkodean
-- (contoh: SBA, BJM, UP-*) agar tidak muncul lagi pada dropdown user/proyek/master.
-- Sebelum delete, FK users/projects dipastikan sudah mengarah ke kode resmi COA Seg 2&3.
--
-- Aman dijalankan ulang (idempotent). Tidak menghapus kode resmi aktif seperti 56.01, 71.01, dst.

BEGIN;

-- =========================================================
-- 1. Pastikan referensi users/projects berpindah dari kode lama ke kode resmi.
--    Ini mengulang mapping dari migration 006 agar delete tidak gagal karena FK.
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
-- 2. Hapus kode cabang legacy yang salah/non-COA dan sudah tidak aktif.
-- =========================================================

WITH legacy_codes(kode_seg23) AS (
  VALUES
    ('SBA'),('BJM'),('BPP'),('MKS'),('SMD'),('SGT'),('BTL'),('BTG'),('DPS'),('KDR'),('PTK'),('TRK'),('TMK'),
    ('UP-BPP-TGT'),
    ('UP-BJM-AMP'),('UP-BJM-KLN'),('UP-BJM-SPT'),('UP-BJM-SGP'),
    ('UP-BTL-IBT'),('UP-BTL-SDN'),
    ('UP-DPS-BNT'),('UP-DPS-LBK'),
    ('UP-KDR-MRW'),
    ('UP-MKS-AMB'),('UP-MKS-MND'),('UP-MKS-PLU'),('UP-MKS-MLU'),
    ('UP-PTK-DDG'),('UP-PTK-MBD'),
    ('UP-SMD-KDW'),('UP-SMD-PKB'),
    ('UP-SGT-BGL'),('UP-SGT-SKL'),
    ('UP-SBA-GSK'),
    ('UP-TRK-BRU'),('UP-TRK-SBK'),('UP-TRK-SSY'),
    ('UP-TMK-JYP'),('UP-TMK-SRG')
), deleted AS (
  DELETE FROM branches b
  USING legacy_codes l
  WHERE b.kode_seg23 = l.kode_seg23
    AND b.aktif = false
    AND NOT EXISTS (SELECT 1 FROM projects p WHERE p.cabang_id = b.id)
    AND NOT EXISTS (SELECT 1 FROM users u WHERE u.cabang_id = b.id)
  RETURNING b.kode_seg23, b.nama
)
SELECT COUNT(*) AS deleted_legacy_inactive_branches
FROM deleted;

COMMIT;
