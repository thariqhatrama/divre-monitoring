# CLAUDE.md — Dashboard Monitoring Margin Proyek
## Divisi Regional Timur · PT SUCOFINDO (Persero)

> File ini dibaca otomatis oleh Claude CLI setiap sesi. Jangan hapus atau pindahkan dari root repo. Requirement utama ada di `docs/PRD.md`; baca PRD sebelum membuat atau mengubah fitur.

---

## 1. Gambaran Proyek

Aplikasi web internal untuk memantau **margin proyek** (RAB vs. realisasi) di 13 cabang Divisi Regional Timur PT SUCOFINDO. Tujuan tunggal: membantu Kepala Divre mengambil keputusan cepat terhadap proyek bermasalah.

**Bukan** sistem approval, bukan pengganti ERP, bukan aplikasi publik.

---

## 2. Stack & Deployment

| Layer | Teknologi | Platform |
|---|---|---|
| Frontend | React 19 + Vite 8 + React Router v7 + Recharts | Vercel |
| Backend | Node.js 20 + Express 5.2.1 | Render (free web service) |
| Database | PostgreSQL via Supabase | Supabase (free tier) |
| Auth | JWT (jsonwebtoken) + bcryptjs | Di backend |
| HTTP Client | Axios | Di frontend |

**Environment variables:**
- Frontend: `VITE_API_URL` → URL backend Render (`https://divre-api.onrender.com`)
- Backend: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `JWT_SECRET`, `PORT`, `CORS_ORIGIN`

---

## 3. Struktur Repo

```
repo-root/
├── CLAUDE.md                 ← file ini
├── docs/
│   └── PRD.md                ← requirement utama project
├── frontend/                 ← deploy ke Vercel
│   ├── src/
│   │   ├── pages/            ← halaman utama
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx         ← Kepala Divre (semua cabang)
│   │   │   ├── DashboardCabang.jsx   ← PM (cabang sendiri)
│   │   │   ├── ProyekList.jsx
│   │   │   ├── ProyekDetail.jsx      ← breakdown RAB vs realisasi
│   │   │   ├── ProyekForm.jsx        ← registrasi proyek baru
│   │   │   ├── RABForm.jsx           ← input line item RAB
│   │   │   └── RealisasiForm.jsx     ← update realisasi per akun
│   │   ├── components/
│   │   │   ├── MarginBadge.jsx       ← badge warna status margin
│   │   │   ├── MarginCard.jsx        ← KPI card summary
│   │   │   ├── RABTable.jsx          ← tabel line item RAB + realisasi
│   │   │   ├── MarginChart.jsx       ← bar chart margin per cabang
│   │   │   ├── BreakdownChart.jsx    ← bar horizontal RAB vs realisasi
│   │   │   ├── ProyekTable.jsx       ← tabel utama dashboard
│   │   │   └── ProtectedRoute.jsx    ← guard route berbasis role
│   │   ├── hooks/
│   │   │   ├── useProyek.js          ← fetch + state proyek
│   │   │   ├── useRAB.js             ← fetch + state RAB items
│   │   │   └── useAuth.js            ← auth state, login, logout
│   │   ├── services/
│   │   │   └── api.js                ← semua Axios calls ke backend
│   │   ├── utils/
│   │   │   ├── formatIDR.js          ← format angka ke "Rp 1.234.567"
│   │   │   ├── marginFlag.js         ← hitung status: aman/perhatian/kritis/rugi
│   │   │   ├── currencyConvert.js    ← konversi USD→IDR untuk display
│   │   │   └── segmenCOA.js          ← konstanta mapping segmen COA
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── FilterContext.jsx     ← state filter dashboard (cabang, status, dll)
│   │   └── main.jsx
│   ├── vercel.json
│   └── package.json
│
└── backend/                  ← deploy ke Render
    ├── src/
    │   ├── routes/
    │   │   ├── auth.routes.js        ← POST /api/auth/login, /logout
    │   │   ├── proyek.routes.js      ← CRUD proyek
    │   │   ├── rab.routes.js         ← CRUD RAB items
    │   │   ├── realisasi.routes.js   ← update realisasi per item
    │   │   ├── dashboard.routes.js   ← GET aggregat untuk dashboard
    │   │   ├── master.routes.js      ← cabang, COA, user (admin only)
    │   │   └── kurs.routes.js        ← GET/PUT kurs USD-IDR
    │   ├── controllers/
    │   │   ├── proyek.controller.js
    │   │   ├── rab.controller.js
    │   │   ├── realisasi.controller.js
    │   │   ├── dashboard.controller.js
    │   │   └── master.controller.js
    │   ├── services/
    │   │   ├── margin.service.js     ← INTI: semua kalkulasi margin
    │   │   ├── coa.service.js        ← validasi kode akun aktif di COA 2025
    │   │   └── kurs.service.js       ← ambil kurs terkini dari DB
    │   ├── models/
    │   │   ├── proyek.model.js       ← query ke tabel projects
    │   │   ├── rab.model.js          ← query ke tabel rab_items
    │   │   ├── user.model.js
    │   │   └── coa.model.js
    │   ├── middleware/
    │   │   ├── auth.middleware.js    ← verifikasi JWT
    │   │   ├── rbac.middleware.js    ← cek role: kepala_divre | pm | admin
    │   │   └── validate.middleware.js ← joi/zod schema validation
    │   ├── db/
    │   │   └── supabase.js           ← init supabase client (service key)
    │   └── app.js                    ← express setup, mount routes, cors
    ├── migrations/
    │   ├── 001_create_tables.sql
    │   ├── 002_seed_coa.sql          ← import COA 2025
    │   └── 003_seed_branches.sql     ← import cabang dari COA Seg 2&3
    ├── render.yaml
    └── package.json
```

---

## 4. Deployment Monorepo — Wajib

Project memakai satu repository dengan dua root aplikasi:

```
repo-root/
├── frontend/   ← Vercel Root Directory
└── backend/    ← Render Root Directory
```

Konfigurasi deployment:

**Vercel**
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`
- Env: `VITE_API_URL=https://divre-api.onrender.com`

**Render**
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `node src/app.js`
- Env: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `JWT_SECRET`, `PORT`, `CORS_ORIGIN`
- Production URL backend: `https://divre-api.onrender.com`
- Production URL frontend: `https://divre-monitoring.vercel.app/`

Jangan pindahkan frontend dan backend ke repository terpisah. Jangan membuat file backend di folder frontend atau sebaliknya.

---

## 5. Domain & Business Rules — Paling Penting

### 5.1 Kalkulasi Margin (ada di `margin.service.js`)

```js
// Semua angka dalam IDR (integer, dalam rupiah penuh — bukan sen)
// Konversi USD dilakukan sebelum masuk kalkulasi

marginRAB = (nilaiProyek - totalBiayaRAB) / nilaiProyek * 100
marginRealisasi = (nilaiProyek - totalBiayaRealisasi) / nilaiProyek * 100
deltaMargin = marginRealisasi - marginRAB
```

### 5.2 Flag Status Margin (`marginFlag.js` di frontend, juga di backend untuk konsistensi)

```js
// Berdasarkan KD No. 10/KD/2025
if (margin >= 15)         return { status: 'aman',       color: 'green' }
if (margin >= 6)          return { status: 'perhatian',  color: 'yellow' }
if (margin >= 0)          return { status: 'kritis',     color: 'red' }
                          return { status: 'rugi',       color: 'darkred' }
// Proyek margin < 6% tidak bisa dilanjutkan (kecuali APBN/penugasan K/L)
```

### 5.3 % Subkon (dihitung otomatis, ditampilkan di detail proyek)

```js
// Kode akun subkon = 4422
persen_subkon = totalBiayaAkun4422 / nilaiProyek * 100
```

### 5.4 Gate Segmen 11

Proyek yang belum punya `seg11_no` → field RAB **disabled**. Tidak ada bypass.
Logika ini ada di `RABForm.jsx` (frontend) dan divalidasi ulang di `rab.controller.js` (backend).

### 5.5 Multi-currency

- Nilai proyek bisa IDR atau USD
- Setiap line item RAB punya field `mata_uang` (IDR/USD) dan `kurs_idr`
- Kurs disimpan di tabel `kurs_history`, dikelola admin, default dipakai saat input
- Semua kalkulasi margin dalam IDR

---

## 6. Database Schema (Supabase/PostgreSQL)

```sql
-- Tabel utama
projects         → id, nama, nomor_spmk, seg11_no, cabang_id, klien,
                   nilai_proyek, mata_uang_proyek, kurs_idr_proyek,
                   tgl_mulai, tgl_selesai, portofolio_seg7, sub_portofolio_seg8,
                   pmu_kso_seg9, pm_user_id, status, created_by, updated_at

rab_items        → id, project_id, kategori (I-VI), kode_akun_seg5, seg4_kode,
                   uraian, qty, satuan, mata_uang, harga_satuan, kurs_idr,
                   total_idr (generated),
                   updated_by, updated_at
realisasi_items  → id, rab_item_id, project_id, tanggal_realisasi, qty, satuan,
                   mata_uang, harga_satuan, kurs_idr, total_idr (generated),
                   catatan, created_by, created_at, updated_at

-- Master data (dikelola admin/Staff RAB)
users            → id, nama, email, password_hash, role, cabang_id
branches         → id, kode_seg23, nama, tipe, parent_id
coa_accounts     → kode_seg5, nama, seg4_default, kategori_rab, tipe_fv, aktif
kurs_history     → id, mata_uang, kurs_idr, berlaku_mulai, dibuat_oleh

-- Audit
audit_log        → id, tabel, record_id, aksi, nilai_lama, nilai_baru, user_id, waktu
```

---

## 7. API Endpoints

```
Auth
  POST   /api/auth/login
  POST   /api/auth/logout

Proyek
  GET    /api/proyek              → list (filter: cabang_id, status, tahun)
  POST   /api/proyek              → buat baru
  GET    /api/proyek/:id          → detail + margin summary
  PATCH  /api/proyek/:id          → update metadata / status
  DELETE /api/proyek/:id          → soft delete (admin only)

RAB
  GET    /api/proyek/:id/rab      → semua line item + total per kategori
  POST   /api/proyek/:id/rab      → tambah line item
  PATCH  /api/rab/:itemId         → edit line item
  DELETE /api/rab/:itemId         → hapus line item

Realisasi
  GET    /api/proyek/:id/realisasi   → list transaksi realisasi proyek
  POST   /api/rab/:itemId/realisasi  → tambah transaksi realisasi per akun
  PATCH  /api/realisasi/:id          → edit transaksi realisasi
  DELETE /api/realisasi/:id          → hapus transaksi realisasi

Dashboard
  GET    /api/dashboard/summary   → KPI cards (total proyek, avg margin, dll)
  GET    /api/dashboard/by-cabang → margin per cabang untuk chart

Master (admin only)
  GET/POST/PATCH /api/master/coa
  GET/POST/PATCH /api/master/cabang
  GET/POST/PATCH /api/master/user
  GET/PUT        /api/kurs
```

---

## 8. Role & Akses

```
kepala_divre → baca semua proyek semua cabang, tidak bisa edit
pm           → CRUD proyek + RAB + realisasi milik cabangnya sendiri (cabang_id match)
admin        → semua akses + master data management
```

RBAC dicek di `rbac.middleware.js`. Setiap route protected punya dua middleware:
```js
router.get('/proyek', authMiddleware, rbacMiddleware(['kepala_divre','pm','admin']), controller)
```

---

## 9. Conventions

### Angka finansial
```js
// SELALU simpan dalam integer IDR (rupiah penuh, bukan sen, bukan float)
// JANGAN: 1500000.50 atau "1.500.000"
// BENAR:  1500000 (integer)

// Display pakai formatIDR.js:
formatIDR(1500000) // → "Rp 1.500.000"
formatIDR(1500000, { short: true }) // → "Rp 1,5 jt"
```

### Kode akun COA
```js
// SELALU string, bukan number
// JANGAN: 4422 (number)
// BENAR:  "4422" (string)
```

### Status proyek
```js
// Enum: 'draft' | 'aktif' | 'selesai' | 'arsip'
```

### Kategori RAB
```js
// Enum: 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI'
// I   = Beban Personil
// II  = Tenaga Ahli & Labour Supply
// III = Perjalanan Dinas
// IV  = Beban Operasional
// V   = Peralatan & Sewa
// VI  = Overhead & Administrasi
```

### HTTP responses
```js
// Sukses: { success: true, data: {...} }
// Error:  { success: false, error: { code: 'NOT_FOUND', message: '...' } }
```

---

## 10. Hal yang JANGAN Dilakukan Claude

- Jangan tambah fitur approval workflow — ini monitoring only
- Jangan tambah email notification
- Jangan setup ORM (Sequelize/Prisma) — pakai supabase-js langsung
- Jangan pisah frontend dan backend ke repo berbeda
- Jangan mengubah COA Tahun 2025 menjadi COA 2026 tanpa instruksi eksplisit user
- Jangan simpan angka finansial sebagai float/string di database
- Jangan hardcode kode COA — selalu ambil dari tabel `coa_accounts`
- Jangan bypass gate Segmen 11 walau diminta

---

## 11. Task yang Sering Diminta

**"Buat endpoint baru"**
→ Tambah route di `routes/`, controller di `controllers/`, query di `models/`
→ Pastikan `authMiddleware` + `rbacMiddleware` dipasang

**"Buat komponen baru"**
→ Cek apakah sudah ada di `components/` dulu
→ Pakai `useProyek` atau `useRAB` hook jika butuh data proyek/RAB
→ Format angka pakai `formatIDR.js`, status margin pakai `marginFlag.js`

**"Debug kalkulasi margin salah"**
→ Cek `margin.service.js` di backend dan `marginFlag.js` di frontend
→ Pastikan konversi currency sudah dilakukan SEBELUM kalkulasi margin
→ Pastikan `total_idr` di `rab_items` adalah generated column, bukan hardcoded

**"Tambah filter di dashboard"**
→ State filter ada di `FilterContext.jsx`
→ Backend: tambah query param di `dashboard.routes.js` dan controller
