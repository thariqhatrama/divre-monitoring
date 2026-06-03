-- 001_create_tables.sql
-- Dashboard Monitoring Margin Proyek Divre Timur
-- Phase 1B: database schema dasar sesuai PRD.
-- Scope: monitoring margin proyek, tanpa approval workflow, tanpa SLA table.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kode_seg23 text UNIQUE NOT NULL,
  nama text NOT NULL,
  tipe text NOT NULL CHECK (tipe IN ('cabang', 'unit_pelayanan')),
  parent_id uuid REFERENCES branches(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('kepala_divre', 'pm', 'admin')),
  cabang_id uuid REFERENCES branches(id) ON DELETE SET NULL,
  aktif boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS coa_accounts (
  kode_seg5 text PRIMARY KEY,
  nama text NOT NULL,
  seg4_default text,
  kategori_rab text CHECK (kategori_rab IN ('I', 'II', 'III', 'IV', 'V', 'VI')),
  tipe_fv text CHECK (tipe_fv IN ('F', 'V')),
  aktif boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL,
  nomor_spmk text,
  seg11_no text,
  cabang_id uuid NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
  klien text,
  nilai_proyek bigint NOT NULL CHECK (nilai_proyek >= 0),
  mata_uang_proyek text NOT NULL DEFAULT 'IDR' CHECK (mata_uang_proyek IN ('IDR', 'USD')),
  kurs_idr_proyek bigint NOT NULL DEFAULT 1 CHECK (kurs_idr_proyek > 0),
  tgl_mulai date,
  tgl_selesai date,
  portofolio_seg7 text,
  sub_portofolio_seg8 text,
  pmu_kso_seg9 text,
  pm_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'aktif', 'selesai', 'arsip')),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rab_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  kategori text NOT NULL CHECK (kategori IN ('I', 'II', 'III', 'IV', 'V', 'VI')),
  kode_akun_seg5 text NOT NULL REFERENCES coa_accounts(kode_seg5) ON DELETE RESTRICT,
  seg4_kode text,
  uraian text NOT NULL,
  qty numeric NOT NULL DEFAULT 0 CHECK (qty >= 0),
  satuan text,
  mata_uang text NOT NULL DEFAULT 'IDR' CHECK (mata_uang IN ('IDR', 'USD')),
  harga_satuan bigint NOT NULL DEFAULT 0 CHECK (harga_satuan >= 0),
  kurs_idr bigint NOT NULL DEFAULT 1 CHECK (kurs_idr > 0),
  total_idr bigint GENERATED ALWAYS AS (round(qty * harga_satuan * kurs_idr)::bigint) STORED,
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS realisasi_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rab_item_id uuid NOT NULL REFERENCES rab_items(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  tanggal_realisasi date NOT NULL DEFAULT current_date,
  qty numeric NOT NULL DEFAULT 0 CHECK (qty >= 0),
  satuan text,
  mata_uang text NOT NULL DEFAULT 'IDR' CHECK (mata_uang IN ('IDR', 'USD')),
  harga_satuan bigint NOT NULL DEFAULT 0 CHECK (harga_satuan >= 0),
  kurs_idr bigint NOT NULL DEFAULT 1 CHECK (kurs_idr > 0),
  total_idr bigint GENERATED ALWAYS AS (round(qty * harga_satuan * kurs_idr)::bigint) STORED,
  catatan text,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS kurs_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mata_uang text NOT NULL CHECK (mata_uang IN ('USD')),
  kurs_idr bigint NOT NULL CHECK (kurs_idr > 0),
  berlaku_mulai date NOT NULL,
  dibuat_oleh uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tabel text NOT NULL,
  record_id uuid,
  aksi text NOT NULL CHECK (aksi IN ('INSERT', 'UPDATE', 'DELETE')),
  nilai_lama jsonb,
  nilai_baru jsonb,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  waktu timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_branches_parent_id ON branches(parent_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_cabang_id ON users(cabang_id);
CREATE INDEX IF NOT EXISTS idx_projects_cabang_id ON projects(cabang_id);
CREATE INDEX IF NOT EXISTS idx_projects_pm_user_id ON projects(pm_user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_tgl_mulai ON projects(tgl_mulai);
CREATE INDEX IF NOT EXISTS idx_rab_items_project_id ON rab_items(project_id);
CREATE INDEX IF NOT EXISTS idx_rab_items_kode_akun_seg5 ON rab_items(kode_akun_seg5);
CREATE INDEX IF NOT EXISTS idx_realisasi_items_rab_item_id ON realisasi_items(rab_item_id);
CREATE INDEX IF NOT EXISTS idx_realisasi_items_project_id ON realisasi_items(project_id);
CREATE INDEX IF NOT EXISTS idx_kurs_history_mata_uang_berlaku ON kurs_history(mata_uang, berlaku_mulai DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_tabel_record_id ON audit_log(tabel, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);

DROP TRIGGER IF EXISTS trg_branches_updated_at ON branches;
CREATE TRIGGER trg_branches_updated_at
BEFORE UPDATE ON branches
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_coa_accounts_updated_at ON coa_accounts;
CREATE TRIGGER trg_coa_accounts_updated_at
BEFORE UPDATE ON coa_accounts
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_projects_updated_at ON projects;
CREATE TRIGGER trg_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_rab_items_updated_at ON rab_items;
CREATE TRIGGER trg_rab_items_updated_at
BEFORE UPDATE ON rab_items
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_realisasi_items_updated_at ON realisasi_items;
CREATE TRIGGER trg_realisasi_items_updated_at
BEFORE UPDATE ON realisasi_items
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_kurs_history_updated_at ON kurs_history;
CREATE TRIGGER trg_kurs_history_updated_at
BEFORE UPDATE ON kurs_history
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
