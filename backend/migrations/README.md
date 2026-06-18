# Backend Migrations

Folder ini berisi SQL yang dijalankan manual di Supabase Dashboard → SQL Editor.

## Urutan migration/seed

1. `001_create_tables.sql` — membuat tabel utama sesuai PRD:
   - `users`
   - `branches`
   - `coa_accounts`
   - `projects`
   - `rab_items`
   - `realisasi_items`
   - `kurs_history`
   - `audit_log`
2. `002_seed_coa.sql` — mengisi master COA Tahun 2025.
   - Sumber data: `docs/COA tahun 2025.xlsx`
   - Dibuat pada Phase 1D, bukan Phase 1B.
3. `003_seed_branches.sql` — mengisi master 13 cabang dan 26 unit pelayanan.
4. `004_seed_dummy_projects.sql` — mengisi data proyek dummy untuk demo lokal.
5. `005_seed_dummy_rab_realisasi.sql` — mengisi data RAB dan realisasi dummy untuk demo lokal.
6. `006_reseed_branches_seg23_divre_timur.sql` — koreksi seed cabang/UP Divre Timur.
7. `007_delete_legacy_inactive_branches.sql` — hapus cabang legacy nonaktif.
8. `008_sync_coa_form_rab.sql` — sinkronisasi kategori dan kelengkapan COA RAB dari `docs/Form RAB.xlsm` sheet `RAB` dan `sheet 2`; status aktif tetap mengikuti COA Tahun 2025.

## Cara menjalankan di Supabase

1. Buka Supabase Dashboard.
2. Pilih project Dashboard Monitoring Margin.
3. Buka menu SQL Editor.
4. Copy isi file SQL sesuai urutan.
5. Paste ke SQL Editor.
6. Klik Run.

## Catatan scope

- Tidak ada tabel approval workflow.
- Tidak ada tabel SLA.
- Tidak ada ORM; backend memakai `@supabase/supabase-js` langsung.
- Jangan menyimpan credential Supabase di file migration.
