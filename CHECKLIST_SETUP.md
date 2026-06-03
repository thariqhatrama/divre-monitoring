# Checklist Setup Project — Sebelum Mulai Coding

## Urutan: ikuti dari atas ke bawah, jangan lompat.

---

## FASE 0 — Akun & Tools (30 menit)

### Buat akun (jika belum ada)
- [x] GitHub → https://github.com (buat repo baru: `divre-monitoring`)
- [ ] Supabase → https://supabase.com (1 project, pilih region Singapore)
- [ ] Vercel → https://vercel.com (connect ke GitHub)
- [ ] Render → https://render.com (connect ke GitHub)
- [ ] OpenRouter → https://openrouter.ai (untuk AI Router di Claude CLI)

### Install di laptop
- [ ] Node.js 20 LTS → https://nodejs.org
- [ ] Git
- [ ] Claude CLI → `npm install -g @anthropic-ai/claude-code`
- [ ] VS Code atau editor pilihan

---

## FASE 1 — Setup Repo (15 menit)

```bash
mkdir divre-monitoring && cd divre-monitoring
git init

# Buat dua folder utama
mkdir frontend backend docs

# Inisialisasi frontend (React + Vite)
cd frontend
npm create vite@latest . -- --template react
npm install react-router-dom recharts axios

# Inisialisasi backend
cd ../backend
npm init -y
npm install express cors helmet jsonwebtoken bcryptjs dotenv @supabase/supabase-js
npm install -D nodemon

cd ..
git add . && git commit -m "initial setup"
```

### File yang harus dibuat manual di root:

**`CLAUDE.md`** ← wajib di root repo agar dibaca Claude CLI otomatis

**`docs/PRD.md`** ← requirement utama project; Claude harus diarahkan untuk membaca file ini sebelum coding

**`.gitignore`** di root:
```
node_modules/
.env
.env.local
dist/
.DS_Store
```

**`frontend/vercel.json`**:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**`backend/render.yaml`**:
```yaml
services:
  - type: web
    name: divre-api
    env: node
    buildCommand: npm install
    startCommand: node src/app.js
    envVars:
      - key: NODE_ENV
        value: production
```

**`backend/.env`** (JANGAN commit ke git):
```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...
JWT_SECRET=ganti_dengan_random_string_panjang
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

**`frontend/.env.local`** (JANGAN commit ke git):
```
VITE_API_URL=http://localhost:3001
```

---

## FASE 2 — Setup Supabase (20 menit)

### Di dashboard Supabase:

1. Buat project baru, catat `Project URL` dan `service_role key` (bukan anon key)

2. Buka SQL Editor, jalankan migration dalam urutan ini:

**Step 1 — Buat semua tabel** (isi dari `backend/migrations/001_create_tables.sql`; termasuk tabel `realisasi_items` terpisah dari `rab_items`)

**Step 2 — Seed COA 2025** (isi dari `backend/migrations/002_seed_coa.sql`)
Ini akan mengisi kode akun dari COA 2025 yang ada di folder project

**Step 3 — Seed branches** (isi dari `backend/migrations/003_seed_branches.sql`)
Ini akan mengisi 13 cabang + 26 UP sesuai COA Seg 2&3

3. Nonaktifkan RLS untuk semua tabel (backend pakai service key, bukan anon key):
```sql
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE rab_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE realisasi_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE branches DISABLE ROW LEVEL SECURITY;
ALTER TABLE coa_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE kurs_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log DISABLE ROW LEVEL SECURITY;
```

4. Buat user admin pertama langsung via SQL:
```sql
INSERT INTO users (nama, email, password_hash, role)
VALUES (
  'Admin Staff RAB',
  'admin@sucofindo.co.id',
  -- password: 'admin123' (ganti setelah login pertama)
  '$2b$10$YourHashedPasswordHere',
  'admin'
);
```
Untuk generate hash password: `node -e "const b=require('bcryptjs'); console.log(b.hashSync('admin123',10))"`

---

## FASE 3 — Config Claude CLI + AI Router (10 menit)

### Setup OpenRouter

1. Daftar di openrouter.ai, buat API key
2. Di root repo, buat file `.claude/settings.json`:

```json
{
  "apiUrl": "https://openrouter.ai/api/v1",
  "apiKey": "sk-or-v1-xxxx",
  "model": "anthropic/claude-sonnet-4-5"
}
```

### Strategi routing hemat token

Gunakan flag `--model` saat ada task berbeda:

| Task | Command |
|---|---|
| Buat komponen sederhana, fix typo | `claude --model anthropic/claude-haiku-3` |
| Buat endpoint, refactor | `claude` (default sonnet) |
| Debug kompleks, arsitektur | `claude --model anthropic/claude-opus-4` |

### Mulai sesi Claude CLI

```bash
# Dari root repo (penting! CLAUDE.md harus terbaca)
cd divre-monitoring
claude

# Claude akan baca CLAUDE.md otomatis → tidak perlu jelaskan project dari awal
# Hemat ~500-1000 token per sesi
```

---

## FASE 4 — Verifikasi Setup (10 menit)

Jalankan ini sebelum mulai coding fitur:

```bash
# Test backend jalan
cd backend
node src/app.js
# Harus muncul: "Server running on port 3001"

# Test koneksi Supabase
# Buat file backend/test-db.js:
# const { createClient } = require('@supabase/supabase-js')
# const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
# db.from('users').select('*').then(({data,error}) => console.log(data, error))
node test-db.js
# Harus return array (kosong atau ada user admin)

# Test frontend jalan
cd ../frontend
npm run dev
# Buka http://localhost:5173
```

---

## FASE 5 — Urutan Coding (3 Minggu)

### Minggu 1
- [ ] `backend/src/db/supabase.js` — init client
- [ ] `backend/src/app.js` — express setup + cors + middleware
- [ ] `backend/src/middleware/auth.middleware.js` — JWT verify
- [ ] `backend/src/middleware/rbac.middleware.js` — role check
- [ ] `backend/src/routes/auth.routes.js` + controller — login/logout
- [ ] `backend/src/models/proyek.model.js` + routes + controller — CRUD proyek
- [ ] `backend/src/models/rab.model.js` + routes + controller — CRUD RAB
- [ ] `backend/src/services/coa.service.js` — validasi akun aktif
- [ ] `frontend/src/services/api.js` — axios instance + interceptors
- [ ] `frontend/src/context/AuthContext.jsx` — login state
- [ ] `frontend/src/pages/Login.jsx`
- [ ] `frontend/src/pages/ProyekForm.jsx` — registrasi + input Seg 11

### Minggu 2
- [ ] `backend/src/services/margin.service.js` — INTI kalkulasi
- [ ] `backend/src/services/kurs.service.js`
- [ ] `frontend/src/utils/marginFlag.js` + `formatIDR.js` + `currencyConvert.js`
- [ ] `frontend/src/pages/RABForm.jsx` — form dengan gate Seg 11 + real-time margin
- [ ] `frontend/src/pages/RealisasiForm.jsx`
- [ ] `frontend/src/components/MarginBadge.jsx` + `MarginCard.jsx`
- [ ] `backend/src/routes/realisasi.routes.js` + controller
- [ ] `backend/src/routes/master.routes.js` + controller — admin panel

### Minggu 3
- [ ] `backend/src/routes/dashboard.routes.js` — aggregat + by-cabang
- [ ] `frontend/src/pages/Dashboard.jsx` + `DashboardCabang.jsx`
- [ ] `frontend/src/components/ProyekTable.jsx` + `MarginChart.jsx` + `BreakdownChart.jsx`
- [ ] `frontend/src/context/FilterContext.jsx`
- [ ] `frontend/src/pages/ProyekDetail.jsx`
- [ ] `frontend/src/components/ProtectedRoute.jsx`
- [ ] Deploy backend ke Render
- [ ] Deploy frontend ke Vercel
- [ ] Setup UptimeRobot untuk ping Render agar tidak tidur
- [ ] Testing end-to-end + bug fixes

---

## File yang Harus Kamu Buat Sendiri (tidak di-generate otomatis)

| File | Isi |
|---|---|
| `backend/migrations/002_seed_coa.sql` | Export COA 2025 dari file Excel yang ada di folder project → konversi ke INSERT SQL |
| `backend/migrations/003_seed_branches.sql` | 13 cabang + 26 UP dari COA Seg 2&3 → INSERT SQL |
| `backend/.env` | Credentials Supabase + JWT secret (dari dashboard Supabase) |
| `frontend/.env.local` | VITE_API_URL (localhost saat dev, Render URL saat prod) |
| `.claude/settings.json` | API key OpenRouter + model default |

---

## Perintah Deploy

### Konfigurasi monorepo wajib

Satu repo GitHub dipakai oleh dua platform:

| Platform | Root Directory | Build Command | Start/Output |
|---|---|---|---|
| Vercel | `frontend` | `npm run build` | Output: `dist` |
| Render | `backend` | `npm install` | Start: `node src/app.js` |

Vercel dan Render sama-sama bisa connect ke repository yang sama. Yang membedakan hanya **Root Directory** masing-masing service. Jangan membuat repository terpisah untuk FE dan BE.


```bash
# Deploy backend ke Render
# → Push ke GitHub, Render auto-deploy dari branch main
# → Set environment variables di Render dashboard

# Deploy frontend ke Vercel
cd frontend
npx vercel --prod
# → Atau connect GitHub repo di vercel.com, auto-deploy setiap push

# Update CORS setelah dapat Render URL
# Di Render env vars: CORS_ORIGIN=https://[nama-project].vercel.app
# Di Vercel env vars: VITE_API_URL=https://[nama-service].onrender.com
```

---

## Anti-Forget List

Sebelum demo ke mentor, cek ini:
- [ ] Admin user bisa login
- [ ] PM user hanya bisa lihat cabangnya sendiri
- [ ] Proyek tanpa Seg 11 → form RAB terkunci (cek di browser)
- [ ] Input RAB USD → margin tetap dalam IDR
- [ ] Proyek dengan margin < 6% → baris merah di dashboard
- [ ] Delta margin ▲/▼ muncul setelah ada transaksi realisasi
- [ ] CORS tidak error di browser console (Vercel → Render)
