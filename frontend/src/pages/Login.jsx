import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import useAuth from '../hooks/useAuth'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { isAuthenticated, login, loading, error } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  useEffect(() => {
    document.title = 'Login | Divre Monitoring'
  }, [])

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
              placeholder="admin@regtim.com"
              required
            />

            <label className="ui-field password-field" htmlFor="password">
              <span>Password</span>
              <span className="password-input-wrap">
                <input
                  className="ui-input password-input"
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="admin123"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((current) => !current)}
                >
                  {showPassword ? (
                    <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
                      <path d="M3 3l18 18" />
                      <path d="M10.58 10.58a2 2 0 0 0 2.84 2.84" />
                      <path d="M9.88 4.24A10.8 10.8 0 0 1 12 4c5 0 8.5 4.5 9.5 8a11.8 11.8 0 0 1-2.1 3.6" />
                      <path d="M6.1 6.1A11.8 11.8 0 0 0 2.5 12c1 3.5 4.5 8 9.5 8a10.8 10.8 0 0 0 5.9-1.8" />
                    </svg>
                  ) : (
                    <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
                      <path d="M2.5 12c1-3.5 4.5-8 9.5-8s8.5 4.5 9.5 8c-1 3.5-4.5 8-9.5 8s-8.5-4.5-9.5-8Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </span>
            </label>

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
