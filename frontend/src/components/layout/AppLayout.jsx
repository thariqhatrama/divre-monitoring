import { useState } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'

function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function closeSidebar() {
    setSidebarOpen(false)
  }

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onNavigate={closeSidebar} />
      {sidebarOpen && <button aria-label="Tutup navigasi" className="sidebar-backdrop" onClick={closeSidebar} type="button" />}

      <div className="app-layout-main">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="app-content">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AppLayout
