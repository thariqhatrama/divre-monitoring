-- 004_seed_dummy_projects.sql
-- Dashboard Monitoring Margin Proyek Divre Timur
-- Seed 3 proyek dummy untuk validasi role PM.
--
-- Cara pakai:
-- 1. Pastikan seed cabang sudah dijalankan (`003_seed_branches.sql`).
-- 2. Jalankan file ini di Supabase SQL Editor.
-- 3. Buat/login user PM dengan cabang_id Cabang Surabaya (`branches.kode_seg23 = 'SBA'`).
-- 4. PM tersebut akan melihat 3 proyek dummy ini karena scope PM berdasarkan `projects.cabang_id`.
--
-- Catatan:
-- - Seed ini hanya membuat metadata proyek dan Segmen 11 dummy.
-- - RAB/realisasi tidak di-seed agar tidak hardcode COA biaya; PM bisa input RAB dari UI.
-- - `pm_user_id` diisi otomatis ke PM aktif pertama di Cabang Surabaya jika sudah ada.
-- - Idempotent berdasarkan `nomor_spmk` dummy agar aman dijalankan ulang.

WITH target_branch AS (
  SELECT id
  FROM branches
  WHERE kode_seg23 = 'SBA'
  LIMIT 1
), target_pm AS (
  SELECT u.id
  FROM users u
  JOIN target_branch b ON b.id = u.cabang_id
  WHERE u.role = 'pm'
    AND u.aktif = true
  ORDER BY u.created_at ASC
  LIMIT 1
), target_admin AS (
  SELECT id
  FROM users
  WHERE role = 'admin'
    AND aktif = true
  ORDER BY created_at ASC
  LIMIT 1
), seed_data AS (
  SELECT *
  FROM (VALUES
    (
      'Dummy PM - Monitoring Batubara Surabaya',
      'SPMK-DUMMY-PM-001',
      'SEG11-DUMMY-PM-001',
      'PT Contoh Energi Timur',
      1500000000::bigint,
      '2026-01-15'::date,
      '2026-06-30'::date,
      'INSPEKSI',
      'Pengujian dan Inspeksi Batubara',
      'aktif'
    ),
    (
      'Dummy PM - Survey Marine Surabaya',
      'SPMK-DUMMY-PM-002',
      'SEG11-DUMMY-PM-002',
      'PT Pelabuhan Contoh Nusantara',
      875000000::bigint,
      '2026-02-01'::date,
      '2026-05-31'::date,
      'SURVEY',
      'Marine Survey',
      'aktif'
    ),
    (
      'Dummy PM - Sertifikasi Industri Surabaya',
      'SPMK-DUMMY-PM-003',
      'SEG11-DUMMY-PM-003',
      'PT Industri Demo Sejahtera',
      625000000::bigint,
      '2026-03-10'::date,
      '2026-08-15'::date,
      'SERTIFIKASI',
      'Sertifikasi Produk dan Sistem',
      'draft'
    )
  ) AS seed(
    nama,
    nomor_spmk,
    seg11_no,
    klien,
    nilai_proyek,
    tgl_mulai,
    tgl_selesai,
    portofolio_seg7,
    sub_portofolio_seg8,
    status
  )
)
INSERT INTO projects (
  nama,
  nomor_spmk,
  seg11_no,
  cabang_id,
  klien,
  nilai_proyek,
  mata_uang_proyek,
  kurs_idr_proyek,
  tgl_mulai,
  tgl_selesai,
  portofolio_seg7,
  sub_portofolio_seg8,
  pmu_kso_seg9,
  pm_user_id,
  status,
  created_by
)
SELECT
  seed.nama,
  seed.nomor_spmk,
  seed.seg11_no,
  b.id,
  seed.klien,
  seed.nilai_proyek,
  'IDR',
  1,
  seed.tgl_mulai,
  seed.tgl_selesai,
  seed.portofolio_seg7,
  seed.sub_portofolio_seg8,
  NULL,
  pm.id,
  seed.status,
  admin_user.id
FROM seed_data seed
JOIN target_branch b ON true
LEFT JOIN target_pm pm ON true
LEFT JOIN target_admin admin_user ON true
WHERE NOT EXISTS (
  SELECT 1
  FROM projects p
  WHERE p.nomor_spmk = seed.nomor_spmk
);
