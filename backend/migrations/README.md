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
