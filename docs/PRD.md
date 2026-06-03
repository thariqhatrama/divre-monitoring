# PRD — Dashboard Monitoring Margin Proyek
## Divisi Regional Timur · PT SUCOFINDO (Persero)

**Versi:** 3.1 (Final — Revised)
**Tanggal:** Juni 2026
**Penulis:** OJT Divre Timur (mentor: Kabag Divre Timur)
**Status:** Siap Development
**Timeline:** 3 minggu
**Lokasi repo yang disarankan:** `docs/PRD.md` di root repository

---

## 1. Latar Belakang

Divre Timur mengelola 13 Cabang dan 26 Unit Pelayanan dari Surabaya hingga Timika, dengan pendapatan 2025 sebesar Rp 1.766,4 T (102,7% anggaran). Pemantauan margin proyek saat ini manual via Excel per proyek — Kepala Divre tidak punya visibilitas terpusat.

**Satu kalimat tujuan:** Memudahkan Kepala Divre mengambil keputusan terhadap proyek di cabang yang sedang berjalan, dengan menampilkan margin masing-masing proyek secara terpusat.

**Bukan:** sistem approval, pengganti ERP, atau aplikasi publik.

### Referensi internal

| Dokumen | Relevansi |
|---|---|
| KD No. 10/KD/2025 | Definisi laba operasi, struktur RAB, klasifikasi proyek |
| COA Tahun 2025 | Standar kode akun (Seg 4, 5, dan segmen lainnya) |
| Template RAB Macro (.xlsm) | Struktur kategori biaya acuan form input |

### Roadmap integrasi

Aplikasi ini **independen** saat ini. Arsitektur dirancang untuk kemungkinan:
- Menjadi modul dalam Moneka Apps atau e-project di masa depan
- Menarik data dari SIMONIK atau sistem Sucofindo yang akan datang
- Migrasi dari hosting gratis (Vercel + Supabase) ke server internal Sucofindo setelah OJT

---

### Penempatan PRD dalam repo

Dokumen PRD ini sebaiknya diletakkan di dalam repository pada path:

```
repo-root/docs/PRD.md
```

`CLAUDE.md` tetap diletakkan di root repository karena Claude CLI membaca file tersebut secara otomatis setiap sesi. PRD tidak selalu otomatis dibaca oleh coding assistant, sehingga `CLAUDE.md` harus memberi instruksi eksplisit kepada assistant untuk menjadikan `docs/PRD.md` sebagai sumber requirement utama sebelum membuat atau mengubah fitur.

---

## 2. Pengguna & Akses

| Peran | Akses | Fungsi |
|---|---|---|
| Kepala Divre | Baca semua cabang | Monitor aggregat, identifikasi proyek bermasalah |
| Project Manager | CRUD proyek + RAB cabangnya sendiri | Input RAB, update realisasi |
| Staff RAB (Admin) | Semua akses + master data | Kelola user, COA, cabang, kurs |

PM hanya bisa lihat dan edit proyek dari `cabang_id` yang sama dengan akunnya.

---

## 3. Scope

### Dalam scope (3 minggu)

| # | Fitur |
|---|---|
| 1 | Registrasi proyek + metadata (termasuk input No. Segmen 11 sebagai gate RAB) |
| 2 | Form input RAB per line item, mapping ke COA Seg 5 dengan konteks Seg 4 |
| 3 | Multi-currency per line item (IDR/USD) dengan kurs yang bisa diupdate admin |
| 4 | Kalkulasi margin RAB otomatis (real-time saat input) |
| 5 | Input realisasi anggaran per akun dengan histori transaksi realisasi |
| 6 | Kalkulasi margin realisasi + delta vs. RAB awal (▲/▼) |
| 7 | Flag status margin otomatis: Aman / Perhatian / Kritis / Rugi |
| 8 | Dashboard Kepala Divre: KPI cards + tabel semua proyek + filter + chart |
| 9 | Dashboard PM: scope terbatas cabang sendiri |
| 10 | Halaman detail proyek: breakdown RAB vs. realisasi per kategori |
| 11 | Auth (JWT) + RBAC 3 role |
| 12 | Admin: kelola master COA, cabang, user, kurs |

### Di luar scope

- Approval workflow
- Notifikasi email/push
- Integrasi langsung ERP (Segmen 11 diinput manual)
- Analisis bottleneck komparatif antar proyek
- Manajemen dokumen SPMK/kontrak
- SLA monitoring

### Update berikutnya (setelah aplikasi stabil)

- Import RAB dari Excel (.xlsm)
- Tren margin historis per cabang
- Integrasi SIMONIK/e-project

---

## 4. Alur Kode Akun (COA)

### Gate Segmen 11

No. Segmen 11 harus diperoleh dari Divisi Keuangan sebelum RAB bisa diajukan. Alur:

```
Daftar Proyek (metadata) → Input No. Seg 11 → Form RAB terbuka
```

Selama `seg11_no` kosong, form RAB dikunci dengan pesan jelas.

### Segmen COA yang digunakan

| Segmen | Nama | Penggunaan |
|---|---|---|
| Seg 2 & 3 | Unit Kerja | Dropdown pilih cabang/UP saat registrasi |
| Seg 4 | Pusat Biaya | Context cost center per line item RAB |
| Seg 5 | Natural Account | Kode akun utama setiap biaya |
| Seg 7 | Portofolio | Dropdown saat registrasi proyek |
| Seg 8 | Sub-Portofolio | Dropdown; menentukan jenis jasa |
| Seg 9 | PMU/KSO | Field opsional jika proyek melibatkan KSO |
| Seg 11 | Project/RAB | Nomor dari Divisi Keuangan; gate sebelum input RAB |

### Kategori RAB

| Kat. | Nama | Tipe | Contoh Kode Seg 5 |
|---|---|---|---|
| I | Beban Personil | F | 4021, 4022, 4051–4053, 4061, 4071, 4081, 4091, 4151–4155 |
| II | Tenaga Ahli & Labour Supply | V | 4221, 4231, 4241, 4242 |
| III | Perjalanan Dinas | V | 4301, 4302, 4303 |
| IV | Beban Operasional | V | 4411, 4421, 4422, 4431–4433 |
| V | Peralatan & Sewa | V | 4511, 4521, 4531, 4541, 4547 |
| VI | Overhead & Administrasi | V | 4711, 4712, 4721, 4731 |

---

## 5. Kalkulasi Margin

Berdasarkan KD No. 10/KD/2025 Pasal 1:

```
Margin RAB (%)        = (Nilai Proyek − Total Biaya RAB) / Nilai Proyek × 100
Margin Realisasi (%)  = (Nilai Proyek − Total Biaya Realisasi) / Nilai Proyek × 100
Delta Margin          = Margin Realisasi − Margin RAB
% Subkon              = Total Akun 4422 / Nilai Proyek × 100
```

Semua kalkulasi dalam IDR. Konversi USD → IDR dilakukan sebelum masuk formula.

### Status margin

| Status | Kondisi | Indikator |
|---|---|---|
| Aman | ≥ 15% | Hijau |
| Perhatian | 6% – 14,9% | Kuning |
| Kritis | 0% – 5,9% | Merah |
| Rugi | < 0% | Merah gelap |

Catatan KD 10: proyek margin < 6% tidak dapat dilanjutkan, kecuali penugasan berbasis APBN.

---

## 6. Fitur Detail

### 6.1 Registrasi Proyek

Field wajib: nama proyek, no. SPMK, unit pelaksana (Seg 2&3), klien, nilai proyek (nominal + mata uang), tanggal mulai & selesai, portofolio (Seg 7), sub-portofolio (Seg 8), PMU/KSO opsional (Seg 9), penanggung jawab, manajer proyek.

Status proyek: `draft → aktif → selesai → arsip`. Transisi manual oleh PM atau admin.

### 6.2 Form RAB

Setiap line item: kode akun Seg 5 (dropdown + auto-suggest dari master COA), Seg 4 (dropdown), uraian, qty, satuan, mata uang (IDR/USD), harga satuan, kurs IDR jika USD (dari default terkini), total IDR (dihitung otomatis). Dikelompokkan per Kategori I–VI. Kode akun non-aktif di COA 2025 di-flag dan tidak bisa disimpan.

### 6.3 Input Realisasi

Realisasi dicatat sebagai transaksi terpisah per line item RAB agar histori update tetap tersimpan. Setiap transaksi realisasi memuat tanggal realisasi, qty realisasi, harga satuan realisasi, mata uang, kurs IDR, total realisasi IDR, dan catatan opsional. Total realisasi per akun dihitung dari agregasi seluruh transaksi realisasi yang terkait dengan line item RAB tersebut.

Pendekatan ini dipilih agar aplikasi tetap bisa menampilkan margin realisasi terkini sekaligus menjaga jejak perubahan, tanpa mencampur data RAB awal dengan data realisasi berjalan.

### 6.4 Dashboard Kepala Divre

KPI cards: total proyek aktif, total nilai proyek (IDR), rata-rata margin RAB (%), rata-rata margin realisasi (%), jumlah proyek kritis/rugi.

Tabel proyek dengan kolom: Nama Proyek, Cabang, Nilai (IDR), Total RAB, Margin RAB (%), Total Realisasi, Margin Realisasi (%), Delta (▲/▼), Status Margin, Status Proyek. Filter: cabang, portofolio, status proyek, status margin, tahun. Baris kritis/rugi di-highlight otomatis.

Grafik: bar chart margin RAB vs. realisasi per cabang; donut distribusi proyek per status margin.

### 6.5 Dashboard PM

Identik dengan dashboard Kepala Divre, scope terbatas pada cabang PM tersebut. Tidak ada akses data cabang lain.

### 6.6 Halaman Detail Proyek

Summary: nilai proyek, total RAB, margin RAB, total realisasi, margin realisasi, delta. Tabel breakdown per kategori I–VI dengan sub-total RAB vs. realisasi vs. selisih. Expand per kategori → tampilkan line item individual. Bar chart horizontal RAB vs. realisasi per kategori. Info tambahan: % subkon, mata uang komponen, Seg 11 no., tanggal update terakhir.

---

## 7. Arsitektur Teknis

### 7.1 Stack

| Layer | Teknologi | Platform |
|---|---|---|
| Frontend | React 18 + Vite + React Router v6 + Recharts + Axios | Vercel |
| Backend | Node.js 20 + Express 4 + JWT + bcryptjs | Render (free) |
| Database | PostgreSQL via Supabase JS client | Supabase (free tier) |

### 7.2 Deployment

Project menggunakan **satu repository / monorepo** dengan dua root aplikasi: `frontend/` untuk Vercel dan `backend/` untuk Render. Kedua platform bisa membaca satu repository yang sama selama masing-masing project/service diarahkan ke root directory yang benar.

**Vercel (frontend/):**
- Import repository yang sama dari GitHub
- Set **Root Directory**: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Env var: `VITE_API_URL=https://[nama-service].onrender.com`
- Config: `frontend/vercel.json` dengan rewrite `"/*" → "/index.html"` agar React Router tidak 404

**Render (backend/):**
- Import repository yang sama dari GitHub
- Set **Root Directory**: `backend`
- Runtime: Node
- Build command: `npm install`
- Start command: `node src/app.js`
- Env vars: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `JWT_SECRET`, `PORT`, `CORS_ORIGIN`
- Free tier: service tidur setelah idle — masih dapat diterima untuk MVP/internal demo

**Catatan penting monorepo:**
- `docs/PRD.md` dan `CLAUDE.md` ada di root repo untuk kebutuhan coding assistant.
- Vercel tidak perlu membaca `backend/`; Render tidak perlu membaca `frontend/`.
- File environment tetap dipasang per platform, bukan disimpan di repo.

**Supabase:**
- Database PostgreSQL managed
- Gunakan service key (bukan anon key) di backend — akses penuh, bypass RLS
- RLS tidak diperlukan karena akses dikontrol di Express middleware
- Free tier: 500MB storage, 2GB bandwidth/bulan — cukup untuk project ini

### 7.3 Struktur Folder

```
repo-root/
├── CLAUDE.md
├── frontend/
│   ├── src/
│   │   ├── pages/           Login, Dashboard, DashboardCabang,
│   │   │                    ProyekList, ProyekDetail, ProyekForm,
│   │   │                    RABForm, RealisasiForm
│   │   ├── components/      MarginBadge, MarginCard, RABTable,
│   │   │                    MarginChart, BreakdownChart,
│   │   │                    ProyekTable, ProtectedRoute
│   │   ├── hooks/           useProyek, useRAB, useAuth
│   │   ├── services/        api.js (semua Axios calls)
│   │   ├── utils/           formatIDR, marginFlag, currencyConvert,
│   │   │                    segmenCOA
│   │   ├── context/         AuthContext, FilterContext
│   │   └── main.jsx
│   ├── vercel.json
│   └── package.json
│
└── backend/
    ├── src/
    │   ├── routes/          auth, proyek, rab, realisasi,
    │   │                    dashboard, master, kurs
    │   ├── controllers/     proyek, rab, realisasi,
    │   │                    dashboard, master
    │   ├── services/        margin.service, coa.service, kurs.service
    │   ├── models/          proyek, rab, user, coa
    │   ├── middleware/      auth, rbac, validate
    │   ├── db/              supabase.js
    │   └── app.js
    ├── migrations/
    │   ├── 001_create_tables.sql
    │   ├── 002_seed_coa.sql
    │   └── 003_seed_branches.sql
    ├── render.yaml
    └── package.json
```

### 7.4 Database Schema

```sql
projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL,
  nomor_spmk text,
  seg11_no text,                      -- gate: wajib sebelum RAB
  cabang_id uuid REFERENCES branches,
  klien text,
  nilai_proyek bigint NOT NULL,        -- IDR integer
  mata_uang_proyek text DEFAULT 'IDR',
  kurs_idr_proyek bigint,              -- kurs saat proyek dibuat
  tgl_mulai date,
  tgl_selesai date,
  portofolio_seg7 text,
  sub_portofolio_seg8 text,
  pmu_kso_seg9 text,
  pm_user_id uuid REFERENCES users,
  status text DEFAULT 'draft',         -- draft|aktif|selesai|arsip
  created_by uuid REFERENCES users,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
)

rab_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects ON DELETE CASCADE,
  kategori text NOT NULL,              -- I|II|III|IV|V|VI
  kode_akun_seg5 text NOT NULL,        -- string, bukan integer
  seg4_kode text,
  uraian text NOT NULL,
  qty numeric NOT NULL DEFAULT 0,
  satuan text,
  mata_uang text DEFAULT 'IDR',
  harga_satuan bigint NOT NULL DEFAULT 0,
  kurs_idr bigint DEFAULT 1,           -- 1 jika IDR, nilai kurs jika USD
  total_idr bigint GENERATED ALWAYS AS (qty * harga_satuan * kurs_idr) STORED,
  updated_by uuid REFERENCES users,
  updated_at timestamptz DEFAULT now()
)

realisasi_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rab_item_id uuid REFERENCES rab_items ON DELETE CASCADE,
  project_id uuid REFERENCES projects ON DELETE CASCADE,
  tanggal_realisasi date NOT NULL DEFAULT current_date,
  qty numeric NOT NULL DEFAULT 0,
  satuan text,
  mata_uang text DEFAULT 'IDR',
  harga_satuan bigint NOT NULL DEFAULT 0,
  kurs_idr bigint DEFAULT 1,
  total_idr bigint GENERATED ALWAYS AS (qty * harga_satuan * kurs_idr) STORED,
  catatan text,
  created_by uuid REFERENCES users,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
)

users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL,                  -- kepala_divre|pm|admin
  cabang_id uuid REFERENCES branches,  -- null jika kepala_divre atau admin
  aktif boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
)

branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kode_seg23 text UNIQUE NOT NULL,
  nama text NOT NULL,
  tipe text NOT NULL,                  -- cabang|unit_pelayanan
  parent_id uuid REFERENCES branches   -- null jika cabang utama
)

coa_accounts (
  kode_seg5 text PRIMARY KEY,
  nama text NOT NULL,
  seg4_default text,
  kategori_rab text,                   -- I|II|III|IV|V|VI
  tipe_fv text,                        -- F|V
  aktif boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
)

kurs_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mata_uang text NOT NULL,             -- USD
  kurs_idr bigint NOT NULL,
  berlaku_mulai date NOT NULL,
  dibuat_oleh uuid REFERENCES users,
  created_at timestamptz DEFAULT now()
)

audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tabel text,
  record_id uuid,
  aksi text,                           -- INSERT|UPDATE|DELETE
  nilai_lama jsonb,
  nilai_baru jsonb,
  user_id uuid REFERENCES users,
  waktu timestamptz DEFAULT now()
)
```

### 7.5 API Endpoints

```
Auth
  POST   /api/auth/login
  POST   /api/auth/logout

Proyek
  GET    /api/proyek              ?cabang_id=&status=&tahun=
  POST   /api/proyek
  GET    /api/proyek/:id
  PATCH  /api/proyek/:id
  DELETE /api/proyek/:id          (admin only, soft delete)

RAB
  GET    /api/proyek/:id/rab
  POST   /api/proyek/:id/rab
  PATCH  /api/rab/:itemId
  DELETE /api/rab/:itemId

Realisasi
  GET    /api/proyek/:id/realisasi
  POST   /api/rab/:itemId/realisasi
  PATCH  /api/realisasi/:id
  DELETE /api/realisasi/:id

Dashboard
  GET    /api/dashboard/summary   → KPI aggregat
  GET    /api/dashboard/by-cabang → margin per cabang untuk chart

Master (admin only)
  GET/POST/PATCH  /api/master/coa
  GET/POST/PATCH  /api/master/cabang
  GET/POST/PATCH  /api/master/user
  GET/PUT         /api/kurs
```

---

## 8. Persyaratan Non-Fungsional

- Dashboard load < 3 detik untuk ≤ 200 proyek aktif
- Kalkulasi margin real-time saat input (client-side, tidak perlu request ke server)
- Auth JWT dengan expiry 8 jam; refresh manual (login ulang)
- Audit log setiap perubahan RAB dan realisasi
- CORS dikonfigurasi: hanya izinkan origin Vercel
- Browser: Chrome dan Edge terbaru; mobile bukan prioritas

---

## 9. Milestones

| Minggu | Target |
|---|---|
| 1 | Setup repo + Supabase + auth backend + master data (COA, cabang, user) + registrasi proyek + form RAB basic |
| 2 | Kalkulasi margin (RAB + realisasi + delta) + form realisasi + flag status + validasi COA + multi-currency |
| 3 | Dashboard Kepala Divre + dashboard PM + detail proyek + chart + filter/sort + deploy Vercel + Render |

---

## 10. Risiko

| Risiko | Mitigasi |
|---|---|
| PM enggan input manual | UX form semirip template RAB; import Excel sebagai update berikutnya |
| COA update tahunan | Master COA di DB, admin bisa update; tidak hardcode |
| Kurs USD fluktuatif | Kurs di-lock per line item saat input; admin update kurs default |
| Render tidur (free tier) | Pasang UptimeRobot ping setiap 14 menit agar tidak tidur |
| Scope creep | Tidak ada approval, tidak ada email, tidak ada ERP — ini batas keras |

---

## 11. Definition of Done

Aplikasi selesai jika:
1. PM bisa login, daftar proyek, input No. Seg 11, input RAB, lihat margin RAB real-time
2. PM bisa input transaksi realisasi per akun dan lihat delta margin vs. RAB
3. Kepala Divre bisa lihat semua proyek dari semua cabang, filter, dan sort
4. Proyek kritis (< 6%) ter-highlight otomatis
5. Detail proyek tampilkan breakdown RAB vs. realisasi per kategori + chart
6. Admin bisa kelola user, COA, cabang, dan kurs
7. Aplikasi live di Vercel, bisa diakses via browser tanpa instalasi

---

*Versi 3.1 — Final revised, dengan penempatan PRD, monorepo deployment, dan histori realisasi. Juni 2026.*
