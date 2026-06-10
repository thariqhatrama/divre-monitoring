# Dashboard Monitoring Margin Proyek Divre Timur

Aplikasi web internal untuk memantau **margin proyek** Divisi Regional Timur PT SUCOFINDO (Persero). Aplikasi ini membantu Kepala Divre melihat kondisi margin proyek secara terpusat berdasarkan **RAB awal vs realisasi anggaran per akun**, sehingga proyek yang perlu perhatian dapat cepat diidentifikasi.

> Requirement utama ada di [`docs/PRD.md`](docs/PRD.md). File ini adalah panduan ringkas yang lebih ramah pengguna untuk memahami, menjalankan, dan men-deploy project.

---

## Ringkasan

| Area | Keterangan |
|---|---|
| Nama project | Dashboard Monitoring Margin Proyek Divre Timur |
| Tujuan | Monitoring margin proyek cabang berdasarkan RAB dan realisasi |
| Pengguna utama | Kepala Divre, Project Manager, Staff RAB/Admin |
| Scope | Monitoring, input RAB, input realisasi, margin, dashboard |
| Bukan scope | Approval workflow, ERP replacement, email/push notification, SLA monitoring |
| Frontend | React 19 + Vite 8 + React Router v7 + Axios + Recharts |
| Backend | Node.js 20 + Express 5.2.1 + JWT + bcryptjs |
| Database | Supabase PostgreSQL |
| Deployment | Vercel untuk frontend, Render untuk backend |

---

## Status development saat ini

Project sudah mencapai fondasi Phase 2C:

- Setup repo monorepo sudah tersedia.
- Backend Express + Supabase client sudah tersedia.
- Auth JWT + RBAC 3 role sudah tersedia.
- Master data COA, cabang, user, dan kurs sudah tersedia.
- CRUD proyek sudah tersedia.
- Input RAB basic sudah tersedia dengan gate Segmen 11.
- Multi-currency IDR/USD sudah tersedia.
- Kalkulasi margin RAB sudah tersedia.
- **Phase 2C realisasi per akun sudah tersedia:**
  - realisasi dicatat di tabel `realisasi_items`
  - tidak menimpa RAB awal di `rab_items`
  - satu akun RAB dapat memiliki banyak transaksi realisasi
  - total realisasi dijumlahkan per RAB item dan per akun
  - audit log dibuat untuk tambah/edit/hapus realisasi
  - frontend memiliki halaman `RealisasiForm.jsx`

Validasi lokal terakhir:

```bash
node --check backend/src/app.js
node --check backend/src/controllers/realisasi.controller.js
node --check backend/src/models/realisasi.model.js
node --check backend/src/routes/realisasi.routes.js
npm --prefix frontend run build
```

---

## Struktur repository

Project memakai satu repository dengan dua root aplikasi:

```txt
repo-root/
├── CLAUDE.md                  # Instruksi kerja Claude Code dan aturan project
├── STATUS.md                  # Catatan progress, checklist, activity log
├── CHECKLIST_SETUP.md         # Checklist setup awal
├── docs/
│   ├── PRD.md                 # Requirement utama project
│   ├── PROMPTS_CLAUDE_PHASES.md
│   └── COA tahun 2025.xlsx    # Referensi COA jika tersedia di working copy
├── frontend/                  # Root app frontend untuk Vercel
│   ├── src/
│   │   ├── components/        # Komponen reusable
│   │   ├── context/           # Auth/filter context
│   │   ├── hooks/             # Custom hooks
│   │   ├── pages/             # Halaman utama aplikasi
│   │   ├── services/          # Axios API client
│   │   └── utils/             # Helper format IDR, margin, currency
│   ├── vercel.json            # Rewrite React Router SPA
│   └── package.json
└── backend/                   # Root app backend untuk Render
    ├── src/
    │   ├── controllers/       # HTTP controller
    │   ├── db/                # Supabase client
    │   ├── middleware/        # Auth dan RBAC
    │   ├── models/            # Query Supabase
    │   ├── routes/            # Express routes
    │   ├── services/          # Business logic margin/kurs
    │   └── app.js             # Express app entrypoint
    ├── migrations/            # SQL schema dan seed
    ├── render.yaml            # Render service config
    └── package.json
```

---

## Role dan akses

| Role | Akses |
|---|---|
| `kepala_divre` | Baca semua proyek semua cabang, tidak bisa edit |
| `pm` | CRUD proyek, RAB, dan realisasi milik cabangnya sendiri |
| `admin` | Semua akses + master data management |

RBAC dicek di backend melalui middleware JWT dan role.

---

## Aturan bisnis utama

### 1. Margin dihitung dalam IDR

Semua kalkulasi margin memakai IDR integer rupiah penuh.

```txt
Margin RAB        = (Nilai Proyek - Total Biaya RAB) / Nilai Proyek × 100
Margin Realisasi  = (Nilai Proyek - Total Biaya Realisasi) / Nilai Proyek × 100
Delta Margin      = Margin Realisasi - Margin RAB
```

Jika input USD, nilai dikonversi ke IDR menggunakan kurs yang tersimpan pada transaksi/line item.

### 2. Status margin

| Status | Kondisi | Warna |
|---|---:|---|
| Aman | `>= 15%` | Hijau |
| Perhatian | `>= 6%` dan `< 15%` | Kuning |
| Kritis | `>= 0%` dan `< 6%` | Merah |
| Rugi | `< 0%` | Merah gelap |

### 3. Gate Segmen 11

RAB hanya bisa diinput jika proyek sudah memiliki `seg11_no`. Tidak ada bypass.

### 4. Realisasi tidak menimpa RAB

RAB awal disimpan di `rab_items`. Realisasi berjalan disimpan sebagai histori transaksi di `realisasi_items`.

Contoh:

```txt
RAB item: Akun 4422 - Subkon
  ├── Realisasi 1
  ├── Realisasi 2
  └── Realisasi 3

Total realisasi akun = Realisasi 1 + Realisasi 2 + Realisasi 3
RAB awal tetap utuh dan tidak berubah.
```

---

## Endpoint utama

### Auth

```txt
POST /api/auth/login
POST /api/auth/logout
```

### Proyek

```txt
GET    /api/proyek
POST   /api/proyek
GET    /api/proyek/:id
PATCH  /api/proyek/:id
DELETE /api/proyek/:id
```

### RAB

```txt
GET    /api/proyek/:id/rab
POST   /api/proyek/:id/rab
PATCH  /api/rab/:itemId
DELETE /api/rab/:itemId
```

### Realisasi per akun — Phase 2C

```txt
GET    /api/proyek/:id/realisasi
POST   /api/rab/:itemId/realisasi
PATCH  /api/realisasi/:id
DELETE /api/realisasi/:id
```

### Master data dan kurs

```txt
GET/POST/PATCH /api/master/coa
GET/POST/PATCH /api/master/cabang
GET/POST/PATCH /api/master/user
GET/PUT        /api/kurs
```

---

## Setup lokal

### Prasyarat

- Node.js 20+ untuk backend
- Node.js versi modern untuk Vite frontend
- npm
- Supabase project

### 1. Clone repository

```bash
git clone https://github.com/thariqhatrama/divre-monitoring.git
cd divre-monitoring
```

### 2. Setup backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Isi `.env` backend:

```env
SUPABASE_URL=https://qefgdirmcbmeqcfyjzzy.supabase.co
SUPABASE_SERVICE_KEY=isi_dengan_service_role_key_dari_supabase_project_settings_api
JWT_SECRET=ganti_dengan_random_string_panjang_minimal_32_karakter
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

Health check backend:

```txt
GET http://localhost:3001/api/health
```

### 3. Setup frontend

Buka terminal lain:

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Isi `.env.local` frontend minimal:

```env
VITE_API_URL=http://localhost:3001
```

Buka aplikasi:

```txt
http://localhost:5173
```

---

## Database

Schema utama ada di:

```txt
backend/migrations/001_create_tables.sql
```

Seed data:

```txt
backend/migrations/002_seed_coa.sql
backend/migrations/003_seed_branches.sql
```

Tabel penting:

| Tabel | Fungsi |
|---|---|
| `projects` | Metadata proyek |
| `rab_items` | RAB awal per line item |
| `realisasi_items` | Histori transaksi realisasi per RAB item |
| `users` | User login dan role |
| `branches` | Cabang dan unit pelayanan |
| `coa_accounts` | Master COA Seg 5 |
| `kurs_history` | Riwayat kurs USD ke IDR |
| `audit_log` | Jejak perubahan data penting |

---

## Deployment

### Vercel — frontend

Konfigurasi project Vercel:

| Setting | Nilai |
|---|---|
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Production URL | `https://divre-monitoring.vercel.app/` |

Environment variable Vercel:

```env
VITE_API_URL=https://divre-api.onrender.com
```

### Render — backend

Konfigurasi service Render:

| Setting | Nilai |
|---|---|
| Root Directory | `backend` |
| Runtime | Node |
| Build Command | `npm install` |
| Start Command | `node src/app.js` |
| Production URL | `https://divre-api.onrender.com` |

Environment variable Render:

```env
SUPABASE_URL=https://qefgdirmcbmeqcfyjzzy.supabase.co
SUPABASE_SERVICE_KEY=<service_role_key_supabase>
JWT_SECRET=<random_secret_min_32_chars>
PORT=3001
CORS_ORIGIN=https://divre-monitoring.vercel.app
```

> Gunakan `SUPABASE_SERVICE_KEY` dari Supabase Project Settings > API. Jangan gunakan publishable/anon key untuk backend.

---

## Perintah validasi

Backend syntax check:

```bash
node --check backend/src/app.js
node --check backend/src/controllers/realisasi.controller.js
node --check backend/src/models/realisasi.model.js
node --check backend/src/routes/realisasi.routes.js
```

Frontend build:

```bash
npm --prefix frontend run build
```

Frontend lint jika diperlukan:

```bash
npm --prefix frontend run lint
```

---

## Checklist validasi Phase 2C

Gunakan checklist ini setelah deploy atau saat uji lokal dengan data test:

- [ ] Login sebagai PM atau admin.
- [ ] Buat/buka proyek yang sudah memiliki `seg11_no`.
- [ ] Tambahkan minimal satu item RAB.
- [ ] Buka halaman realisasi proyek.
- [ ] Tambahkan realisasi pertama pada satu item RAB.
- [ ] Tambahkan realisasi kedua pada item RAB yang sama.
- [ ] Pastikan total realisasi per akun dijumlahkan.
- [ ] Pastikan nilai RAB awal tidak berubah.
- [ ] Edit transaksi realisasi.
- [ ] Hapus transaksi realisasi.
- [ ] Pastikan `audit_log` mencatat `INSERT`, `UPDATE`, dan `DELETE`.
- [ ] Login sebagai Kepala Divre dan pastikan hanya bisa membaca data realisasi.
- [ ] Login sebagai PM cabang lain dan pastikan tidak bisa mengakses proyek di luar cabangnya.

---

## Scope guard

Jangan tambahkan fitur berikut ke MVP kecuali ada keputusan eksplisit:

- Approval workflow
- Email notification
- Push notification
- SLA monitoring
- Integrasi ERP langsung
- Import/export Excel `.xlsm`
- Mobile app native

---

## Dokumen penting

- [`docs/PRD.md`](docs/PRD.md) — requirement utama project
- [`CLAUDE.md`](CLAUDE.md) — instruksi coding dan batasan project
- [`STATUS.md`](STATUS.md) — progress development dan activity log
- [`CHECKLIST_SETUP.md`](CHECKLIST_SETUP.md) — checklist setup awal
- [`backend/migrations/README.md`](backend/migrations/README.md) — catatan migration database

---

## Lisensi dan penggunaan

Project ini dibuat sebagai aplikasi internal/OJT untuk kebutuhan monitoring margin proyek Divre Timur PT SUCOFINDO (Persero). Penggunaan, data, dan deployment mengikuti arahan internal project.
