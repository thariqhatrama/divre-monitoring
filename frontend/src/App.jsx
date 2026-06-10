import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'
import useAuth from './hooks/useAuth'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import DashboardCabang from './pages/DashboardCabang'
import MasterData from './pages/MasterData'
import AuditLog from './pages/AuditLog'
import ProyekDetail from './pages/ProyekDetail'
import ProyekForm from './pages/ProyekForm'
import ProyekList from './pages/ProyekList'
import RABForm from './pages/RABForm'
import RealisasiForm from './pages/RealisasiForm'
import UserGuide from './pages/UserGuide'
import './App.css'

function Home() {
  const { user, logout } = useAuth()

  return (
    <main className="app-shell">
      <section className="panel">
        <p className="eyebrow">Portal Internal</p>
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
          {(user?.role === 'kepala_divre' || user?.role === 'admin') && <Link to="/dashboard">Dashboard Kepala Divre</Link>}
          {user?.role === 'pm' && <Link to="/dashboard-cabang">Dashboard PM Cabang</Link>}
          <Link to="/proyek">Daftar proyek</Link>
          <Link to="/admin-test">Test route admin</Link>
          {user?.role === 'admin' && <Link to="/master-data">Master data</Link>}
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

function ProtectedLayout({ allowedRoles, children }) {
  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
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
            <ProtectedLayout allowedRoles={['kepala_divre', 'pm', 'admin']}>
              <Home />
            </ProtectedLayout>
          }
        />
        <Route
          path="/user-guide"
          element={
            <ProtectedLayout allowedRoles={['kepala_divre', 'pm', 'admin']}>
              <UserGuide />
            </ProtectedLayout>
          }
        />
        <Route
          path="/admin-test"
          element={
            <ProtectedLayout allowedRoles={['admin']}>
              <AdminTest />
            </ProtectedLayout>
          }
        />
        <Route
          path="/master-data"
          element={
            <ProtectedLayout allowedRoles={['admin']}>
              <MasterData />
            </ProtectedLayout>
          }
        />
        <Route
          path="/master-data/:tab"
          element={
            <ProtectedLayout allowedRoles={['admin']}>
              <MasterData />
            </ProtectedLayout>
          }
        />
        <Route
          path="/audit-log"
          element={
            <ProtectedLayout allowedRoles={['admin']}>
              <AuditLog />
            </ProtectedLayout>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedLayout allowedRoles={['kepala_divre', 'admin']}>
              <Dashboard />
            </ProtectedLayout>
          }
        />
        <Route
          path="/dashboard-cabang"
          element={
            <ProtectedLayout allowedRoles={['pm']}>
              <DashboardCabang />
            </ProtectedLayout>
          }
        />
        <Route
          path="/proyek"
          element={
            <ProtectedLayout allowedRoles={['kepala_divre', 'pm', 'admin']}>
              <ProyekList />
            </ProtectedLayout>
          }
        />
        <Route
          path="/proyek/new"
          element={
            <ProtectedLayout allowedRoles={['pm', 'admin']}>
              <ProyekForm />
            </ProtectedLayout>
          }
        />
        <Route
          path="/proyek/:id/edit"
          element={
            <ProtectedLayout allowedRoles={['pm', 'admin']}>
              <ProyekForm />
            </ProtectedLayout>
          }
        />
        <Route
          path="/proyek/:id/detail"
          element={
            <ProtectedLayout allowedRoles={['kepala_divre', 'pm', 'admin']}>
              <ProyekDetail />
            </ProtectedLayout>
          }
        />
        <Route
          path="/proyek/:id/rab"
          element={
            <ProtectedLayout allowedRoles={['kepala_divre', 'pm', 'admin']}>
              <RABForm />
            </ProtectedLayout>
          }
        />
        <Route
          path="/proyek/:id/realisasi"
          element={
            <ProtectedLayout allowedRoles={['kepala_divre', 'pm', 'admin']}>
              <RealisasiForm />
            </ProtectedLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
