import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import MarginBadge from '../components/MarginBadge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import Input from '../components/ui/Input'
import LoadingState from '../components/ui/LoadingState'
import PageHeader from '../components/ui/PageHeader'
import Select from '../components/ui/Select'
import useAuth from '../hooks/useAuth'
import { dashboardAPI } from '../services/api'
import { formatIDR, formatPercent } from '../utils/formatIDR'

const PROJECT_STATUS_OPTIONS = [
  { value: '', label: 'Semua status proyek' },
  { value: 'draft', label: 'Draft' },
  { value: 'aktif', label: 'Aktif' },
  { value: 'selesai', label: 'Selesai' }
]

const MARGIN_STATUS_OPTIONS = [
  { value: '', label: 'Semua status margin' },
  { value: 'aman', label: 'Aman' },
  { value: 'perhatian', label: 'Perhatian' },
  { value: 'kritis', label: 'Kritis' },
  { value: 'rugi', label: 'Rugi' },
  { value: 'kritis_rugi', label: 'Kritis + rugi' }
]

function formatDelta(value, indicator) {
  const formatted = formatPercent(value)
  if (formatted === '-') return '-'
  if (indicator === 'naik') return `▲ ${formatted}`
  if (indicator === 'turun') return `▼ ${formatted}`
  return `◆ ${formatted}`
}

function getDeltaClass(indicator) {
  if (indicator === 'naik') return 'delta-up'
  if (indicator === 'turun') return 'delta-down'
  return 'delta-flat'
}

function DashboardCabang() {
  const { user, logout } = useAuth()
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    q: '',
    tahun: '',
    status: '',
    status_margin: ''
  })

  const params = useMemo(() => Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== '')
  ), [filters])

  async function loadDashboard() {
    setLoading(true)
    setError('')

    try {
      const response = await dashboardAPI.getSummary(params)
      setSummary(response.data.data)
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Gagal memuat dashboard cabang')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [params])

  function updateFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value }))
  }

  const projects = summary?.projects || []
  const branch = projects[0]?.cabang || user?.cabang || summary?.branches?.find((item) => item.id === user?.cabang_id)

  return (
    <main className="app-shell master-shell">
      <section className="panel master-panel proyek-panel dashboard-panel">
        <div className="page-stack">
          <div className="dashboard-hero">
            <PageHeader
              eyebrow="Dashboard Cabang"
              title="Dashboard PM Cabang"
              description={`Data dibatasi oleh backend ke cabang login: ${branch ? `${branch.kode_seg23} — ${branch.nama}` : '-'}.`}
              actions={(
                <>
                  <Link className="action-link primary" to="/proyek">Daftar proyek</Link>
                  <Link className="action-link" to="/">Beranda</Link>
                  <Button onClick={logout} variant="secondary">Logout</Button>
                </>
              )}
            />
          </div>

          <Card className="filter-card">
            <div className="filter-card-title">
              <div>
                <h2>Filter proyek cabang</h2>
                <p>Cari proyek berdasarkan nama proyek, nama klien, atau Segmen 11. Filter ini tidak mengubah scope cabang PM; pembatasan cabang tetap dari backend.</p>
              </div>
            </div>
            <div className="filter-row dashboard-filter-row pm-dashboard-filter-row">
              <Input
                label="Search"
                value={filters.q}
                onChange={(event) => updateFilter('q', event.target.value)}
                placeholder="Nama proyek, klien, atau Segmen 11"
              />
              <Input
                label="Tahun mulai"
                type="number"
                min="2000"
                max="2100"
                value={filters.tahun}
                onChange={(event) => updateFilter('tahun', event.target.value)}
                placeholder="Contoh: 2026"
              />
              <Select label="Status proyek" value={filters.status} onChange={(event) => updateFilter('status', event.target.value)}>
                {PROJECT_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Select>
              <Select label="Status margin" value={filters.status_margin} onChange={(event) => updateFilter('status_margin', event.target.value)}>
                {MARGIN_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Select>
            </div>
          </Card>

          {error ? <p className="error-message">{error}</p> : null}

          {loading ? (
            <LoadingState label="Memuat dashboard cabang..." />
          ) : (
            <>
              <section className="metric-grid">
                <div className="metric-card">
                  <span>Total proyek aktif</span>
                  <strong>{summary?.total_proyek_aktif || 0}</strong>
                </div>
                <div className="metric-card">
                  <span>Total nilai proyek cabang</span>
                  <strong>{formatIDR(summary?.total_nilai_proyek, { short: true })}</strong>
                  <small>{formatIDR(summary?.total_nilai_proyek)}</small>
                </div>
                <div className="metric-card">
                  <span>Rata-rata margin RAB</span>
                  <strong>{formatPercent(summary?.rata_margin_rab)}</strong>
                </div>
                <div className="metric-card">
                  <span>Rata-rata margin realisasi</span>
                  <strong>{formatPercent(summary?.rata_margin_realisasi)}</strong>
                </div>
                <div className="metric-card metric-danger">
                  <span>Proyek kritis/rugi</span>
                  <strong>{summary?.jumlah_proyek_kritis_rugi || 0}</strong>
                </div>
              </section>

              <Card className="section-card">
                <div className="section-title-row">
                  <div>
                    <h2>Tabel proyek cabang</h2>
                    <p>{projects.length} proyek tampil</p>
                  </div>
                </div>
                {projects.length === 0 ? (
                  <EmptyState title="Belum ada proyek cabang" description="Belum ada proyek cabang sesuai filter." />
                ) : (
                  <div className="table-scroll modern-table">
                    <table className="data-table proyek-table dashboard-project-table">
                      <thead>
                        <tr>
                          <th>Nama Proyek</th>
                          <th>Nilai</th>
                          <th>Total RAB</th>
                          <th>Margin RAB</th>
                          <th>Total Realisasi</th>
                          <th>Margin Realisasi</th>
                          <th>Delta</th>
                          <th>Status Margin</th>
                          <th>Status Proyek</th>
                          <th>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projects.map((project) => {
                          const isCritical = ['kritis', 'rugi'].includes(project.status_margin)

                          return (
                            <tr key={project.id} className={isCritical ? 'project-risk-row' : undefined}>
                              <td>
                                <div className="project-cell">
                                  <strong>{project.nama}</strong>
                                  <span>{project.klien || 'Klien belum diisi'}</span>
                                </div>
                              </td>
                              <td>{formatIDR(project.nilai_proyek_idr, { short: true })}</td>
                              <td>{formatIDR(project.total_rab_idr, { short: true })}</td>
                              <td>{formatPercent(project.margin_rab)}</td>
                              <td>{formatIDR(project.total_realisasi_idr, { short: true })}</td>
                              <td>{formatPercent(project.margin_realisasi)}</td>
                              <td className={getDeltaClass(project.indikator_delta)}>{formatDelta(project.delta_margin, project.indikator_delta)}</td>
                              <td><MarginBadge status={project.status_margin} /></td>
                              <td><span className={`status-pill status-${project.status}`}>{project.status}</span></td>
                              <td>
                                <div className="table-actions">
                                  <Link className="action-link primary" to={`/proyek/${project.id}/detail`}>Detail</Link>
                                  <Link className="action-link" to={`/proyek/${project.id}/rab`}>RAB</Link>
                                  <Link className="action-link" to={`/proyek/${project.id}/realisasi`}>Realisasi</Link>
                                  <Link className="action-link ghost" to={`/proyek/${project.id}/edit`}>Edit</Link>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </>
          )}
        </div>
      </section>
    </main>
  )
}

export default DashboardCabang
