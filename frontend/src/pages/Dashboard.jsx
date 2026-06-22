import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import MarginBadge from '../components/MarginBadge'
import MarginChart from '../components/MarginChart'
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

function Dashboard() {
  const { user, logout } = useAuth()
  const [summary, setSummary] = useState(null)
  const [byCabang, setByCabang] = useState([])
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    cabang_id: '',
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
      const [summaryResponse, byCabangResponse] = await Promise.all([
        dashboardAPI.getSummary(params),
        dashboardAPI.getByCabang(params)
      ])

      setSummary(summaryResponse.data.data)
      setByCabang(byCabangResponse.data.data)
      setBranches(summaryResponse.data.data.branches || [])
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Gagal memuat dashboard Kepala Divre')
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
  const marginChartData = byCabang.map((item) => ({
    name: item.nama_cabang || item.kode_seg23,
    margin_rab: item.rata_margin_rab,
    margin_realisasi: item.rata_margin_realisasi
  }))

  return (
    <main className="app-shell master-shell">
      <section className="panel master-panel proyek-panel dashboard-panel">
        <div className="page-stack">
          <div className="dashboard-hero">
            <PageHeader
              eyebrow="Dashboard"
              title="Dashboard Kepala Divre"
              description="Monitoring margin semua cabang berdasarkan RAB awal dan realisasi anggaran."
              actions={(
                <>
                  <Link className="action-link primary" to="/proyek">Daftar proyek</Link>
                  <Link className="action-link" to="/">Beranda</Link>
                  <Button onClick={logout} variant="secondary">Logout</Button>
                </>
              )}
            />
            {user?.role === 'pm' ? (
              <p className="error-message">PM tidak memakai dashboard semua cabang. Gunakan daftar proyek cabang sendiri.</p>
            ) : null}
          </div>

          <Card className="filter-card">
            <div className="filter-card-title">
              <div>
                <h2>Filter monitoring</h2>
                <p>Persempit data berdasarkan cabang, tahun, status proyek, dan status margin.</p>
              </div>
            </div>
            <div className="filter-row dashboard-filter-row">
              <Select label="Cabang" value={filters.cabang_id} onChange={(event) => updateFilter('cabang_id', event.target.value)}>
                <option value="">Semua cabang</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.kode_seg23} — {branch.nama}
                  </option>
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
            <LoadingState label="Memuat dashboard..." />
          ) : (
            <>
              <section className="metric-grid">
                <div className="metric-card">
                  <span>Total proyek aktif</span>
                  <strong>{summary?.total_proyek_aktif || 0}</strong>
                </div>
                <div className="metric-card">
                  <span>Total nilai proyek</span>
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

              <section className="chart-grid">
                <Card
                  className="section-card"
                  title="Visual margin per cabang"
                  description="Perbandingan rata-rata margin RAB dan realisasi."
                >
                  {marginChartData.length === 0 ? (
                    <EmptyState title="Belum ada data chart" description="Data cabang belum tersedia untuk filter ini." />
                  ) : (
                    <MarginChart data={marginChartData} />
                  )}
                </Card>

                <Card className="section-card">
                  <div className="section-title-row">
                    <div>
                      <h2>Margin per cabang</h2>
                      <p>{byCabang.length} cabang tampil</p>
                    </div>
                  </div>
                  {byCabang.length === 0 ? (
                    <EmptyState title="Belum ada data cabang" description="Belum ada data cabang sesuai filter." />
                  ) : (
                    <div className="table-scroll modern-table">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Cabang</th>
                            <th>Proyek</th>
                            <th>Nilai</th>
                            <th>Avg Margin RAB</th>
                            <th>Avg Margin Realisasi</th>
                            <th>Kritis/Rugi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {byCabang.map((item) => (
                            <tr key={item.cabang_id || item.nama_cabang}>
                              <td>
                                <div className="project-cell">
                                  <strong>{item.nama_cabang}</strong>
                                  <span>{item.kode_seg23}</span>
                                </div>
                              </td>
                              <td>{item.total_proyek}</td>
                              <td>{formatIDR(item.total_nilai_proyek, { short: true })}</td>
                              <td>{formatPercent(item.rata_margin_rab)}</td>
                              <td>{formatPercent(item.rata_margin_realisasi)}</td>
                              <td>{item.jumlah_kritis_rugi}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>
              </section>

              <Card className="section-card">
                <div className="section-title-row">
                  <div>
                    <h2>Tabel proyek</h2>
                    <p>{projects.length} proyek tampil</p>
                  </div>
                </div>
                {projects.length === 0 ? (
                  <EmptyState title="Belum ada proyek" description="Belum ada proyek sesuai filter." />
                ) : (
                  <div className="table-scroll modern-table">
                    <table className="data-table proyek-table dashboard-project-table">
                      <thead>
                        <tr>
                          <th>Nama Proyek</th>
                          <th>Segmen 11</th>
                          <th>Cabang</th>
                          <th>Nilai</th>
                          <th>Total RAB</th>
                          <th>Margin RAB</th>
                          <th>Total Realisasi</th>
                          <th>Margin Realisasi</th>
                          <th>Delta</th>
                          <th>Status Margin</th>
                          <th>Status Proyek</th>
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
                                  <Link className="action-link ghost" to={`/proyek/${project.id}/detail`}>Lihat detail</Link>
                                </div>
                              </td>
                              <td><code>{project.seg11_no || '-'}</code></td>
                              <td>
                                <div className="project-cell">
                                  <strong>{project.cabang?.nama || '-'}</strong>
                                  <span>{project.cabang?.kode_seg23 || '-'}</span>
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

export default Dashboard
