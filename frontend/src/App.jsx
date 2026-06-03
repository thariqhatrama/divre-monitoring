import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import useAuth from './hooks/useAuth'
import Login from './pages/Login'
import './App.css'

function Home() {
  const { user, logout } = useAuth()

  return (
    <main className="app-shell">
      <section className="panel">
        <p className="eyebrow">Phase 1C</p>
        <h1>Auth dan RBAC aktif</h1>
        <p className="muted">
          Halaman ini adalah protected route sederhana untuk validasi login dan role.
        </p>

        <dl className="user-grid">
          <div>
            <dt>Nama</dt>
            <dd>{user?.nama}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{user?.email}</dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd>{user?.role}</dd>
          </div>
          <div>
            <dt>Cabang ID</dt>
            <dd>{user?.cabang_id || '-'}</dd>
          </div>
        </dl>

        <div className="actions">
          <Link to="/admin-test">Test route admin</Link>
          <button type="button" onClick={logout}>Logout</button>
        </div>
      </section>
    </main>
  )
}

function AdminTest() {
  return (
    <main className="app-shell">
      <section className="panel">
        <p className="eyebrow">Admin Only</p>
        <h1>Protected Route Admin</h1>
        <p className="muted">Jika halaman ini tampil, role user adalah admin.</p>
        <Link to="/">Kembali</Link>
      </section>
    </main>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute allowedRoles={['kepala_divre', 'pm', 'admin']}>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-test"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminTest />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
