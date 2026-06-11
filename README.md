# Dashboard Monitoring Margin Proyek Divre Timur

Aplikasi web internal untuk memantau **margin proyek** Divisi Regional Timur PT SUCOFINDO (Persero). Aplikasi ini membantu manajemen melihat kondisi margin proyek secara terpusat berdasarkan **RAB awal** dan **realisasi anggaran per akun**, sehingga proyek yang perlu perhatian dapat lebih cepat diidentifikasi.

---

## Tentang Aplikasi

Dashboard Monitoring Margin Proyek dirancang sebagai alat bantu monitoring, bukan sistem approval dan bukan pengganti ERP. Fokus utama aplikasi adalah menyajikan informasi margin proyek secara ringkas, terstruktur, dan mudah dibaca oleh pengguna internal.

Aplikasi ini mendukung alur kerja berikut:

1. Registrasi proyek dan metadata utama.
2. Input RAB awal per line item berdasarkan akun COA.
3. Input realisasi anggaran secara bertahap per akun RAB.
4. Perhitungan otomatis margin RAB, margin realisasi, dan delta margin.
5. Penandaan status margin: Aman, Perhatian, Kritis, atau Rugi.
6. Monitoring proyek berdasarkan role pengguna.

---

## Pengguna dan Akses

| Role | Akses Utama |
|---|---|
| Kepala Divre | Melihat seluruh proyek dari semua cabang |
| Project Manager | Mengelola proyek, RAB, dan realisasi untuk cabangnya sendiri |
| Admin / Staff RAB | Mengelola seluruh data, termasuk master COA, cabang, user, dan kurs |

Akses pengguna dikontrol melalui autentikasi JWT dan role-based access control di backend.

---

## Fitur Utama

### Monitoring Margin Proyek

- Menampilkan nilai proyek, total RAB, total realisasi, dan margin.
- Menghitung margin dalam satuan IDR.
- Mendukung status margin otomatis:
  - **Aman**
  - **Perhatian**
  - **Kritis**
  - **Rugi**

### Manajemen Proyek

- Registrasi proyek dengan metadata utama.
- Status proyek: `draft`, `aktif`, `selesai`, `arsip`.
- Project Manager hanya dapat mengelola proyek sesuai cabangnya.

### Input RAB

- Input RAB per line item.
- Akun biaya mengacu pada master COA.
- RAB hanya dapat diisi jika proyek sudah memiliki nomor Segmen 11.
- Total RAB dihitung otomatis dari qty, harga satuan, mata uang, dan kurs.

### Realisasi Per Akun

- Realisasi dicatat sebagai transaksi terpisah per item RAB.
- Satu item RAB dapat memiliki banyak transaksi realisasi.
- Total realisasi per akun dihitung dari agregasi seluruh transaksi terkait.
- Data RAB awal tetap utuh dan tidak ditimpa oleh realisasi berjalan.
- Perubahan realisasi dicatat ke audit log.

### Multi-currency

- Mendukung input IDR dan USD.
- Kurs disimpan pada saat input agar histori perhitungan tetap konsisten.
- Semua kalkulasi margin dikonversi dan dihitung dalam IDR.

---

## Rumus Perhitungan Aplikasi

Semua kalkulasi margin dilakukan dalam IDR. Nilai uang disimpan sebagai integer rupiah penuh, bukan sen/desimal.

### Konversi Nilai Proyek ke IDR

```txt
Nilai Proyek IDR = Nilai Proyek × Kurs IDR Proyek
```

Catatan:
- Untuk proyek IDR, `Kurs IDR Proyek = 1`.
- Pada form proyek, input proyek dikunci ke IDR sehingga nilai proyek langsung dibaca sebagai nilai rupiah.

### Total Line Item RAB

```txt
Subtotal RAB Line Item = Qty × Harga Satuan
Total IDR RAB Line Item = round(Qty × Harga Satuan × Kurs IDR)
```

Catatan:
- Untuk line item IDR, `Kurs IDR = 1`.
- Jika line item memakai USD, kurs disimpan pada item tersebut agar histori perhitungan tetap konsisten.
- Di database, `rab_items.total_idr` adalah generated column dari `qty`, `harga_satuan`, dan `kurs_idr`.

### Total RAB Proyek

```txt
Total RAB IDR = Σ Total IDR RAB Line Item
```

Total RAB juga dikelompokkan per kategori RAB:

```txt
Total RAB Kategori I   = Σ Total IDR item kategori I
Total RAB Kategori II  = Σ Total IDR item kategori II
Total RAB Kategori III = Σ Total IDR item kategori III
Total RAB Kategori IV  = Σ Total IDR item kategori IV
Total RAB Kategori V   = Σ Total IDR item kategori V
Total RAB Kategori VI  = Σ Total IDR item kategori VI
```

### Laba / Margin RAB

```txt
Laba Operasi RAB = Nilai Proyek IDR - Total RAB IDR
Margin RAB (%)   = (Laba Operasi RAB / Nilai Proyek IDR) × 100
```

Atau setara dengan:

```txt
Margin RAB (%) = (Nilai Proyek IDR - Total RAB IDR) / Nilai Proyek IDR × 100
```

Hasil persen margin dibulatkan sampai 2 angka desimal.

### Total Line Item Realisasi

```txt
Subtotal Realisasi Line Item = Qty Realisasi × Harga Satuan Realisasi
Total IDR Realisasi Line Item = round(Qty Realisasi × Harga Satuan Realisasi × Kurs IDR)
```

Catatan:
- Untuk transaksi realisasi IDR, `Kurs IDR = 1`.
- Jika realisasi memakai USD, kurs disimpan pada transaksi realisasi tersebut.
- Di database, `realisasi_items.total_idr` adalah generated column dari `qty`, `harga_satuan`, dan `kurs_idr`.

### Total Realisasi Proyek

```txt
Total Realisasi IDR = Σ Total IDR Realisasi Line Item
```

Satu item RAB bisa memiliki banyak transaksi realisasi. Total realisasi proyek adalah agregasi seluruh transaksi realisasi pada proyek tersebut.

### Laba / Margin Realisasi

```txt
Laba Operasi Realisasi = Nilai Proyek IDR - Total Realisasi IDR
Margin Realisasi (%)   = (Laba Operasi Realisasi / Nilai Proyek IDR) × 100
```

Atau setara dengan:

```txt
Margin Realisasi (%) = (Nilai Proyek IDR - Total Realisasi IDR) / Nilai Proyek IDR × 100
```

Hasil persen margin realisasi dibulatkan sampai 2 angka desimal.

### Delta Margin

```txt
Delta Margin = Margin Realisasi (%) - Margin RAB (%)
```

Indikator delta:

| Indikator | Kondisi | Arti |
|---|---:|---|
| `naik` | `Delta Margin > 0` | Margin realisasi lebih baik dari margin RAB |
| `tetap` | `Delta Margin = 0` | Margin realisasi sama dengan margin RAB |
| `turun` | `Delta Margin < 0` | Margin realisasi lebih rendah dari margin RAB |

### Persentase Subkon Akun 4422

```txt
Total Subkon 4422 IDR = Σ Total IDR RAB Line Item dengan kode_akun_seg5 = "4422"
Persen Subkon (%)     = (Total Subkon 4422 IDR / Nilai Proyek IDR) × 100
```

Hasil persen subkon dibulatkan sampai 2 angka desimal.

### Status Margin

Status margin ditentukan dari nilai margin persen, baik untuk margin RAB maupun margin realisasi:

| Status | Kondisi | Warna |
|---|---:|---|
| Aman | `>= 15%` | Hijau |
| Perhatian | `>= 6%` dan `< 15%` | Kuning |
| Kritis | `>= 0%` dan `< 6%` | Merah |
| Rugi | `< 0%` | Merah gelap |

Catatan KD No. 10/KD/2025: proyek dengan margin `< 6%` tidak dapat dilanjutkan, kecuali penugasan berbasis APBN.

### Preview Frontend

Frontend memakai rumus yang sama untuk preview saat input:

```txt
Preview Nilai Proyek IDR = Nilai Proyek × Kurs IDR Proyek
Preview Total Item IDR   = Qty × Harga Satuan × Kurs IDR
```

Jika kurs tidak valid untuk mata uang non-IDR, preview dihitung sebagai `0` sampai kurs valid diisi.

---

## Teknologi

| Layer | Teknologi |
|---|---|
| Frontend | React, Vite, React Router, Axios, Recharts |
| Backend | Node.js, Express, JWT, bcryptjs |
| Database | PostgreSQL via Supabase |
| Deployment Frontend | Vercel |
| Deployment Backend | Render |

---

## Struktur Repository

Project menggunakan struktur monorepo dengan dua aplikasi utama:

```txt
repo-root/
├── frontend/       # Aplikasi frontend React
├── backend/        # API backend Express
├── docs/           # Dokumentasi project
├── CLAUDE.md       # Panduan teknis untuk assistant development
├── STATUS.md       # Catatan progress development
└── README.md       # Dokumentasi publik project
```

Struktur frontend:

```txt
frontend/
├── src/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   └── utils/
├── vercel.json
└── package.json
```

Struktur backend:

```txt
backend/
├── src/
│   ├── controllers/
│   ├── db/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── app.js
├── migrations/
├── render.yaml
└── package.json
```

---

## API Utama

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

### Realisasi

```txt
GET    /api/proyek/:id/realisasi
POST   /api/rab/:itemId/realisasi
PATCH  /api/realisasi/:id
DELETE /api/realisasi/:id
```

### Master Data dan Kurs

```txt
GET/POST/PATCH /api/master/coa
GET/POST/PATCH /api/master/cabang
GET/POST/PATCH /api/master/user
GET/PUT        /api/kurs
```

---

## Setup Lokal

### Prasyarat

- Node.js 20 atau lebih baru
- npm
- Project Supabase

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Contoh konfigurasi `.env` backend:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
JWT_SECRET=your-random-secret-minimum-32-characters
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

Health check:

```txt
GET http://localhost:3001/api/health
```

### Frontend

Buka terminal baru:

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Contoh konfigurasi `.env.local` frontend:

```env
VITE_API_URL=http://localhost:3001
```

Akses aplikasi lokal:

```txt
http://localhost:5173
```

---

## Database

Schema dan migration database berada di folder:

```txt
backend/migrations/
```

Tabel utama:

| Tabel | Fungsi |
|---|---|
| `projects` | Data proyek |
| `rab_items` | RAB awal per line item |
| `realisasi_items` | Histori realisasi per item RAB |
| `users` | Data user dan role |
| `branches` | Data cabang dan unit pelayanan |
| `coa_accounts` | Master akun COA |
| `kurs_history` | Riwayat kurs |
| `audit_log` | Jejak perubahan data |

---

## Deployment

### Frontend — Vercel

| Setting | Nilai |
|---|---|
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

Environment variable:

```env
VITE_API_URL=https://divre-api.onrender.com
```

### Backend — Render

| Setting | Nilai |
|---|---|
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `node src/app.js` |

Environment variables:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
JWT_SECRET=your-random-secret-minimum-32-characters
PORT=3001
CORS_ORIGIN=https://divre-monitoring.vercel.app
```

---

## Perintah Validasi

Backend syntax check:

```bash
node --check backend/src/app.js
```

Frontend build:

```bash
npm --prefix frontend run build
```

Frontend lint:

```bash
npm --prefix frontend run lint
```

---

## Batasan Scope

Aplikasi ini difokuskan untuk monitoring margin proyek. Beberapa fitur berikut tidak termasuk dalam scope utama:

- Approval workflow
- Email notification
- Push notification
- SLA monitoring
- Integrasi ERP langsung
- Mobile app native

---

## Dokumentasi Terkait

- [`docs/PRD.md`](docs/PRD.md) — Product Requirement Document
- [`STATUS.md`](STATUS.md) — catatan progress pengembangan
- [`backend/migrations/README.md`](backend/migrations/README.md) — catatan migration database

---

## Penggunaan

Project ini dibuat untuk kebutuhan monitoring internal margin proyek Divisi Regional Timur PT SUCOFINDO (Persero). Konfigurasi, data, dan deployment mengikuti kebutuhan serta kebijakan internal project.
