import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import useAuth from '../hooks/useAuth'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { isAuthenticated, login, loading, error } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  if (isAuthenticated) {
    return <Navigate to={from} replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()

    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch {
      // Error message is stored in AuthContext and rendered below the password field.
    }
  }

  return (
    <main className="auth-page auth-modern">
      <div className="auth-modern-grid">
        <section className="auth-brand-card">
          <div>
            <p className="eyebrow">Divisi Regional Timur</p>
            <h1>Dashboard Monitoring Margin Proyek</h1>
            <p>Monitoring RAB awal, realisasi anggaran, delta margin, dan status proyek dalam satu dashboard internal.</p>
          </div>
          <div className="auth-feature-list">
            <div>
              <strong>Monitoring margin</strong>
              <span>RAB vs realisasi per proyek dan cabang.</span>
            </div>
            <div>
              <strong>RBAC 3 role</strong>
              <span>Admin, Kepala Divre, dan PM sesuai scope akses.</span>
            </div>
            <div>
              <strong>Segmen 11 gate</strong>
              <span>RAB terkunci sampai nomor Segmen 11 tersedia.</span>
            </div>
          </div>
        </section>

        <section className="auth-card">
          <p className="eyebrow">Masuk aplikasi</p>
          <h1>Selamat datang</h1>
          <p className="muted">Gunakan akun internal untuk mengakses dashboard.</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@sucofindo.co.id"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              required
            />

            {error ? <p className="error-message">{error}</p> : null}

            <Button type="submit" disabled={loading} size="lg">
              {loading ? 'Memproses...' : 'Masuk'}
            </Button>
          </form>
        </section>
      </div>
    </main>
  )
}

export default Login
