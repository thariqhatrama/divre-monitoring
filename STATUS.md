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
**Status saat ini:** Realisasi, margin realisasi/delta, dashboard Kepala Divre/PM, detail proyek, deployment Vercel/Render, dan validasi production sudah selesai. Filter dashboard tetap memakai implementasi saat ini: state filter lokal di halaman dashboard, bukan `FilterContext.jsx`.

---

## 2. Status Global

| Area | Status | Catatan |
|---|---|---|
| Repo setup | ✅ Selesai | Repo GitHub: `https://github.com/thariqhatrama/divre-monitoring`; struktur root tersedia |
| Frontend setup | ✅ Selesai | React 19 + Vite 8 tersedia; Vercel root `frontend/`; build lokal berhasil dengan Node `v22.22.3` |
| Backend setup | ✅ Selesai | Phase 1A selesai: Express 5.2.1, middleware dasar, Supabase client, health check `/api/health`; Render root `backend/` |
| Database setup | 🟨 Dalam proses | Project Supabase sudah dibuat; `001_create_tables.sql`, `002_seed_coa.sql`, dan `003_seed_branches.sql` sudah dijalankan/diinsert |
| Auth & RBAC | ✅ Selesai | Phase 1C tervalidasi: bootstrap admin login sukses, JWT dibuat, dan admin RBAC route berhasil |
| Master data COA | ✅ Selesai | Seed COA Tahun 2025 dari `docs/COA tahun 2025.xlsx` sheet `SEG 5 (BIAYA)` berisi 86 akun detail RAB |
| Master data cabang | ✅ Selesai | Seed 13 cabang + 26 UP Divre Timur sudah dibuat dan diinsert ke Supabase |
| Proyek | ✅ Selesai | Phase 1E: CRUD proyek + RBAC cabang PM + gate Segmen 11 indicator |
| RAB | ✅ Selesai | Phase 1F: input line item RAB basic + gate Segmen 11 backend/frontend |
| Realisasi | ✅ Selesai | Backend/frontend realisasi sudah dibuat, syntax/build lokal lulus, dan runtime API/UI dengan data Supabase tervalidasi oleh user |
| Kalkulasi margin | ✅ Selesai | Margin RAB, margin realisasi, delta margin, status margin, dan % subkon sudah diimplementasikan dan tervalidasi end-to-end |
| Dashboard | ✅ Selesai | Dashboard Kepala Divre/PM, detail proyek, endpoint summary/by-cabang, filter lokal, dan UI production sudah tervalidasi |
| Deployment | ✅ Selesai | Vercel + Render production sudah tervalidasi oleh user setelah update terbaru |

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
- [x] Set environment variables frontend
- [x] Set environment variables backend

### 3.3 Database

- [x] Jalankan migration `001_create_tables.sql` — tabel berhasil dibuat di Supabase
- [x] Jalankan seed `002_seed_coa.sql` — COA Tahun 2025 dari `docs/COA tahun 2025.xlsx` sudah dibuat dan diinsert ke Supabase
- [x] Jalankan seed `003_seed_branches.sql` — 13 cabang + 26 UP Divre Timur sudah dibuat dan diinsert ke Supabase
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
- [x] `backend/src/routes/proyek.routes.js`
- [x] `backend/src/controllers/proyek.controller.js`
- [x] `backend/src/models/proyek.model.js`
- [x] `backend/src/routes/rab.routes.js`
- [x] `backend/src/controllers/rab.controller.js`
- [x] `backend/src/models/rab.model.js`
- [ ] `backend/src/services/coa.service.js` — tidak dibuat; validasi COA aktif dilakukan via `backend/src/models/coa.model.js`
- [x] `backend/src/routes/master.routes.js`
- [x] `backend/src/controllers/master.controller.js`
- [x] `backend/src/routes/kurs.routes.js`
- [x] `backend/src/controllers/kurs.controller.js`
- [x] `backend/src/models/coa.model.js`
- [x] `backend/src/models/branch.model.js`
- [x] `backend/src/models/kurs.model.js`

### Frontend

- [x] `frontend/src/services/api.js`
- [x] `frontend/src/context/AuthContext.jsx`
- [x] `frontend/src/components/ProtectedRoute.jsx`
- [x] `frontend/src/pages/Login.jsx`
- [x] `frontend/src/pages/MasterData.jsx`
- [x] `frontend/src/pages/ProyekList.jsx`
- [x] `frontend/src/pages/ProyekForm.jsx`
- [x] `frontend/src/pages/RABForm.jsx`

### Validasi Fase 1

- [x] Admin bisa login
- [x] PM bisa login
- [x] Kepala Divre bisa login
- [x] PM hanya melihat proyek cabangnya sendiri
- [x] Proyek bisa dibuat
- [x] Form RAB terkunci jika `seg11_no` kosong
- [x] Admin bisa melihat master COA
- [x] Admin bisa melihat master cabang
- [x] Endpoint master hanya admin via RBAC
- [x] Kode akun COA divalidasi sebagai string
- [x] Kode akun COA non-aktif tidak bisa digunakan

---

## Fase 2 — Margin, Realisasi, Multi-currency

Target: aplikasi sudah bisa menghitung margin RAB, margin realisasi, dan delta margin.

### Backend

- [x] `backend/src/services/margin.service.js`
- [x] `backend/src/services/kurs.service.js`
- [x] `backend/src/routes/realisasi.routes.js`
- [x] `backend/src/controllers/realisasi.controller.js`
- [x] `backend/src/models/realisasi.model.js`
- [x] `backend/src/routes/kurs.routes.js`
- [x] Audit log untuk perubahan RAB
- [x] Audit log untuk input realisasi

### Frontend

- [x] `frontend/src/utils/formatIDR.js`
- [x] `frontend/src/utils/marginFlag.js`
- [x] `frontend/src/utils/currencyConvert.js`
- [x] `frontend/src/components/MarginBadge.jsx`
- [x] `frontend/src/components/MarginCard.jsx`
- [x] `frontend/src/pages/RealisasiForm.jsx`
- [x] Update `RABForm.jsx` agar kalkulasi real-time

### Validasi Fase 2

- [x] Margin RAB muncul real-time
- [x] Input USD dikonversi ke IDR sebelum kalkulasi
- [x] Realisasi bisa ditambahkan per akun
- [x] Margin realisasi dihitung otomatis
- [x] Delta margin tampil naik/turun
- [x] Status margin tampil: aman, perhatian, kritis, rugi
- [x] Akun subkon 4422 dihitung sebagai % subkon

---

## Fase 3 — Dashboard, Detail, Deploy

Target: aplikasi siap demo dan bisa diakses via browser.

### Backend

- [x] `backend/src/routes/dashboard.routes.js`
- [x] `backend/src/controllers/dashboard.controller.js`
- [x] Endpoint KPI summary
- [x] Endpoint margin per cabang
- [x] Endpoint detail proyek lengkap
- [x] Filter dashboard: cabang, tahun, status proyek, status margin

### Frontend

- [x] `frontend/src/pages/Dashboard.jsx`
- [x] `frontend/src/pages/DashboardCabang.jsx`
- [x] `frontend/src/pages/ProyekDetail.jsx`
- [x] `frontend/src/components/ProyekTable.jsx`
- [x] `frontend/src/components/MarginChart.jsx`
- [x] `frontend/src/components/BreakdownChart.jsx`
- [x] `frontend/src/context/FilterContext.jsx` — tidak dibuat sesuai keputusan terbaru; filter tetap memakai state lokal di halaman dashboard
- [x] Highlight proyek kritis/rugi

### Deployment

- [x] Deploy backend ke Render
- [x] Deploy frontend ke Vercel
- [x] Set CORS Render ke domain Vercel
- [x] Set `VITE_API_URL` di Vercel
- [x] Test login di production
- [x] Test input proyek di production
- [x] Test dashboard di production

---

## 5. Log Activity

> Tambahkan log terbaru di paling atas.

| Tanggal | Tipe | Area | Deskripsi | File Terkait | Status |
|---|---|---|---|---|---|
| 2026-06-18 | Add | Master Data | Menambahkan master data untuk Portofolio Segmen 7, Sub-portofolio Segmen 8, dan PMU/KSO Segmen 9: membuat tabel di `009_create_master_seg789.sql` beserta data seed, menambahkan endpoints backend list `authOnly`, dan mengganti input form frontend menjadi Select dinamis bersarang di halaman pembuatan/edit proyek. | `backend/migrations/009_create_master_seg789.sql`, `backend/src/models/master_seg.model.js`, `backend/src/controllers/master.controller.js`, `backend/src/routes/master.routes.js`, `frontend/src/services/api.js`, `frontend/src/pages/ProyekForm.jsx`, `STATUS.md` | ✅ |
| 2026-06-11 | Fix | Auth/Session | Memperbaiki session login custom JWT: token login tetap expiry 8 jam dan payload kini memuat `id`, `nama`, `email`, `role`, `cabang_id`; frontend memvalidasi expiry token dari `localStorage` saat refresh/browser reopen, auto clear session saat token expired/malformed, dan interceptor Axios melakukan logout + redirect login pada response 401/403. Frontend build berhasil; lint masih gagal karena error lama di halaman non-auth, bukan dari perubahan session; backend syntax check belum berjalan karena permission command ditolak auto-classifier | `backend/src/controllers/auth.controller.js`, `backend/src/middleware/auth.middleware.js`, `frontend/src/context/AuthContext.jsx`, `frontend/src/services/api.js`, `STATUS.md` | ✅ |
| 2026-06-10 | Remove/Fix | Auth UI | Menghapus route test admin setelah validasi auth admin selesai, melepas mount `/api/test`, menghapus halaman/link `/admin-test`, dan mengganti tombol teks tampilkan password di login menjadi icon mata di sisi kanan input password; backend syntax check dan frontend build berhasil | `backend/src/app.js`, `backend/src/routes/test.routes.js`, `frontend/src/App.jsx`, `frontend/src/components/layout/Header.jsx`, `frontend/src/pages/Login.jsx`, `frontend/src/App.css`, `STATUS.md` | ✅ |
| 2026-06-10 | Test/Decision | Production | User mengonfirmasi validasi runtime UI/API dengan data Supabase dan validasi production Vercel/Render sudah lulus. Filter dashboard diputuskan tetap memakai implementasi saat ini yaitu state lokal di halaman dashboard, bukan `FilterContext.jsx`. | `STATUS.md`, `frontend/src/pages/Dashboard.jsx`, `frontend/src/pages/DashboardCabang.jsx` | ✅ |
| 2026-06-10 | Docs/Test | Status | Mengaudit Status Global dan Checklist Development: realisasi, dashboard, detail proyek, audit log RAB/realisasi, dan kalkulasi margin sudah ada di repo; backend `node --check` untuk file terkait lulus; frontend `npm --prefix frontend run build` berhasil; production/API/UI end-to-end masih perlu validasi manual dengan data Supabase | `STATUS.md`, `backend/src/app.js`, `backend/src/routes/realisasi.routes.js`, `backend/src/controllers/realisasi.controller.js`, `backend/src/models/realisasi.model.js`, `backend/src/routes/dashboard.routes.js`, `backend/src/controllers/dashboard.controller.js`, `backend/src/models/dashboard.model.js`, `backend/src/services/margin.service.js`, `frontend/src/pages/RealisasiForm.jsx`, `frontend/src/pages/Dashboard.jsx`, `frontend/src/pages/DashboardCabang.jsx`, `frontend/src/pages/ProyekDetail.jsx` | 🟨 |
| 2026-06-10 | Add | Multi-currency | Menyelesaikan Phase 2B multi-currency: menambahkan `kurs.service.js`, membuka `GET /api/kurs` untuk user authenticated dan menjaga `PUT /api/kurs` admin-only, mengunci IDR ke kurs 1, memastikan USD memakai kurs > 1/terbaru saat input proyek/RAB, memperbaiki margin agar nilai proyek dikonversi ke IDR, serta memperbarui preview frontend proyek/RAB; backend syntax check lulus dan frontend build berhasil | `backend/src/services/kurs.service.js`, `backend/src/controllers/kurs.controller.js`, `backend/src/routes/kurs.routes.js`, `backend/src/controllers/proyek.controller.js`, `backend/src/controllers/rab.controller.js`, `backend/src/services/margin.service.js`, `frontend/src/utils/currencyConvert.js`, `frontend/src/services/api.js`, `frontend/src/pages/ProyekForm.jsx`, `frontend/src/pages/RABForm.jsx`, `STATUS.md` | ✅ |
| 2026-06-10 | Test | Frontend | User menjalankan manual `npm install` dan `npm run build` dari folder `frontend`; Vite 8 build berhasil setelah Node lokal di-upgrade, output `dist/` dibuat dalam 744ms tanpa vulnerability npm | `frontend/package.json`, `frontend/package-lock.json`, `frontend/dist/` | ✅ |
| 2026-06-10 | Test | Backend | Claude menjalankan `node --check` untuk file backend Phase 1F/Phase 2 awal; syntax check berhasil tanpa output error | `backend/src/app.js`, `backend/src/routes/rab.routes.js`, `backend/src/controllers/rab.controller.js`, `backend/src/models/rab.model.js`, `backend/src/models/proyek.model.js`, `backend/src/services/margin.service.js` | ✅ |
| 2026-06-10 | Add | Margin RAB | Menambahkan Phase 2 awal: backend `margin.service.js` untuk margin RAB, status margin, subtotal kategori, dan % subkon 4422; `GET /api/proyek/:id/rab` kini mengembalikan `margin_rab`; validasi USD RAB wajib kurs > 1; frontend menambahkan utility format/currency/margin, komponen MarginBadge/MarginCard, dan preview margin real-time di RABForm | `backend/src/services/margin.service.js`, `backend/src/controllers/rab.controller.js`, `frontend/src/utils/formatIDR.js`, `frontend/src/utils/currencyConvert.js`, `frontend/src/utils/marginFlag.js`, `frontend/src/components/MarginBadge.jsx`, `frontend/src/components/MarginCard.jsx`, `frontend/src/pages/RABForm.jsx`, `frontend/src/App.css`, `STATUS.md` | ✅ |
| 2026-06-09 | Add | RAB | Menyelesaikan Phase 1F RAB basic: backend endpoint RAB dengan RBAC kepala_divre read-only, PM cabang sendiri, admin semua akses; mutasi RAB wajib Segmen 11; COA aktif dan kategori COA divalidasi; frontend `/proyek/:id/rab` untuk input/edit/delete line item RAB basic | `backend/src/app.js`, `backend/src/routes/rab.routes.js`, `backend/src/controllers/rab.controller.js`, `backend/src/models/rab.model.js`, `backend/src/models/coa.model.js`, `frontend/src/services/api.js`, `frontend/src/pages/RABForm.jsx`, `frontend/src/pages/ProyekList.jsx`, `frontend/src/App.jsx`, `frontend/src/App.css`, `STATUS.md` | ✅ |
| 2026-06-09 | Add | Proyek | Menyelesaikan Phase 1E registrasi proyek: backend CRUD `/api/proyek` dengan RBAC kepala_divre/pm/admin, scope PM per `cabang_id`, soft delete status `arsip`, frontend daftar/form proyek, dan indikator gate Segmen 11/RAB terkunci | `backend/src/app.js`, `backend/src/routes/proyek.routes.js`, `backend/src/controllers/proyek.controller.js`, `backend/src/models/proyek.model.js`, `frontend/src/services/api.js`, `frontend/src/pages/ProyekList.jsx`, `frontend/src/pages/ProyekForm.jsx`, `frontend/src/App.jsx`, `frontend/src/App.css`, `STATUS.md` | ✅ |
| 2026-06-09 | Add | Master Data | Menyelesaikan Phase 1D master data: endpoint admin-only untuk COA, cabang, user, dan kurs; frontend admin `/master-data`; seed COA 2025 dan seed cabang/UP Divre Timur sudah dibuat dan diinsert ke Supabase oleh user | `backend/src/routes/master.routes.js`, `backend/src/controllers/master.controller.js`, `backend/src/models/coa.model.js`, `backend/src/models/branch.model.js`, `backend/src/models/user.model.js`, `backend/src/routes/kurs.routes.js`, `backend/src/controllers/kurs.controller.js`, `backend/src/models/kurs.model.js`, `backend/migrations/002_seed_coa.sql`, `backend/migrations/003_seed_branches.sql`, `frontend/src/pages/MasterData.jsx`, `frontend/src/services/api.js`, `frontend/src/App.jsx`, `frontend/src/App.css`, `STATUS.md` | ✅ |
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
| BUG-002 | 2026-06-11 | High | Auth/Session | Frontend masih bisa menganggap user login setelah refresh/browser reopen walau token di `localStorage` sudah expired/malformed sampai ada API call gagal | `AuthContext` hanya mengecek keberadaan token + user, belum membaca `exp` JWT; `api.js` belum punya response interceptor 401/403 | Tambahkan validasi expiry JWT di `AuthContext`, auto clear session saat expired/malformed, timer auto logout, dan interceptor Axios untuk clear session + redirect login pada 401/403 | ✅ |
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
| 2026-06-10 | Filter dashboard memakai state lokal halaman, bukan `FilterContext.jsx` | Implementasi saat ini sudah valid dan user memutuskan tetap memakai pola tersebut | `frontend/src/context/FilterContext.jsx` tidak perlu dibuat untuk MVP; checklist dianggap selesai dengan catatan keputusan ini |
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
Menambahkan master data dan dropdown dinamis untuk Segmen 7 (Portofolio), Segmen 8 (Sub-portofolio), dan Segmen 9 (PMU/KSO) pada saat create/edit Proyek. Dibuat tabel baru di backend (`master_seg7`, `master_seg8`, `master_seg9`) dan di seed dari data spreadsheet. Backend sekarang memiliki routes GET `authOnly` untuk fetch segment tersebut dan frontend merender `<Select>` dropdown yang otomatis difilter dan divalidasi ketika parent-nya (Seg 7) diubah. Data eksisting pada tabel proyek tidak diubah (field text tetap ada) untuk menjaga backward compatibility namun entry baru akan selalu valid.
```

### File yang terakhir diubah

```txt
STATUS.md
backend/migrations/009_create_master_seg789.sql
backend/src/models/master_seg.model.js
backend/src/controllers/master.controller.js
backend/src/routes/master.routes.js
frontend/src/services/api.js
frontend/src/pages/ProyekForm.jsx
```

### Masalah yang belum selesai

```txt
Migration `009_create_master_seg789.sql` harus dijalankan secara manual di Supabase SQL Editor karena credential akses psql secara remote CLI tidak tersedia. Setelah file migration dijalankan, form pada aplikasi baru bisa meload data dari backend dan merender dropdown nya dengan benar.
```

### Prompt lanjutan untuk Claude

```txt
Lanjutkan dari STATUS.md terbaru. Master Segmen 7, 8, dan 9 telah ditambahkan beserta dropdown form proyeknya. Pastikan tidak menambah fitur di luar PRD.md/scope guard. Untuk pekerjaan berikutnya, fokus pada bugfix/polish yang diminta user dan selalu validasi lokal sebelum meminta user melakukan validasi production jika diperlukan.
```

---

## 10. Definition of Done Final

Project dianggap selesai untuk demo apabila:

- [x] User admin, PM, dan Kepala Divre bisa login
- [x] Admin bisa mengelola master COA, cabang, user, dan kurs
- [x] PM bisa membuat proyek sesuai cabangnya
- [x] Form RAB terkunci jika Segmen 11 belum diisi
- [x] PM bisa input RAB per akun COA
- [x] PM bisa input realisasi per akun
- [x] Margin RAB dihitung otomatis
- [x] Margin realisasi dihitung otomatis
- [x] Delta margin tampil naik/turun
- [x] Kepala Divre bisa melihat seluruh proyek
- [x] PM hanya bisa melihat proyek cabangnya sendiri
- [x] Proyek kritis/rugi ter-highlight
- [x] Dashboard bisa difilter dan disortir
- [x] Detail proyek menampilkan breakdown RAB vs realisasi
- [x] Aplikasi live di Vercel + Render
- [x] Tidak ada fitur approval, email notifier, atau SLA di MVP
