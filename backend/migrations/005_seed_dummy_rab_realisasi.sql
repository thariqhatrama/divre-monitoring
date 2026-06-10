-- 005_seed_dummy_rab_realisasi.sql
-- Dashboard Monitoring Margin Proyek Divre Timur
-- Seed RAB + realisasi untuk 3 proyek dummy PM dari `004_seed_dummy_projects.sql`.
--
-- Tujuan demo:
-- - Project 001: margin realisasi aman dan membaik.
-- - Project 002: margin realisasi perhatian dan turun dari RAB.
-- - Project 003: margin RAB kritis, realisasi rugi.
--
-- Cara pakai:
-- 1. Jalankan `004_seed_dummy_projects.sql` terlebih dahulu.
-- 2. Pastikan seed COA 2025 sudah ada (`002_seed_coa.sql`).
-- 3. Jalankan file ini di Supabase SQL Editor.
--
-- Idempotent:
-- - RAB tidak diduplikasi jika `project_id + uraian` sudah ada.
-- - Realisasi tidak diduplikasi jika `rab_item_id + catatan` sudah ada.

-- =========================================================
-- 1. Seed RAB dummy per proyek
-- =========================================================

WITH rab_seed AS (
  SELECT *
  FROM (VALUES
    -- Project 001: nilai proyek 1.500.000.000; total RAB 1.200.000.000; margin RAB 20%
    ('SPMK-DUMMY-PM-001', 'I', '4021', '5110', 'Dummy RAB 001 - Personil inspeksi', 1::numeric, 'ls', 300000000::bigint),
    ('SPMK-DUMMY-PM-001', 'III', '4301', '5310', 'Dummy RAB 001 - Perjalanan dinas', 1::numeric, 'ls', 150000000::bigint),
    ('SPMK-DUMMY-PM-001', 'IV', '4422', '5410', 'Dummy RAB 001 - Subkon lab eksternal', 1::numeric, 'ls', 600000000::bigint),
    ('SPMK-DUMMY-PM-001', 'VI', '4711', '5610', 'Dummy RAB 001 - Administrasi proyek', 1::numeric, 'ls', 150000000::bigint),

    -- Project 002: nilai proyek 875.000.000; total RAB 752.500.000; margin RAB 14%
    ('SPMK-DUMMY-PM-002', 'I', '4021', '5110', 'Dummy RAB 002 - Personil surveyor', 1::numeric, 'ls', 200000000::bigint),
    ('SPMK-DUMMY-PM-002', 'III', '4301', '5310', 'Dummy RAB 002 - Mobilisasi marine', 1::numeric, 'ls', 175000000::bigint),
    ('SPMK-DUMMY-PM-002', 'V', '4511', '5510', 'Dummy RAB 002 - Peralatan survey', 1::numeric, 'ls', 227500000::bigint),
    ('SPMK-DUMMY-PM-002', 'VI', '4711', '5610', 'Dummy RAB 002 - Administrasi survey', 1::numeric, 'ls', 150000000::bigint),

    -- Project 003: nilai proyek 625.000.000; total RAB 593.750.000; margin RAB 5% (kritis)
    ('SPMK-DUMMY-PM-003', 'I', '4021', '5110', 'Dummy RAB 003 - Personil sertifikasi', 1::numeric, 'ls', 180000000::bigint),
    ('SPMK-DUMMY-PM-003', 'II', '4221', '5210', 'Dummy RAB 003 - Tenaga ahli sertifikasi', 1::numeric, 'ls', 190000000::bigint),
    ('SPMK-DUMMY-PM-003', 'IV', '4422', '5410', 'Dummy RAB 003 - Subkon uji produk', 1::numeric, 'ls', 173750000::bigint),
    ('SPMK-DUMMY-PM-003', 'VI', '4711', '5610', 'Dummy RAB 003 - Administrasi sertifikasi', 1::numeric, 'ls', 50000000::bigint)
  ) AS seed(
    nomor_spmk,
    kategori,
    kode_akun_seg5,
    seg4_kode,
    uraian,
    qty,
    satuan,
    harga_satuan
  )
), rab_payload AS (
  SELECT
    p.id AS project_id,
    seed.kategori,
    seed.kode_akun_seg5,
    seed.seg4_kode,
    seed.uraian,
    seed.qty,
    seed.satuan,
    'IDR' AS mata_uang,
    seed.harga_satuan,
    1 AS kurs_idr,
    p.pm_user_id AS updated_by
  FROM rab_seed seed
  JOIN projects p ON p.nomor_spmk = seed.nomor_spmk
)
INSERT INTO rab_items (
  project_id,
  kategori,
  kode_akun_seg5,
  seg4_kode,
  uraian,
  qty,
  satuan,
  mata_uang,
  harga_satuan,
  kurs_idr,
  updated_by
)
SELECT
  payload.project_id,
  payload.kategori,
  payload.kode_akun_seg5,
  payload.seg4_kode,
  payload.uraian,
  payload.qty,
  payload.satuan,
  payload.mata_uang,
  payload.harga_satuan,
  payload.kurs_idr,
  payload.updated_by
FROM rab_payload payload
WHERE NOT EXISTS (
  SELECT 1
  FROM rab_items existing
  WHERE existing.project_id = payload.project_id
    AND existing.uraian = payload.uraian
);

-- =========================================================
-- 2. Seed realisasi dummy per line item RAB
-- =========================================================

WITH realisasi_seed AS (
  SELECT *
  FROM (VALUES
    -- Project 001: total realisasi 1.125.000.000; margin realisasi 25% (aman, naik dari RAB)
    ('SPMK-DUMMY-PM-001', 'Dummy RAB 001 - Personil inspeksi', '2026-03-15'::date, 280000000::bigint, 'Dummy realisasi 001 - personil lebih efisien'),
    ('SPMK-DUMMY-PM-001', 'Dummy RAB 001 - Perjalanan dinas', '2026-03-16'::date, 125000000::bigint, 'Dummy realisasi 001 - perjalanan efisien'),
    ('SPMK-DUMMY-PM-001', 'Dummy RAB 001 - Subkon lab eksternal', '2026-03-17'::date, 570000000::bigint, 'Dummy realisasi 001 - subkon sesuai negosiasi'),
    ('SPMK-DUMMY-PM-001', 'Dummy RAB 001 - Administrasi proyek', '2026-03-18'::date, 150000000::bigint, 'Dummy realisasi 001 - administrasi sesuai RAB'),

    -- Project 002: total realisasi 805.000.000; margin realisasi 8% (perhatian, turun dari RAB)
    ('SPMK-DUMMY-PM-002', 'Dummy RAB 002 - Personil surveyor', '2026-04-10'::date, 215000000::bigint, 'Dummy realisasi 002 - tambahan personil'),
    ('SPMK-DUMMY-PM-002', 'Dummy RAB 002 - Mobilisasi marine', '2026-04-11'::date, 200000000::bigint, 'Dummy realisasi 002 - mobilisasi naik'),
    ('SPMK-DUMMY-PM-002', 'Dummy RAB 002 - Peralatan survey', '2026-04-12'::date, 240000000::bigint, 'Dummy realisasi 002 - sewa alat naik'),
    ('SPMK-DUMMY-PM-002', 'Dummy RAB 002 - Administrasi survey', '2026-04-13'::date, 150000000::bigint, 'Dummy realisasi 002 - administrasi sesuai RAB'),

    -- Project 003: total realisasi 643.750.000; margin realisasi -3% (rugi)
    ('SPMK-DUMMY-PM-003', 'Dummy RAB 003 - Personil sertifikasi', '2026-05-05'::date, 200000000::bigint, 'Dummy realisasi 003 - personil overrun'),
    ('SPMK-DUMMY-PM-003', 'Dummy RAB 003 - Tenaga ahli sertifikasi', '2026-05-06'::date, 210000000::bigint, 'Dummy realisasi 003 - tenaga ahli overrun'),
    ('SPMK-DUMMY-PM-003', 'Dummy RAB 003 - Subkon uji produk', '2026-05-07'::date, 183750000::bigint, 'Dummy realisasi 003 - subkon overrun'),
    ('SPMK-DUMMY-PM-003', 'Dummy RAB 003 - Administrasi sertifikasi', '2026-05-08'::date, 50000000::bigint, 'Dummy realisasi 003 - administrasi sesuai RAB')
  ) AS seed(
    nomor_spmk,
    rab_uraian,
    tanggal_realisasi,
    harga_satuan,
    catatan
  )
), realisasi_payload AS (
  SELECT
    rab.id AS rab_item_id,
    p.id AS project_id,
    seed.tanggal_realisasi,
    1::numeric AS qty,
    rab.satuan,
    'IDR' AS mata_uang,
    seed.harga_satuan,
    1 AS kurs_idr,
    seed.catatan,
    p.pm_user_id AS created_by
  FROM realisasi_seed seed
  JOIN projects p ON p.nomor_spmk = seed.nomor_spmk
  JOIN rab_items rab ON rab.project_id = p.id AND rab.uraian = seed.rab_uraian
)
INSERT INTO realisasi_items (
  rab_item_id,
  project_id,
  tanggal_realisasi,
  qty,
  satuan,
  mata_uang,
  harga_satuan,
  kurs_idr,
  catatan,
  created_by
)
SELECT
  payload.rab_item_id,
  payload.project_id,
  payload.tanggal_realisasi,
  payload.qty,
  payload.satuan,
  payload.mata_uang,
  payload.harga_satuan,
  payload.kurs_idr,
  payload.catatan,
  payload.created_by
FROM realisasi_payload payload
WHERE NOT EXISTS (
  SELECT 1
  FROM realisasi_items existing
  WHERE existing.rab_item_id = payload.rab_item_id
    AND existing.catatan = payload.catatan
);
