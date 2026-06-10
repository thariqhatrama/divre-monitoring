import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import MarginBadge from '../components/MarginBadge'
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
  const branch = projects[0]?.cabang || summary?.branches?.find((item) => item.id === user?.cabang_id)

  return (
    <main className="app-shell master-shell">
      <section className="panel master-panel proyek-panel dashboard-panel">
        <header className="master-header">
          <div>
            <p className="eyebrow">Phase 3B</p>
            <h1>Dashboard PM Cabang</h1>
            <p className="muted">
              Data dibatasi oleh backend ke cabang login: {branch?.nama || user?.cabang_id || '-'}.
            </p>
          </div>
          <div className="actions">
            <Link to="/proyek">Daftar proyek</Link>
            <Link to="/">Beranda</Link>
            <button type="button" onClick={logout}>Logout</button>
          </div>
        </header>

        <div className="filter-row dashboard-filter-row pm-dashboard-filter-row">
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
          <label>
            Status proyek
            <select value={filters.status} onChange={(event) => updateFilter('status', event.target.value)}>
              {PROJECT_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label>
            Status margin
            <select value={filters.status_margin} onChange={(event) => updateFilter('status_margin', event.target.value)}>
              {MARGIN_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
        </div>

        {error ? <p className="error-message">{error}</p> : null}

        {loading ? (
          <p className="master-empty">Memuat dashboard cabang...</p>
        ) : (
          <>
            <section className="kpi-grid">
              <div className="kpi-card">
                <span>Total proyek aktif</span>
                <strong>{summary?.total_proyek_aktif || 0}</strong>
              </div>
              <div className="kpi-card">
                <span>Total nilai proyek cabang</span>
                <strong>{formatIDR(summary?.total_nilai_proyek, { short: true })}</strong>
                <small>{formatIDR(summary?.total_nilai_proyek)}</small>
              </div>
              <div className="kpi-card">
                <span>Rata-rata margin RAB</span>
                <strong>{formatPercent(summary?.rata_margin_rab)}</strong>
              </div>
              <div className="kpi-card">
                <span>Rata-rata margin realisasi</span>
                <strong>{formatPercent(summary?.rata_margin_realisasi)}</strong>
              </div>
              <div className="kpi-card kpi-danger">
                <span>Proyek kritis/rugi</span>
                <strong>{summary?.jumlah_proyek_kritis_rugi || 0}</strong>
              </div>
            </section>

            <section className="dashboard-section">
              <div className="master-content-header">
                <h2>Tabel proyek cabang</h2>
                <span>{projects.length} proyek tampil</span>
              </div>
              {projects.length === 0 ? (
                <p className="master-empty">Belum ada proyek cabang sesuai filter.</p>
              ) : (
                <div className="table-scroll">
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
                              <strong>{project.nama}</strong>
                              <span>{project.klien || 'Klien belum diisi'}</span>
                              <code>{project.nomor_spmk || 'SPMK belum diisi'}</code>
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
                                <Link to={`/proyek/${project.id}/detail`}>Detail</Link>
                                <Link to={`/proyek/${project.id}/rab`}>RAB</Link>
                                <Link to={`/proyek/${project.id}/realisasi`}>Realisasi</Link>
                                <Link to={`/proyek/${project.id}/edit`}>Edit</Link>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </section>
    </main>
  )
}

export default DashboardCabang
