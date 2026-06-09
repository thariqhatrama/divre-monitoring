# STATUS.md — Monitoring Status Project
## Dashboard Monitoring Margin Proyek Divre Timur

> File ini digunakan untuk memantau progress development, keputusan teknis, perubahan fitur, bug, dan status tiap fase. Update file ini setiap selesai mengerjakan task besar atau sebelum membuka sesi Claude CLI baru.

---

## 1. Ringkasan Project

**Nama project:** Dashboard Monitoring Margin Proyek Divre Timur  
**Tujuan utama:** Menampilkan margin masing-masing project berdasarkan RAB awal dan realisasi anggaran agar Kepala Divre dapat mengambil keputusan lebih cepat terhadap project cabang yang sedang berjalan.  
**Timeline:** 3 minggu  
**Scope utama:** Monitoring margin, bukan approval, bukan SLA, bukan ERP.  
**COA acuan:** COA Tahun 2025  
**Status saat ini:** Phase 1C auth dan RBAC tervalidasi untuk admin; backend auth route, JWT middleware, RBAC middleware, frontend login/auth context, protected route tersedia; bootstrap admin berhasil login dan admin RBAC route sukses

---

## 2. Status Global

| Area | Status | Catatan |
|---|---|---|
| Repo setup | ✅ Selesai | Repo GitHub: `https://github.com/thariqhatrama/divre-monitoring`; struktur root tersedia |
| Frontend setup | 🟨 Dalam proses | React 19 + Vite 8 tersedia; Vercel root `frontend/` |
| Backend setup | ✅ Selesai | Phase 1A selesai: Express 5.2.1, middleware dasar, Supabase client, health check `/api/health`; Render root `backend/` |
| Database setup | 🟨 Dalam proses | Project Supabase sudah dibuat; `001_create_tables.sql` sudah dijalankan dan tabel berhasil dibuat; seed belum dibuat/dijalankan |
| Auth & RBAC | ✅ Selesai | Phase 1C tervalidasi: bootstrap admin login sukses, JWT dibuat, dan admin RBAC route berhasil |
| Master data COA | ⬜ Belum mulai | Seed dari COA 2025 |
| Master data cabang | ⬜ Belum mulai | 13 cabang + 26 UP |
| Proyek | ⬜ Belum mulai | Registrasi proyek + Segmen 11 |
| RAB | ⬜ Belum mulai | Input line item RAB |
| Realisasi | ⬜ Belum mulai | Realisasi per akun |
| Kalkulasi margin | ⬜ Belum mulai | RAB, realisasi, delta |
| Dashboard | ⬜ Belum mulai | Kepala Divre + PM |
| Deployment | ⬜ Belum mulai | Vercel + Render |

Keterangan status:
- ⬜ Belum mulai
- 🟨 Dalam proses
- ✅ Selesai
- ⚠️ Perlu revisi
- ❌ Dibatalkan / keluar scope

---

## 3. Checklist Setup Awal

### 3.1 Repository

- [x] Buat repo GitHub `divre-monitoring` (`https://github.com/thariqhatrama/divre-monitoring`)
- [x] Buat struktur folder:
  - [x] `frontend/`
  - [x] `backend/`
  - [x] `docs/`
- [x] Letakkan file berikut di root:
  - [x] `CLAUDE.md`
  - [x] `STATUS.md`
  - [x] `CHECKLIST_SETUP.md`
  - [x] `.gitignore`
- [x] Letakkan file berikut di `docs/`:
  - [x] `PRD.md`
  - [x] `PROMPTS_CLAUDE_PHASES.md`
- [x] Buat struktur backend penting:
  - [x] `backend/src/routes/`
  - [x] `backend/src/controllers/`
  - [x] `backend/src/models/`
  - [x] `backend/src/services/`
  - [x] `backend/src/middleware/`
  - [x] `backend/src/db/`
  - [x] `backend/migrations/`
- [x] Buat server minimal `backend/src/app.js` untuk start Render

### 3.2 Platform

- [x] Buat project Supabase (`https://qefgdirmcbmeqcfyjzzy.supabase.co`)
- [x] Buat project Vercel dengan Root Directory: `frontend` (`https://divre-monitoring.vercel.app/`)
- [x] Buat service Render dengan Root Directory: `backend` (`https://divre-api.onrender.com`)
- [ ] Set environment variables frontend
- [ ] Set environment variables backend

### 3.3 Database

- [x] Jalankan migration `001_create_tables.sql` — tabel berhasil dibuat di Supabase
- [ ] Jalankan seed `002_seed_coa.sql` — sumber data tersedia di `docs/COA tahun 2025.xlsx`, dibuat pada Phase 1D
- [ ] Jalankan seed `003_seed_branches.sql`
- [x] Buat admin user pertama
- [x] Test koneksi backend ke Supabase

---

## 4. Checklist Development per Fase

## Fase 1 — Setup, Auth, Master Data, Proyek, RAB Basic

Target: fondasi aplikasi bisa jalan dari login sampai input RAB basic.

### Backend

- [x] `backend/src/app.js` — Express app, middleware dasar, dan health check `/api/health`
- [x] `backend/src/db/supabase.js` — init Supabase client via env vars
- [x] `backend/src/middleware/auth.middleware.js`
- [x] `backend/src/middleware/rbac.middleware.js`
- [x] `backend/src/routes/auth.routes.js`
- [x] `backend/src/controllers/auth.controller.js`
- [x] `backend/src/models/user.model.js`
- [ ] `backend/src/routes/proyek.routes.js`
- [ ] `backend/src/controllers/proyek.controller.js`
- [ ] `backend/src/models/proyek.model.js`
- [ ] `backend/src/routes/rab.routes.js`
- [ ] `backend/src/controllers/rab.controller.js`
- [ ] `backend/src/models/rab.model.js`
- [ ] `backend/src/services/coa.service.js`
- [ ] `backend/src/routes/master.routes.js`
- [ ] `backend/src/controllers/master.controller.js`

### Frontend

- [x] `frontend/src/services/api.js`
- [x] `frontend/src/context/AuthContext.jsx`
- [x] `frontend/src/components/ProtectedRoute.jsx`
- [x] `frontend/src/pages/Login.jsx`
- [ ] `frontend/src/pages/ProyekList.jsx`
- [ ] `frontend/src/pages/ProyekForm.jsx`
- [ ] `frontend/src/pages/RABForm.jsx`

### Validasi Fase 1

- [x] Admin bisa login
- [ ] PM bisa login
- [ ] Kepala Divre bisa login
- [ ] PM hanya melihat proyek cabangnya sendiri
- [ ] Proyek bisa dibuat
- [ ] Form RAB terkunci jika `seg11_no` kosong
- [ ] Kode akun COA non-aktif tidak bisa digunakan

---

## Fase 2 — Margin, Realisasi, Multi-currency

Target: aplikasi sudah bisa menghitung margin RAB, margin realisasi, dan delta margin.

### Backend

- [ ] `backend/src/services/margin.service.js`
- [ ] `backend/src/services/kurs.service.js`
- [ ] `backend/src/routes/realisasi.routes.js`
- [ ] `backend/src/controllers/realisasi.controller.js`
- [ ] `backend/src/models/realisasi.model.js`
- [ ] `backend/src/routes/kurs.routes.js`
- [ ] Audit log untuk perubahan RAB
- [ ] Audit log untuk input realisasi

### Frontend

- [ ] `frontend/src/utils/formatIDR.js`
- [ ] `frontend/src/utils/marginFlag.js`
- [ ] `frontend/src/utils/currencyConvert.js`
- [ ] `frontend/src/components/MarginBadge.jsx`
- [ ] `frontend/src/components/MarginCard.jsx`
- [ ] `frontend/src/pages/RealisasiForm.jsx`
- [ ] Update `RABForm.jsx` agar kalkulasi real-time

### Validasi Fase 2

- [ ] Margin RAB muncul real-time
- [ ] Input USD dikonversi ke IDR sebelum kalkulasi
- [ ] Realisasi bisa ditambahkan per akun
- [ ] Margin realisasi dihitung otomatis
- [ ] Delta margin tampil naik/turun
- [ ] Status margin tampil: aman, perhatian, kritis, rugi
- [ ] Akun subkon 4422 dihitung sebagai % subkon

---

## Fase 3 — Dashboard, Detail, Deploy

Target: aplikasi siap demo dan bisa diakses via browser.

### Backend

- [ ] `backend/src/routes/dashboard.routes.js`
- [ ] `backend/src/controllers/dashboard.controller.js`
- [ ] Endpoint KPI summary
- [ ] Endpoint margin per cabang
- [ ] Endpoint detail proyek lengkap
- [ ] Filter dashboard: cabang, tahun, status proyek, status margin

### Frontend

- [ ] `frontend/src/pages/Dashboard.jsx`
- [ ] `frontend/src/pages/DashboardCabang.jsx`
- [ ] `frontend/src/pages/ProyekDetail.jsx`
- [ ] `frontend/src/components/ProyekTable.jsx`
- [ ] `frontend/src/components/MarginChart.jsx`
- [ ] `frontend/src/components/BreakdownChart.jsx`
- [ ] `frontend/src/context/FilterContext.jsx`
- [ ] Highlight proyek kritis/rugi

### Deployment

- [ ] Deploy backend ke Render
- [ ] Deploy frontend ke Vercel
- [ ] Set CORS Render ke domain Vercel
- [ ] Set `VITE_API_URL` di Vercel
- [ ] Test login di production
- [ ] Test input proyek di production
- [ ] Test dashboard di production

---

## 5. Log Activity

> Tambahkan log terbaru di paling atas.

| Tanggal | Tipe | Area | Deskripsi | File Terkait | Status |
|---|---|---|---|---|---|
| 2026-06-09 | Fix | Backend Setup | Memperbaiki startup backend Node 20 dengan dependency `ws` untuk transport WebSocket Supabase; backend berhasil start di port 3001 | `backend/src/db/supabase.js`, `backend/package.json`, `backend/package-lock.json` | ✅ |
| 2026-06-09 | Add | Auth & RBAC | Menyelesaikan validasi Phase 1C: bootstrap admin dibuat di Supabase, `/api/health` sukses, login admin sukses, JWT dibuat, dan `/api/test/admin` berhasil memvalidasi RBAC admin | `STATUS.md`, `backend/src/routes/test.routes.js`, `backend/src/controllers/auth.controller.js`, `backend/src/models/user.model.js` | ✅ |
| 2026-06-03 | Add | Auth & RBAC | Menyelesaikan Phase 1C: backend login/logout, JWT auth middleware, RBAC middleware, protected test route, frontend login/auth context/protected route; backend health dan frontend build berhasil | `backend/src/routes/auth.routes.js`, `backend/src/controllers/auth.controller.js`, `backend/src/models/user.model.js`, `backend/src/middleware/auth.middleware.js`, `backend/src/middleware/rbac.middleware.js`, `frontend/src/services/api.js`, `frontend/src/context/AuthContext.jsx`, `frontend/src/hooks/useAuth.js`, `frontend/src/pages/Login.jsx`, `frontend/src/components/ProtectedRoute.jsx`, `frontend/src/App.jsx`, `frontend/src/main.jsx`, `STATUS.md` | ✅ |
| 2026-06-03 | Add | Database | Menyelesaikan Phase 1B: membuat migration schema dasar sesuai PRD, tanpa tabel approval/SLA; mencatat `docs/COA tahun 2025.xlsx` sebagai sumber seed COA Phase 1D | `backend/migrations/001_create_tables.sql`, `backend/migrations/README.md`, `docs/COA tahun 2025.xlsx`, `STATUS.md` | ✅ |
| 2026-06-03 | Add | Backend Setup | Menyelesaikan Phase 1A: Express app, middleware dasar, Supabase client, dan health check `/api/health`; validasi lokal berhasil | `backend/src/app.js`, `backend/src/db/supabase.js`, `STATUS.md` | ✅ |
| 2026-06-03 | Add | Backend Setup | Membuat server Express minimal dan struktur folder backend penting tanpa menambah fitur MVP | `backend/src/app.js`, `backend/src/routes/`, `backend/src/controllers/`, `backend/src/models/`, `backend/src/services/`, `backend/src/middleware/`, `backend/src/db/`, `backend/migrations/` | ✅ |
| 2026-06-03 | Docs | Setup | Menyesuaikan PRD/CLAUDE.md dengan dependency terinstall, URL GitHub, Render, Vercel, dan template env Supabase | `docs/PRD.md`, `CLAUDE.md`, `backend/.env.example`, `frontend/.env.example`, `backend/migrations/README.md` | ✅ |
| YYYY-MM-DD | Init | Dokumentasi | Membuat STATUS.md untuk monitoring project | `STATUS.md` | ✅ |
| YYYY-MM-DD | Init | Dokumentasi | Membuat PRD final dan aturan Claude | `docs/PRD.md`, `CLAUDE.md` | ✅ |

Tipe activity:
- `Add` = penambahan fitur/file
- `Change` = perubahan logic/struktur
- `Fix` = perbaikan bug
- `Remove` = penghapusan fitur/file
- `Refactor` = perapihan tanpa mengubah behavior
- `Docs` = dokumentasi
- `Deploy` = deployment
- `Decision` = keputusan teknis/bisnis

---

## 6. Bug Log

| ID | Tanggal | Severity | Area | Bug | Penyebab | Solusi | Status |
|---|---|---|---|---|---|---|---|
| BUG-001 | YYYY-MM-DD | High | Auth | Contoh: JWT tidak terbaca di protected route | Token belum disimpan di localStorage | Perbaiki AuthContext | ⬜ |

Severity:
- `Critical` = aplikasi tidak bisa digunakan
- `High` = fitur utama rusak
- `Medium` = fitur terganggu tapi ada workaround
- `Low` = minor UI/copywriting

---

## 7. Decision Log

| Tanggal | Keputusan | Alasan | Dampak |
|---|---|---|---|
| 2026-06-03 | File `docs/COA tahun 2025.xlsx` menjadi sumber seed COA | User sudah menyimpan file COA untuk kebutuhan Phase 1D | `002_seed_coa.sql` harus mengambil akun COA dari file tersebut, bukan hardcode manual sembarang |
| YYYY-MM-DD | COA menggunakan COA Tahun 2025 | Sesuai file project dan arahan final | Semua seed, validasi, dan dokumen memakai COA 2025 |
| YYYY-MM-DD | Tidak membuat approval workflow di MVP | Aplikasi hanya monitoring dan timeline 3 minggu | Scope lebih ringan dan fokus pada margin |
| YYYY-MM-DD | PRD disimpan di `docs/PRD.md` | Agar bisa dibaca assistant coding sebagai requirement utama | Konsistensi development lebih terjaga |
| YYYY-MM-DD | Vercel membaca `frontend/`, Render membaca `backend/` | Monorepo lebih sederhana untuk satu project | Satu repo cukup untuk FE dan BE |

---

## 8. Scope Guard

Fitur berikut **jangan dikerjakan di MVP**, kecuali ada keputusan baru dari mentor:

- [ ] Approval workflow
- [ ] Email notifier
- [ ] Push notification
- [ ] SLA monitoring
- [ ] Integrasi ERP langsung
- [ ] Integrasi SIMONIK/e-project langsung
- [ ] Import RAB Excel `.xlsm`
- [ ] Export RAB Excel `.xlsm`
- [ ] Analisis bottleneck advanced
- [ ] Mobile app native

Catatan: Import/export Excel boleh masuk update berikutnya setelah kalkulasi margin berjalan stabil.

---

## 9. Current Context untuk Sesi Claude Berikutnya

Update bagian ini sebelum membuka sesi Claude baru agar tidak kehilangan konteks.

### Terakhir dikerjakan

Tulis ringkasan singkat pekerjaan terakhir.

```txt
Phase 1C auth dan RBAC selesai dibuat dan tervalidasi untuk admin. Backend memiliki POST /api/auth/login, POST /api/auth/logout, auth.middleware.js untuk JWT, rbac.middleware.js untuk role kepala_divre/pm/admin, user.model.js, serta route test /api/test/protected dan /api/test/admin. Backend sempat gagal start di Node 20 karena Supabase Realtime membutuhkan WebSocket transport; sudah diperbaiki dengan dependency `ws` dan konfigurasi `realtime.transport`. Bootstrap admin `admin@regtim.com` sudah dibuat di Supabase; validasi `/api/health`, login admin, JWT, dan `/api/test/admin` berhasil. Frontend memiliki api.js, AuthContext.jsx, useAuth.js, Login.jsx, ProtectedRoute.jsx, serta route sederhana untuk validasi protected page.
```

### File yang terakhir diubah

```txt
backend/src/app.js
backend/src/routes/auth.routes.js
backend/src/routes/test.routes.js
backend/src/controllers/auth.controller.js
backend/src/models/user.model.js
backend/src/middleware/auth.middleware.js
backend/src/middleware/rbac.middleware.js
backend/src/db/supabase.js
backend/package.json
backend/package-lock.json
frontend/src/services/api.js
frontend/src/context/AuthContext.jsx
frontend/src/hooks/useAuth.js
frontend/src/components/ProtectedRoute.jsx
frontend/src/pages/Login.jsx
frontend/src/App.jsx
frontend/src/main.jsx
frontend/src/App.css
STATUS.md
```

### Masalah yang belum selesai

```txt
Admin bootstrap sudah dibuat dan login admin end-to-end sudah tervalidasi. Password bootstrap saat ini sementara dan harus diganti/dirotasi saat fitur user management Phase 1D tersedia. PM dan Kepala Divre user belum dibuat, sehingga validasi login untuk role tersebut belum dilakukan. Seed COA 002_seed_coa.sql belum dibuat; sumber datanya adalah docs/COA tahun 2025.xlsx dan akan dikerjakan di Phase 1D. Seed cabang 003_seed_branches.sql belum dibuat. Backend env production di Render masih perlu diisi manual memakai SUPABASE_SERVICE_KEY dari Supabase Project Settings > API (service_role), bukan publishable key. Proyek, RAB, master data, dan fitur lain belum dibuat.
```

### Prompt lanjutan untuk Claude

```txt
Lanjutkan dari STATUS.md bagian "Masalah yang belum selesai". Jangan membuat fitur baru di luar PRD.md. Phase 1C admin auth/RBAC sudah tervalidasi. Fokus berikutnya adalah Phase 1D master data sesuai urutan prompt project: COA, cabang, user, dan kurs; pastikan password bootstrap admin diganti/dirotasi saat user management tersedia.
```

---

## 10. Definition of Done Final

Project dianggap selesai untuk demo apabila:

- [ ] User admin, PM, dan Kepala Divre bisa login
- [ ] Admin bisa mengelola master COA, cabang, user, dan kurs
- [ ] PM bisa membuat proyek sesuai cabangnya
- [ ] Form RAB terkunci jika Segmen 11 belum diisi
- [ ] PM bisa input RAB per akun COA
- [ ] PM bisa input realisasi per akun
- [ ] Margin RAB dihitung otomatis
- [ ] Margin realisasi dihitung otomatis
- [ ] Delta margin tampil naik/turun
- [ ] Kepala Divre bisa melihat seluruh proyek
- [ ] PM hanya bisa melihat proyek cabangnya sendiri
- [ ] Proyek kritis/rugi ter-highlight
- [ ] Dashboard bisa difilter dan disortir
- [ ] Detail proyek menampilkan breakdown RAB vs realisasi
- [ ] Aplikasi live di Vercel + Render
- [ ] Tidak ada fitur approval, email notifier, atau SLA di MVP
