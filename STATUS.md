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
**Status saat ini:** Belum mulai coding

---

## 2. Status Global

| Area | Status | Catatan |
|---|---|---|
| Repo setup | ⬜ Belum mulai | Buat repo `divre-monitoring` |
| Frontend setup | ⬜ Belum mulai | React + Vite |
| Backend setup | ⬜ Belum mulai | Express + Supabase |
| Database setup | ⬜ Belum mulai | PostgreSQL Supabase |
| Auth & RBAC | ⬜ Belum mulai | Role: kepala_divre, pm, admin |
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

- [ ] Buat repo GitHub `divre-monitoring`
- [ ] Buat struktur folder:
  - [ ] `frontend/`
  - [ ] `backend/`
  - [ ] `docs/`
- [ ] Letakkan file berikut di root:
  - [ ] `CLAUDE.md`
  - [ ] `STATUS.md`
  - [ ] `CHECKLIST_SETUP.md`
  - [ ] `.gitignore`
- [ ] Letakkan file berikut di `docs/`:
  - [ ] `PRD.md`
  - [ ] `PROMPTS_CLAUDE_PHASES.md`

### 3.2 Platform

- [ ] Buat project Supabase
- [ ] Buat project Vercel dengan Root Directory: `frontend`
- [ ] Buat service Render dengan Root Directory: `backend`
- [ ] Set environment variables frontend
- [ ] Set environment variables backend

### 3.3 Database

- [ ] Jalankan migration `001_create_tables.sql`
- [ ] Jalankan seed `002_seed_coa.sql`
- [ ] Jalankan seed `003_seed_branches.sql`
- [ ] Buat admin user pertama
- [ ] Test koneksi backend ke Supabase

---

## 4. Checklist Development per Fase

## Fase 1 — Setup, Auth, Master Data, Proyek, RAB Basic

Target: fondasi aplikasi bisa jalan dari login sampai input RAB basic.

### Backend

- [ ] `backend/src/app.js`
- [ ] `backend/src/db/supabase.js`
- [ ] `backend/src/middleware/auth.middleware.js`
- [ ] `backend/src/middleware/rbac.middleware.js`
- [ ] `backend/src/routes/auth.routes.js`
- [ ] `backend/src/controllers/auth.controller.js`
- [ ] `backend/src/models/user.model.js`
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

- [ ] `frontend/src/services/api.js`
- [ ] `frontend/src/context/AuthContext.jsx`
- [ ] `frontend/src/components/ProtectedRoute.jsx`
- [ ] `frontend/src/pages/Login.jsx`
- [ ] `frontend/src/pages/ProyekList.jsx`
- [ ] `frontend/src/pages/ProyekForm.jsx`
- [ ] `frontend/src/pages/RABForm.jsx`

### Validasi Fase 1

- [ ] Admin bisa login
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
Contoh:
Selesai membuat auth backend dan login frontend. Admin bisa login, token tersimpan, protected route berjalan.
```

### File yang terakhir diubah

```txt
Contoh:
backend/src/app.js
backend/src/routes/auth.routes.js
backend/src/controllers/auth.controller.js
frontend/src/context/AuthContext.jsx
frontend/src/pages/Login.jsx
```

### Masalah yang belum selesai

```txt
Contoh:
PM masih bisa melihat semua proyek, perlu filter cabang_id di endpoint GET /api/proyek.
```

### Prompt lanjutan untuk Claude

```txt
Lanjutkan dari STATUS.md bagian "Masalah yang belum selesai". Jangan membuat fitur baru di luar PRD.md. Fokus perbaiki RBAC cabang_id pada endpoint GET /api/proyek dan tambahkan test manual sederhana.
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
