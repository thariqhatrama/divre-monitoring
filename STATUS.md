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
**Status saat ini:** Phase 2D margin realisasi dan delta selesai pada level implementasi dasar: backend menghitung `total_biaya_realisasi`, `laba_operasi_realisasi`, `margin_realisasi`, `delta_margin`, dan `indikator_delta` naik/turun/tetap; RABForm menampilkan summary RAB vs realisasi; validasi kalkulasi lokal dan build frontend berhasil

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
| Realisasi | 🟨 Dalam proses | Phase 2C implementasi dasar selesai dan validasi lokal lulus: CRUD realisasi per akun + audit log + agregasi; runtime API/browser production belum divalidasi |
| Kalkulasi margin | ✅ Selesai | Phase 2D selesai: margin RAB, margin realisasi, laba operasi realisasi, delta margin, dan indikator delta naik/turun/tetap dihitung; validasi lokal lulus, runtime API/browser production tetap perlu diuji |
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
- [ ] PM bisa login
- [ ] Kepala Divre bisa login
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
- [ ] Audit log untuk perubahan RAB
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
- [x] Realisasi bisa ditambahkan per akun — implementasi endpoint/form tersedia; perlu validasi runtime production
- [x] Margin realisasi dihitung otomatis — implementasi endpoint tersedia; perlu validasi runtime production
- [x] Delta margin tampil naik/turun — implementasi endpoint/form tersedia; perlu validasi runtime production
- [x] Status margin tampil: aman, perhatian, kritis, rugi
- [x] Akun subkon 4422 dihitung sebagai % subkon

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
| 2026-06-10 | Add | Margin Realisasi | Menyelesaikan Phase 2D margin realisasi dan delta: `margin.service.js` menghitung `total_biaya_realisasi`, `laba_operasi_realisasi`, `margin_realisasi`, `delta_margin = marginRealisasi - marginRAB`, dan `indikator_delta` naik/turun/tetap; `RABForm.jsx` menampilkan summary Total RAB, Total Realisasi, Selisih RAB vs Realisasi, Margin RAB, Margin Realisasi, dan delta; validasi lokal membuktikan realisasi > RAB membuat margin turun dan realisasi < RAB membuat margin naik; backend syntax check dan frontend build berhasil | `backend/src/services/margin.service.js`, `frontend/src/pages/RABForm.jsx`, `STATUS.md` | ✅ |
| 2026-06-10 | Test | Realisasi | Review setup repo dan validasi lokal Phase 2C: struktur root `frontend/`, `backend/`, `docs/`, `CLAUDE.md`, `STATUS.md` sesuai; Vercel config berada di `frontend/vercel.json`, Render config berada di `backend/render.yaml`; backend syntax check untuk `app.js`, controller/model/route realisasi lulus; frontend build berhasil; runtime API/browser production masih perlu diuji manual | `CLAUDE.md`, `docs/PRD.md`, `STATUS.md`, `frontend/vercel.json`, `backend/render.yaml`, `backend/src/app.js`, `backend/src/controllers/realisasi.controller.js`, `backend/src/models/realisasi.model.js`, `backend/src/routes/realisasi.routes.js`, `frontend/src/pages/RealisasiForm.jsx` | 🟨 |
| 2026-06-10 | Add | Realisasi | Menambahkan Phase 2C realisasi per akun: backend CRUD `GET /api/proyek/:id/realisasi`, `POST /api/rab/:itemId/realisasi`, `PATCH/DELETE /api/realisasi/:id` memakai tabel `realisasi_items`; `project_id` diturunkan dari item RAB, RAB awal tidak ditimpa, satu akun RAB bisa punya banyak transaksi, total realisasi diagregasi per RAB item/per akun, audit log dibuat untuk tambah/edit/hapus, frontend `RealisasiForm.jsx` tersedia, backend syntax check Phase 2C lulus, dan build frontend berhasil | `backend/src/models/realisasi.model.js`, `backend/src/controllers/realisasi.controller.js`, `backend/src/routes/realisasi.routes.js`, `backend/src/app.js`, `backend/src/services/margin.service.js`, `frontend/src/pages/RealisasiForm.jsx`, `frontend/src/services/api.js`, `frontend/src/App.jsx`, `frontend/src/pages/RABForm.jsx`, `frontend/src/pages/ProyekList.jsx`, `STATUS.md` | 🟨 |
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
Phase 2D margin realisasi dan delta selesai di atas Phase 2C realisasi per akun. Backend `margin.service.js` menghitung `total_biaya_realisasi`, `laba_operasi_realisasi`, `margin_realisasi`, `delta_margin = marginRealisasi - marginRAB`, serta `indikator_delta` naik/turun/tetap. Frontend `RABForm.jsx` menampilkan summary RAB vs realisasi: Total RAB, Total Realisasi, Selisih RAB vs Realisasi, Margin RAB, Margin Realisasi, dan delta. Validasi lokal membuktikan realisasi lebih besar dari RAB membuat margin turun, realisasi lebih kecil dari RAB membuat margin naik, dan realisasi sama dengan RAB membuat delta tetap.
```

### File yang terakhir diubah

```txt
backend/src/services/margin.service.js
frontend/src/pages/RABForm.jsx
STATUS.md
```

### Status lanjutan yang perlu diperhatikan

#### Selesai / validasi dasar lulus

```txt
Phase 2D margin realisasi dan delta sudah selesai pada level implementasi dasar. Backend `node --check` untuk file terkait berhasil, validasi kalkulasi lokal berhasil, dan frontend `npm --prefix frontend run build` berhasil. Endpoint realisasi tetap memakai tabel `realisasi_items`, tidak menimpa `rab_items`, mendukung banyak transaksi realisasi per RAB item, mengagregasi total realisasi per RAB item/per akun, serta sekarang mengembalikan margin realisasi dan indikator delta naik/turun/tetap.
```

#### Pending validasi runtime

```txt
Backend syntax check Phase 2D dan validasi kalkulasi lokal sudah lulus. Validasi browser/API untuk skenario tambah/edit/hapus realisasi, dua realisasi pada satu item RAB, agregasi total realisasi per akun, RAB awal tidak berubah, margin realisasi/delta tampil di UI, gate Segmen 11, dan role PM/Kepala Divre masih perlu dilakukan setelah data user/test project tersedia.
```

#### Butuh aksi manual / secret eksternal

```txt
PM dan Kepala Divre user mungkin masih perlu dibuat/dirotasi melalui master user untuk validasi role penuh. Password bootstrap admin sementara tetap perlu diganti/dirotasi melalui endpoint user management. Backend env production di Render masih perlu diisi manual memakai SUPABASE_SERVICE_KEY dari Supabase Project Settings > API (service_role), bukan publishable key.
```

#### Fase berikutnya sesuai PRD

```txt
Runtime validation realisasi, dashboard, detail proyek, dan deployment final belum selesai. Realisasi per akun sudah dibuat pada level implementasi dasar; lanjutkan validasi runtime dan Phase 3 sesuai PRD.
```

### Prompt lanjutan untuk Claude

```txt
Jangan membuat fitur baru di luar PRD.md. Phase 2D margin realisasi dan delta sudah dibuat pada level implementasi dasar: backend menghitung `total_biaya_realisasi`, `laba_operasi_realisasi`, `margin_realisasi`, `delta_margin = marginRealisasi - marginRAB`, dan `indikator_delta` naik/turun/tetap; frontend `RABForm.jsx` menampilkan summary RAB vs realisasi dan delta. Backend `node --check`, validasi kalkulasi lokal, dan `npm --prefix frontend run build` berhasil. Fokus berikutnya: validasi runtime tambah/edit/hapus realisasi dan tampilan margin/delta di browser/API, lalu lanjut Phase 3 dashboard/detail sesuai PRD.
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
