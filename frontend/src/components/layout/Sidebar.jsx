import { NavLink, useLocation } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

const MENU_BY_ROLE = {
  admin: [
    { label: 'Dashboard', to: '/dashboard', icon: '▦' },
    { label: 'Proyek', to: '/proyek', icon: '◫', match: ['/proyek'] },
    { label: 'RAB / Realisasi', to: '/proyek', icon: '▤', match: ['/proyek'] },
    { label: 'Master COA', to: '/master-data', icon: '◇' },
    { label: 'Master Cabang', to: '/master-data', icon: '⌂' },
    { label: 'User Management', to: '/master-data', icon: '◉' },
    { label: 'Kurs', to: '/master-data', icon: '↔' }
  ],
  kepala_divre: [
    { label: 'Dashboard', to: '/dashboard', icon: '▦' },
    { label: 'Semua Proyek', to: '/proyek', icon: '◫', match: ['/proyek'] },
    { label: 'Laporan / Monitoring', to: '/dashboard', icon: '◎' }
  ],
  pm: [
    { label: 'Dashboard Cabang', to: '/dashboard-cabang', icon: '▦' },
    { label: 'Proyek Saya', to: '/proyek', icon: '◫', match: ['/proyek'] },
    { label: 'Input RAB', to: '/proyek', icon: '▤', match: ['/proyek'] },
    { label: 'Realisasi', to: '/proyek', icon: '↗', match: ['/proyek'] }
  ]
}

function isMenuActive(item, pathname) {
  if (item.to === pathname) {
    return true
  }

  return item.match?.some((path) => pathname === path || pathname.startsWith(`${path}/`)) || false
}

function Sidebar({ isOpen, onNavigate }) {
  const location = useLocation()
  const { user } = useAuth()
  const role = user?.role
  const menuItems = MENU_BY_ROLE[role] || []

  return (
    <aside className={["app-sidebar", isOpen ? 'is-open' : ''].filter(Boolean).join(' ')} aria-label="Navigasi utama">
      <div className="sidebar-brand">
        <div className="sidebar-logo">DM</div>
        <div>
          <strong>Divre Monitoring</strong>
          <span>Margin Proyek</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item, index) => {
          const active = isMenuActive(item, location.pathname)

          return (
            <NavLink
              className={["sidebar-link", active ? 'active' : ''].filter(Boolean).join(' ')}
              key={`${item.label}-${index}`}
              onClick={onNavigate}
              to={item.to}
            >
              <span aria-hidden="true" className="sidebar-link-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <span>PT SUCOFINDO</span>
        <strong>Divisi Regional Timur</strong>
      </div>
    </aside>
  )
}

export default Sidebar
