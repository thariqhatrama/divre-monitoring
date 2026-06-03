# PROMPTS_CLAUDE_PHASES.md
## Prompt Bertahap untuk Claude CLI — Dashboard Monitoring Margin Proyek Divre Timur

> Gunakan file ini agar pengerjaan tetap konsisten, tidak melebar dari PRD, dan tidak memenuhi context window Claude CLI. Jalankan per fase. Jangan memasukkan semua prompt sekaligus.

---

## Aturan Umum Penggunaan

Sebelum menjalankan prompt fase apa pun:

1. Buka Claude CLI dari root repository.
2. Pastikan file berikut tersedia:
   - `CLAUDE.md`
   - `STATUS.md`
   - `docs/PRD.md`
   - `docs/PROMPTS_CLAUDE_PHASES.md`
3. Mulai dari fase yang sedang dikerjakan saja.
4. Setelah satu fase selesai, minta Claude update `STATUS.md`.
5. Jangan lanjut ke fase berikutnya sebelum checklist validasi fase sebelumnya selesai.

---

## Prompt Pembuka Setiap Sesi

Gunakan ini setiap membuka sesi Claude CLI baru.

```txt
Baca CLAUDE.md, docs/PRD.md, dan STATUS.md terlebih dahulu.

Konteks project:
Aplikasi ini adalah Dashboard Monitoring Margin Proyek Divre Timur PT SUCOFINDO. Scope MVP hanya monitoring margin proyek berdasarkan RAB awal dan realisasi anggaran. Bukan approval workflow, bukan SLA, bukan ERP, bukan aplikasi publik. COA menggunakan COA Tahun 2025.

Tugasmu:
1. Ikuti PRD dan CLAUDE.md.
2. Cek STATUS.md untuk mengetahui fase dan task terakhir.
3. Jangan menambah fitur di luar scope.
4. Jangan membuat approval, email notifier, SLA, atau integrasi ERP.
5. Setiap selesai mengubah file penting, update STATUS.md pada bagian Log Activity, Current Context, dan checklist terkait.

Sebelum coding, jelaskan singkat file apa yang akan kamu ubah dan kenapa.
```

---

# PHASE 0 — Review Struktur Project

Gunakan setelah repo awal dibuat, sebelum coding.

```txt
Baca CLAUDE.md, docs/PRD.md, STATUS.md, dan struktur folder saat ini.

Tugas:
1. Review apakah struktur repo sudah sesuai:
   - frontend/
   - backend/
   - docs/
   - CLAUDE.md
   - STATUS.md
2. Pastikan Vercel diarahkan ke frontend/ dan Render diarahkan ke backend/.
3. Jangan coding fitur dulu.
4. Jika ada file penting yang kurang, buatkan atau perbaiki.
5. Update STATUS.md bagian setup awal.

Output yang saya butuhkan:
- Ringkasan struktur repo
- File yang dibuat/diubah
- Checklist setup yang sudah selesai
- Checklist setup yang masih harus saya lakukan manual
```

---

# PHASE 1A — Backend Setup Dasar

Gunakan untuk membuat fondasi backend Express.

```txt
Baca CLAUDE.md, docs/PRD.md, dan STATUS.md.

Fokus hanya Phase 1A: backend setup dasar.

Tugas:
1. Buat struktur backend sesuai CLAUDE.md.
2. Buat Express app di backend/src/app.js.
3. Buat koneksi Supabase di backend/src/db/supabase.js.
4. Setup middleware dasar:
   - cors
   - helmet
   - express.json
5. Buat endpoint health check:
   GET /api/health
6. Jangan buat auth dulu.
7. Jangan buat fitur proyek/RAB dulu.
8. Update STATUS.md.

Batasan:
- Jangan pakai ORM.
- Jangan pakai Prisma/Sequelize.
- Gunakan supabase-js langsung.
- Jangan commit secret/key ke repo.

Validasi:
- Backend bisa jalan dengan `node src/app.js`
- GET /api/health mengembalikan status ok
```

---

# PHASE 1B — Database Migration

Gunakan untuk membuat migration SQL.

```txt
Baca CLAUDE.md, docs/PRD.md, dan STATUS.md.

Fokus hanya Phase 1B: database migration.

Tugas:
1. Buat backend/migrations/001_create_tables.sql.
2. Buat tabel sesuai PRD:
   - users
   - branches
   - coa_accounts
   - projects
   - rab_items
   - realisasi_items
   - kurs_history
   - audit_log
3. Pastikan angka finansial disimpan sebagai integer IDR.
4. Pastikan kode COA disimpan sebagai string/text.
5. Pastikan ada relasi project ke cabang, PM, RAB, dan realisasi.
6. Jangan membuat approval table.
7. Jangan membuat SLA table.
8. Update STATUS.md.

Catatan desain:
- rab_items menyimpan RAB awal.
- realisasi_items menyimpan realisasi berjalan per akun/RAB item.
- RAB awal tidak boleh tertimpa oleh realisasi.

Output:
- Tampilkan ringkasan tabel yang dibuat.
- Sebutkan langkah manual yang harus saya jalankan di Supabase SQL Editor.
```

---

# PHASE 1C — Auth dan RBAC

Gunakan setelah migration siap.

```txt
Baca CLAUDE.md, docs/PRD.md, dan STATUS.md.

Fokus hanya Phase 1C: auth dan RBAC.

Tugas:
1. Buat auth backend:
   - POST /api/auth/login
   - POST /api/auth/logout
2. Buat user model.
3. Buat auth.middleware.js untuk verifikasi JWT.
4. Buat rbac.middleware.js untuk role:
   - kepala_divre
   - pm
   - admin
5. Buat protected route sederhana untuk test role.
6. Buat frontend:
   - api.js
   - AuthContext.jsx
   - useAuth.js jika diperlukan
   - Login.jsx
   - ProtectedRoute.jsx
7. Jangan membuat fitur proyek/RAB dulu.
8. Update STATUS.md.

Validasi:
- Admin bisa login.
- Token tersimpan di frontend.
- Protected route tidak bisa diakses tanpa login.
- Role terbaca dari token/user session.
```

---

# PHASE 1D — Master Data COA, Cabang, User, Kurs

Gunakan setelah auth berjalan.

```txt
Baca CLAUDE.md, docs/PRD.md, dan STATUS.md.

Fokus hanya Phase 1D: master data.

Tugas:
1. Buat route/controller/model untuk master:
   - COA
   - cabang
   - user
   - kurs
2. Endpoint master hanya admin.
3. Buat migration seed placeholder:
   - 002_seed_coa.sql
   - 003_seed_branches.sql
4. COA menggunakan COA Tahun 2025.
5. Buat validasi bahwa kode akun COA disimpan sebagai string.
6. Buat frontend admin sederhana untuk melihat master data.
7. Jangan membuat dashboard.
8. Jangan membuat import Excel dulu.
9. Update STATUS.md.

Validasi:
- Admin bisa melihat data COA.
- Admin bisa melihat data cabang.
- PM tidak bisa akses endpoint master.
- Kepala Divre tidak bisa mengubah master data.
```

---

# PHASE 1E — Proyek dan Gate Segmen 11

Gunakan untuk membuat registrasi proyek.

```txt
Baca CLAUDE.md, docs/PRD.md, dan STATUS.md.

Fokus hanya Phase 1E: registrasi proyek dan gate Segmen 11.

Tugas:
1. Buat CRUD proyek:
   - GET /api/proyek
   - POST /api/proyek
   - GET /api/proyek/:id
   - PATCH /api/proyek/:id
   - DELETE /api/proyek/:id soft delete admin only
2. Terapkan RBAC:
   - kepala_divre bisa baca semua proyek
   - admin bisa semua akses
   - pm hanya bisa CRUD proyek dengan cabang_id yang sama
3. Buat frontend:
   - ProyekList.jsx
   - ProyekForm.jsx
4. Tambahkan field seg11_no.
5. Jangan buka akses RAB jika seg11_no kosong.
6. Update STATUS.md.

Validasi:
- PM hanya melihat proyek cabangnya.
- Kepala Divre melihat semua proyek.
- Proyek bisa dibuat tanpa seg11_no.
- Status proyek default draft.
```

---

# PHASE 1F — RAB Basic

Gunakan setelah proyek berjalan.

```txt
Baca CLAUDE.md, docs/PRD.md, dan STATUS.md.

Fokus hanya Phase 1F: input RAB basic.

Tugas:
1. Buat endpoint RAB:
   - GET /api/proyek/:id/rab
   - POST /api/proyek/:id/rab
   - PATCH /api/rab/:itemId
   - DELETE /api/rab/:itemId
2. Validasi backend:
   - Project harus punya seg11_no sebelum bisa input RAB.
   - Kode akun harus ada dan aktif di coa_accounts.
   - PM hanya bisa input RAB untuk project cabangnya.
3. Buat frontend RABForm.jsx:
   - Jika seg11_no kosong, tampilkan pesan dan disable form.
   - Jika seg11_no ada, form RAB terbuka.
4. Gunakan kategori RAB I-VI.
5. Jangan membuat realisasi dulu.
6. Jangan membuat dashboard dulu.
7. Update STATUS.md.

Validasi:
- RAB tidak bisa disimpan tanpa Segmen 11.
- RAB bisa disimpan jika Segmen 11 ada.
- Kode COA tidak aktif ditolak.
```

---

# PHASE 2A — Kalkulasi Margin RAB

Gunakan setelah RAB basic selesai.

```txt
Baca CLAUDE.md, docs/PRD.md, dan STATUS.md.

Fokus hanya Phase 2A: kalkulasi margin RAB.

Tugas:
1. Buat backend/src/services/margin.service.js.
2. Buat kalkulasi:
   - totalBiayaRAB
   - labaOperasiRAB
   - marginRAB
   - statusMargin
   - persenSubkon dari akun 4422
3. Buat frontend utils:
   - formatIDR.js
   - marginFlag.js
4. Update RABForm agar margin RAB tampil real-time di client.
5. Pastikan backend tetap menghitung ulang margin untuk konsistensi.
6. Jangan membuat realisasi dulu.
7. Update STATUS.md.

Validasi:
- Margin RAB benar.
- Status margin sesuai threshold:
  - >=15 aman
  - 6 sampai <15 perhatian
  - 0 sampai <6 kritis
  - <0 rugi
- Akun 4422 dihitung sebagai subkon.
```

---

# PHASE 2B — Multi-currency

Gunakan setelah margin RAB dasar selesai.

```txt
Baca CLAUDE.md, docs/PRD.md, dan STATUS.md.

Fokus hanya Phase 2B: multi-currency.

Tugas:
1. Tambahkan dukungan mata uang IDR/USD pada proyek dan RAB item.
2. Buat kurs.service.js.
3. Buat endpoint kurs:
   - GET /api/kurs
   - PUT /api/kurs
4. Kurs hanya bisa diubah admin.
5. Saat input USD, simpan kurs_idr yang berlaku saat input.
6. Semua kalkulasi margin tetap dalam IDR.
7. Buat frontend utility currencyConvert.js.
8. Update STATUS.md.

Validasi:
- Input IDR dihitung langsung.
- Input USD dikonversi ke IDR.
- Perubahan kurs default tidak mengubah RAB lama yang sudah tersimpan.
```

---

# PHASE 2C — Realisasi per Akun

Gunakan setelah multi-currency selesai.

```txt
Baca CLAUDE.md, docs/PRD.md, dan STATUS.md.

Fokus hanya Phase 2C: realisasi per akun.

Tugas:
1. Gunakan tabel realisasi_items, jangan menimpa RAB awal di rab_items.
2. Buat endpoint:
   - GET /api/proyek/:id/realisasi
   - POST /api/rab/:itemId/realisasi
   - PATCH /api/realisasi/:id
   - DELETE /api/realisasi/:id
3. Realisasi harus terkait ke rab_item_id dan project_id.
4. Buat RealisasiForm.jsx.
5. Realisasi bisa diinput bertahap.
6. Buat audit log untuk tambah/edit/hapus realisasi.
7. Update STATUS.md.

Validasi:
- Satu akun RAB bisa punya beberapa realisasi.
- Total realisasi per akun dijumlahkan.
- RAB awal tidak berubah saat realisasi ditambahkan.
```

---

# PHASE 2D — Margin Realisasi dan Delta

Gunakan setelah realisasi bisa diinput.

```txt
Baca CLAUDE.md, docs/PRD.md, dan STATUS.md.

Fokus hanya Phase 2D: margin realisasi dan delta.

Tugas:
1. Update margin.service.js:
   - totalBiayaRealisasi
   - labaOperasiRealisasi
   - marginRealisasi
   - deltaMargin = marginRealisasi - marginRAB
2. Buat indikator delta:
   - naik jika delta > 0
   - turun jika delta < 0
   - tetap jika delta = 0
3. Update ProyekDetail atau RABForm agar summary RAB vs realisasi terlihat.
4. Update STATUS.md.

Validasi:
- Margin realisasi benar.
- Delta margin benar.
- Realisasi lebih besar dari RAB membuat margin turun.
- Realisasi lebih kecil dari RAB membuat margin naik.
```

---

# PHASE 3A — Dashboard Kepala Divre

Gunakan setelah kalkulasi margin lengkap.

```txt
Baca CLAUDE.md, docs/PRD.md, dan STATUS.md.

Fokus hanya Phase 3A: dashboard Kepala Divre.

Tugas:
1. Buat endpoint:
   - GET /api/dashboard/summary
   - GET /api/dashboard/by-cabang
2. Summary menampilkan:
   - total proyek aktif
   - total nilai proyek
   - rata-rata margin RAB
   - rata-rata margin realisasi
   - jumlah proyek kritis/rugi
3. Dashboard Kepala Divre melihat semua cabang.
4. Buat frontend Dashboard.jsx:
   - KPI cards
   - tabel proyek
   - filter cabang, tahun, status proyek, status margin
5. Highlight proyek kritis/rugi.
6. Update STATUS.md.

Validasi:
- Kepala Divre melihat semua proyek.
- PM tidak memakai dashboard semua cabang.
- Filter berjalan.
```

---

# PHASE 3B — Dashboard PM

Gunakan setelah dashboard Kepala Divre selesai.

```txt
Baca CLAUDE.md, docs/PRD.md, dan STATUS.md.

Fokus hanya Phase 3B: dashboard PM.

Tugas:
1. Buat DashboardCabang.jsx.
2. Scope data PM wajib terbatas pada cabang_id user.
3. Backend tetap memfilter berdasarkan cabang_id dari user login, bukan query frontend saja.
4. Tampilkan KPI dan tabel proyek cabang.
5. Update STATUS.md.

Validasi:
- PM cabang A tidak bisa melihat proyek cabang B.
- Jika PM mengganti query param cabang_id, backend tetap menolak/membatasi.
```

---

# PHASE 3C — Detail Proyek dan Chart

Gunakan setelah dashboard PM selesai.

```txt
Baca CLAUDE.md, docs/PRD.md, dan STATUS.md.

Fokus hanya Phase 3C: detail proyek dan chart.

Tugas:
1. Buat ProyekDetail.jsx.
2. Buat komponen:
   - ProyekTable.jsx
   - MarginChart.jsx
   - BreakdownChart.jsx
3. Detail proyek menampilkan:
   - nilai proyek
   - total RAB
   - margin RAB
   - total realisasi
   - margin realisasi
   - delta margin
   - breakdown RAB vs realisasi per kategori
   - line item individual
   - % subkon
   - Segmen 11
4. Gunakan Recharts.
5. Update STATUS.md.

Validasi:
- Detail proyek informatif untuk demo.
- Chart tidak mengubah data, hanya visualisasi.
```

---

# PHASE 3D — Deployment

Gunakan setelah fitur utama selesai.

```txt
Baca CLAUDE.md, docs/PRD.md, dan STATUS.md.

Fokus hanya Phase 3D: deployment.

Tugas:
1. Review konfigurasi Vercel:
   - root directory frontend
   - build command npm run build
   - output dist
   - VITE_API_URL mengarah ke Render
2. Review konfigurasi Render:
   - root directory backend
   - build command npm install
   - start command node src/app.js
   - env vars lengkap
3. Pastikan CORS hanya mengizinkan domain Vercel.
4. Pastikan secret tidak ada di repo.
5. Buat checklist testing production.
6. Update STATUS.md.

Validasi:
- Frontend live.
- Backend live.
- Login production berhasil.
- Dashboard production memuat data.
- Tidak ada CORS error.
```

---

# PHASE 3E — Final QA dan Demo Prep

Gunakan sebelum demo ke mentor.

```txt
Baca CLAUDE.md, docs/PRD.md, dan STATUS.md.

Fokus hanya Phase 3E: final QA dan persiapan demo.

Tugas:
1. Jalankan review seluruh definition of done di STATUS.md.
2. Buat data dummy demo:
   - 1 proyek aman
   - 1 proyek perhatian
   - 1 proyek kritis
   - 1 proyek rugi
3. Pastikan RAB dan realisasi menunjukkan delta naik/turun.
4. Pastikan role PM dan Kepala Divre berbeda.
5. Perbaiki bug kecil yang mengganggu demo.
6. Jangan tambah fitur baru.
7. Update STATUS.md.

Output:
- Checklist demo
- Daftar akun dummy
- Daftar skenario demo 5 menit
- Bug yang masih ada tetapi tidak blocking
```

---

## Prompt Khusus: Update STATUS.md Setelah Task

Gunakan setiap selesai satu task besar.

```txt
Update STATUS.md berdasarkan pekerjaan terakhir.

Yang harus diperbarui:
1. Status Global
2. Checklist fase terkait
3. Log Activity
4. Bug Log jika ada
5. Decision Log jika ada keputusan baru
6. Current Context untuk sesi Claude berikutnya

Jangan mengubah PRD kecuali saya minta.
Jangan menambah fitur baru.
```

---

## Prompt Khusus: Debug Bug

Gunakan saat ada error.

```txt
Baca CLAUDE.md, docs/PRD.md, dan STATUS.md.

Saya mengalami bug berikut:
[PASTE ERROR / SCREENSHOT / LOG DI SINI]

Tugas:
1. Identifikasi penyebab paling mungkin.
2. Cari file yang relevan.
3. Perbaiki dengan perubahan paling kecil.
4. Jangan refactor besar.
5. Jangan tambah fitur baru.
6. Update STATUS.md bagian Bug Log dan Log Activity.

Sebelum mengubah file, jelaskan rencana perbaikannya secara singkat.
```

---

## Prompt Khusus: Cegah Scope Creep

Gunakan jika Claude mulai menyarankan fitur tambahan.

```txt
Stop. Kembali ke scope MVP.

Baca ulang:
- CLAUDE.md bagian "Hal yang JANGAN Dilakukan Claude"
- docs/PRD.md bagian Scope dan Di luar scope
- STATUS.md bagian Scope Guard

Tugas sekarang hanya:
[ISI TASK SAAT INI]

Jangan menambahkan:
- approval workflow
- email notifier
- SLA monitoring
- integrasi ERP
- import/export Excel
- fitur advanced analytics

Lanjutkan hanya task yang saya minta.
```

---

## Prompt Khusus: Ringkas Context Sebelum Sesi Baru

Gunakan ketika context Claude mulai panjang.

```txt
Buat ringkasan context development saat ini untuk disimpan di STATUS.md bagian "Current Context untuk Sesi Claude Berikutnya".

Ringkasan harus mencakup:
1. Fase aktif
2. Fitur yang sudah selesai
3. File yang terakhir diubah
4. Bug/masalah yang belum selesai
5. Keputusan teknis terbaru
6. Task berikutnya yang paling logis

Jangan coding.
Jangan mengubah file selain STATUS.md.
```

---

## Prompt Khusus: Review Sebelum Commit

Gunakan sebelum commit ke GitHub.

```txt
Review perubahan terakhir sebelum commit.

Tugas:
1. Cek apakah perubahan sesuai PRD.
2. Cek apakah ada secret/API key yang tidak sengaja masuk.
3. Cek apakah ada fitur di luar scope.
4. Cek apakah role/RBAC aman.
5. Cek apakah STATUS.md sudah diupdate.
6. Sarankan pesan commit yang ringkas.

Jangan melakukan perubahan besar kecuali ada bug critical.
```

---

## Template Pesan Commit

```txt
feat: add project registration with seg11 gate
fix: restrict pm project access by cabang id
docs: update status after phase 1
refactor: simplify margin calculation service
chore: configure vercel and render monorepo deployment
```
