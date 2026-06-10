import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import { proyekAPI } from '../services/api'

const STATUS_OPTIONS = [
  { value: '', label: 'Semua status' },
  { value: 'draft', label: 'Draft' },
  { value: 'aktif', label: 'Aktif' },
  { value: 'selesai', label: 'Selesai' },
  { value: 'arsip', label: 'Arsip' }
]

function formatRupiah(value) {
  const amount = Number(value || 0)
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount)
}

function ProyekList() {
  const { user, logout } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({ status: '', tahun: '' })

  const canWrite = user?.role === 'pm' || user?.role === 'admin'
  const canArchive = user?.role === 'admin'

  async function loadProjects() {
    setLoading(true)
    setError('')

    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== '')
      )
      const response = await proyekAPI.getProyek(params)
      setProjects(response.data.data)
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Gagal memuat daftar proyek')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [filters.status, filters.tahun])

  function updateFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value }))
  }

  async function handleArchive(project) {
    const confirmed = window.confirm(`Arsipkan proyek "${project.nama}"?`)
    if (!confirmed) return

    try {
      await proyekAPI.archiveProyek(project.id)
      await loadProjects()
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Gagal mengarsipkan proyek')
    }
  }

  return (
    <main className="app-shell master-shell">
      <section className="panel master-panel proyek-panel">
        <header className="master-header">
          <div>
            <p className="eyebrow">Phase 1E</p>
            <h1>Daftar Proyek</h1>
            <p className="muted">
              Kepala Divre melihat semua proyek, PM hanya melihat proyek cabangnya sendiri.
            </p>
          </div>
          <div className="actions">
            {canWrite ? <Link to="/proyek/new">Tambah proyek</Link> : null}
            <Link to="/">Beranda</Link>
            <button type="button" onClick={logout}>Logout</button>
          </div>
        </header>

        <div className="filter-row">
          <label>
            Status
            <select value={filters.status} onChange={(event) => updateFilter('status', event.target.value)}>
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label>
            Tahun mulai
            <input
              type="number"
              min="2000"
              max="2100"
              value={filters.tahun}
              onChange={(event) => updateFilter('tahun', event.target.value)}
              placeholder="Contoh: 2026"
            />
          </label>
        </div>

        {error ? <p className="error-message">{error}</p> : null}

        {loading ? (
          <p className="master-empty">Memuat daftar proyek...</p>
        ) : projects.length === 0 ? (
          <p className="master-empty">Belum ada proyek sesuai filter.</p>
        ) : (
          <div className="table-scroll">
            <table className="data-table proyek-table">
              <thead>
                <tr>
                  <th>Proyek</th>
                  <th>Cabang</th>
                  <th>Nilai</th>
                  <th>Status</th>
                  <th>Segmen 11</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id}>
                    <td>
                      <strong>{project.nama}</strong>
                      <span>{project.klien || 'Klien belum diisi'}</span>
                      <code>{project.nomor_spmk || 'SPMK belum diisi'}</code>
                    </td>
                    <td><code>{project.cabang_id}</code></td>
                    <td>
                      {formatRupiah(project.nilai_proyek)}
                      <span>{project.mata_uang_proyek}</span>
                    </td>
                    <td><span className={`status-pill status-${project.status}`}>{project.status}</span></td>
                    <td>
                      {project.seg11_no ? (
                        <span className="gate-badge gate-open">RAB siap diinput</span>
                      ) : (
                        <span className="gate-badge gate-locked">RAB terkunci</span>
                      )}
                      <small>{project.seg11_no || 'Segmen 11 belum diisi'}</small>
                    </td>
                    <td>
                      <div className="table-actions">
                        <Link to={`/proyek/${project.id}/detail`}>Detail</Link>
                        <Link to={`/proyek/${project.id}/rab`}>Kelola RAB</Link>
                        <Link to={`/proyek/${project.id}/realisasi`}>Realisasi</Link>
                        {canWrite ? <Link to={`/proyek/${project.id}/edit`}>Edit</Link> : null}
                        {canArchive ? (
                          <button type="button" className="danger-button" onClick={() => handleArchive(project)}>
                            Arsipkan
                          </button>
                        ) : null}
                        {!canWrite && !canArchive ? <span className="muted-inline">Baca saja</span> : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}

export default ProyekList
