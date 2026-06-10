-- 003_seed_branches.sql
-- Dashboard Monitoring Margin Proyek Divre Timur
-- Phase 1D: seed master cabang dan unit pelayanan Divre Timur.
--
-- Catatan schema repo saat ini:
-- - branches.kode_seg23 = kode/code cabang atau UP sebagai text/string
-- - branches.nama = name
-- - branches.tipe hanya mendukung enum 'cabang' atau 'unit_pelayanan'
-- - branches.parent_id adalah UUID FK ke branches.id, sehingga parent_code dari sumber
--   tidak bisa disimpan langsung tanpa perubahan schema. Relasi parent dapat ditautkan
--   setelah seed bila diperlukan.

-- =========================================================
-- 1. Seed Cabang Divre Timur
-- =========================================================

INSERT INTO branches (
  kode_seg23,
  nama,
  tipe,
  parent_id
)
VALUES
  -- 2 Cabang Utama
  ('SBA', 'Cabang Surabaya', 'cabang', NULL),
  ('BJM', 'Cabang Banjarmasin', 'cabang', NULL),

  -- 4 Cabang Madya
  ('BPP', 'Cabang Balikpapan', 'cabang', NULL),
  ('MKS', 'Cabang Makassar', 'cabang', NULL),
  ('SMD', 'Cabang Samarinda', 'cabang', NULL),
  ('SGT', 'Cabang Sangatta', 'cabang', NULL),

  -- 7 Cabang Pratama
  ('BTL', 'Cabang Batulicin', 'cabang', NULL),
  ('BTG', 'Cabang Bontang', 'cabang', NULL),
  ('DPS', 'Cabang Denpasar', 'cabang', NULL),
  ('KDR', 'Cabang Kendari', 'cabang', NULL),
  ('PTK', 'Cabang Pontianak', 'cabang', NULL),
  ('TRK', 'Cabang Tarakan', 'cabang', NULL),
  ('TMK', 'Cabang Timika', 'cabang', NULL)
ON CONFLICT (kode_seg23) DO UPDATE SET
  nama = EXCLUDED.nama,
  tipe = EXCLUDED.tipe,
  parent_id = EXCLUDED.parent_id;

-- =========================================================
-- 2. Seed Unit Pelayanan Divre Timur
-- =========================================================

INSERT INTO branches (
  kode_seg23,
  nama,
  tipe,
  parent_id
)
VALUES
  -- Cabang Balikpapan
  ('UP-BPP-TGT', 'UP Tanah Grogot', 'unit_pelayanan', NULL),

  -- Cabang Banjarmasin
  ('UP-BJM-AMP', 'UP Ampah', 'unit_pelayanan', NULL),
  ('UP-BJM-KLN', 'UP Kelanis', 'unit_pelayanan', NULL),
  ('UP-BJM-SPT', 'UP Sampit', 'unit_pelayanan', NULL),
  ('UP-BJM-SGP', 'UP Sungai Puting', 'unit_pelayanan', NULL),

  -- Cabang Batulicin
  ('UP-BTL-IBT', 'UP Indonesia Bulk Terminal', 'unit_pelayanan', NULL),
  ('UP-BTL-SDN', 'UP Sungai Danau', 'unit_pelayanan', NULL),

  -- Cabang Bontang
  -- Tidak ada UP pada slide

  -- Cabang Denpasar
  ('UP-DPS-BNT', 'UP Benete', 'unit_pelayanan', NULL),
  ('UP-DPS-LBK', 'UP Lombok', 'unit_pelayanan', NULL),

  -- Cabang Kendari
  ('UP-KDR-MRW', 'UP Morowali', 'unit_pelayanan', NULL),

  -- Cabang Makassar
  ('UP-MKS-AMB', 'UP Ambon', 'unit_pelayanan', NULL),
  ('UP-MKS-MND', 'UP Manado', 'unit_pelayanan', NULL),
  ('UP-MKS-PLU', 'UP Palu', 'unit_pelayanan', NULL),
  ('UP-MKS-MLU', 'UP Maluku Utara', 'unit_pelayanan', NULL),

  -- Cabang Pontianak
  ('UP-PTK-DDG', 'UP Dondang', 'unit_pelayanan', NULL),
  ('UP-PTK-MBD', 'UP Muara Badak', 'unit_pelayanan', NULL),

  -- Cabang Samarinda
  ('UP-SMD-KDW', 'UP Kendawangan', 'unit_pelayanan', NULL),
  ('UP-SMD-PKB', 'UP Pangkalan Bun', 'unit_pelayanan', NULL),

  -- Cabang Sangatta
  ('UP-SGT-BGL', 'UP Bengalon', 'unit_pelayanan', NULL),
  ('UP-SGT-SKL', 'UP Sangkulirang', 'unit_pelayanan', NULL),

  -- Cabang Surabaya
  ('UP-SBA-GSK', 'UP Gresik', 'unit_pelayanan', NULL),

  -- Cabang Tarakan
  ('UP-TRK-BRU', 'UP Berau', 'unit_pelayanan', NULL),
  ('UP-TRK-SBK', 'UP Sebakis', 'unit_pelayanan', NULL),
  ('UP-TRK-SSY', 'UP Sesayap', 'unit_pelayanan', NULL),

  -- Cabang Timika
  ('UP-TMK-JYP', 'UP Jayapura', 'unit_pelayanan', NULL),
  ('UP-TMK-SRG', 'UP Sorong', 'unit_pelayanan', NULL)
ON CONFLICT (kode_seg23) DO UPDATE SET
  nama = EXCLUDED.nama,
  tipe = EXCLUDED.tipe,
  parent_id = EXCLUDED.parent_id;
