import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import Button from '../ui/Button'

const PAGE_TITLES = [
  { path: '/dashboard-cabang', title: 'Dashboard Cabang', description: 'Monitoring margin proyek untuk cabang Anda' },
  { path: '/dashboard', title: 'Dashboard Kepala Divre', description: 'Ringkasan margin proyek seluruh cabang' },
  { path: '/master-data', title: 'Master Data', description: 'Kelola COA, cabang, dan user' },
  { path: '/proyek', title: 'Proyek', description: 'Daftar proyek, RAB, dan realisasi' },
  { path: '/', title: 'Dashboard Monitoring Margin', description: 'Aplikasi monitoring margin proyek Divre Timur' }
]

function getPageMeta(pathname) {
  return PAGE_TITLES.find((item) => pathname === item.path || pathname.startsWith(`${item.path}/`)) || PAGE_TITLES[PAGE_TITLES.length - 1]
}

function formatRole(role) {
  if (role === 'kepala_divre') return 'Kepala Divre'
  if (role === 'pm') return 'Project Manager'
  if (role === 'admin') return 'Admin'
  return role || '-'
}

function Header({ onOpenSidebar }) {
  const location = useLocation()
  const { logout, user } = useAuth()
  const pageMeta = getPageMeta(location.pathname)
  const roleLabel = formatRole(user?.role)

  useEffect(() => {
    document.title = `${pageMeta.title} — ${roleLabel} | Divre Monitoring`
  }, [pageMeta.title, roleLabel])

  return (
    <header className="app-header">
      <div className="app-header-title">
        <button className="sidebar-toggle" onClick={onOpenSidebar} type="button" aria-label="Buka navigasi">
          ☰
        </button>
        <div>
          <h1>{pageMeta.title}</h1>
          <p>{pageMeta.description}</p>
        </div>
      </div>

      <div className="app-header-actions">
        <div className="user-chip" title={user?.email}>
          <span>{user?.nama?.charAt(0)?.toUpperCase() || 'U'}</span>
          <div>
            <strong>{user?.nama || 'User'}</strong>
            <small>{formatRole(user?.role)}</small>
          </div>
        </div>

        <Button onClick={logout} size="sm" variant="secondary">Logout</Button>
      </div>
    </header>
  )
}

export default Header
