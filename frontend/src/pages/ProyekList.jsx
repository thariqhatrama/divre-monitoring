import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import Input from '../components/ui/Input'
import LoadingState from '../components/ui/LoadingState'
import PageHeader from '../components/ui/PageHeader'
import Select from '../components/ui/Select'
import useAuth from '../hooks/useAuth'
import { proyekAPI } from '../services/api'
import { formatIDR } from '../utils/formatIDR'

const STATUS_OPTIONS = [
  { value: '', label: 'Semua status' },
  { value: 'draft', label: 'Draft' },
  { value: 'aktif', label: 'Aktif' },
  { value: 'selesai', label: 'Selesai' },
  { value: 'arsip', label: 'Arsip' }
]

function ProyekList() {
  const { user, logout } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({ status: '', tahun: '', q: '' })

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
  }, [filters.status, filters.tahun, filters.q])

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
      <section className="panel master-panel proyek-panel dashboard-panel">
        <div className="page-stack">
          <div className="dashboard-hero">
            <PageHeader
              eyebrow="Proyek"
              title="Daftar Proyek"
              description="Kepala Divre melihat semua proyek, PM hanya melihat proyek cabangnya sendiri."
              actions={(
                <>
                  {canWrite ? <Link className="action-link primary" to="/proyek/new">Tambah proyek</Link> : null}
                  <Link className="action-link" to="/">Beranda</Link>
                  <Button onClick={logout} variant="secondary">Logout</Button>
                </>
              )}
            />
          </div>

          <Card className="filter-card">
            <div className="filter-card-title">
              <div>
                <h2>Filter proyek</h2>
                <p>Tampilkan proyek berdasarkan kata kunci, status, dan tahun mulai.</p>
              </div>
            </div>
            <div className="filter-row proyek-filter-row">
              <Input
                label="Cari proyek / klien"
                type="search"
                value={filters.q}
                onChange={(event) => updateFilter('q', event.target.value)}
                placeholder="Contoh: marine, sertifikasi, klien"
              />
              <Select label="Status" value={filters.status} onChange={(event) => updateFilter('status', event.target.value)}>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Select>
              <Input
                label="Tahun mulai"
                type="number"
                min="2000"
                max="2100"
                value={filters.tahun}
                onChange={(event) => updateFilter('tahun', event.target.value)}
                placeholder="Contoh: 2026"
              />
            </div>
          </Card>

          {error ? <p className="error-message">{error}</p> : null}

          {loading ? (
            <LoadingState label="Memuat daftar proyek..." />
          ) : projects.length === 0 ? (
            <EmptyState title="Belum ada proyek" description="Belum ada proyek sesuai filter." />
          ) : (
            <Card className="section-card">
              <div className="section-title-row">
                <div>
                  <h2>Tabel proyek</h2>
                  <p>{projects.length} proyek tampil</p>
                </div>
              </div>
              <div className="table-scroll modern-table">
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
                          <div className="project-cell">
                            <strong>{project.nama}</strong>
                            <span>{project.klien || 'Klien belum diisi'}</span>
                          </div>
                        </td>
                        <td>
                          <div className="project-cell">
                            <strong>{project.cabang?.nama || '-'}</strong>
                            <span>{project.cabang?.kode_seg23 || 'Cabang belum teridentifikasi'}</span>
                          </div>
                        </td>
                        <td>{formatIDR(project.nilai_proyek)}</td>
                        <td><span className={`status-pill status-${project.status}`}>{project.status}</span></td>
                        <td>
                          <div className="project-cell">
                            {project.seg11_no ? (
                              <span className="gate-badge gate-open">RAB siap diinput</span>
                            ) : (
                              <span className="gate-badge gate-locked">RAB terkunci</span>
                            )}
                            <small>{project.seg11_no || 'Segmen 11 belum diisi'}</small>
                          </div>
                        </td>
                        <td>
                          <div className="table-actions">
                            <Link className="action-link primary" to={`/proyek/${project.id}/detail`}>Detail</Link>
                            <Link className="action-link" to={`/proyek/${project.id}/rab`}>Kelola RAB</Link>
                            <Link className="action-link" to={`/proyek/${project.id}/realisasi`}>Realisasi</Link>
                            {canWrite ? <Link className="action-link ghost" to={`/proyek/${project.id}/edit`}>Edit</Link> : null}
                            {canArchive ? (
                              <Button size="sm" type="button" variant="danger" onClick={() => handleArchive(project)}>
                                Arsipkan
                              </Button>
                            ) : null}
                            {!canWrite && !canArchive ? <span className="muted-inline">Baca saja</span> : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </section>
    </main>
  )
}

export default ProyekList
