import { useEffect, useMemo, useState } from 'react'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import LoadingState from '../components/ui/LoadingState'
import PageHeader from '../components/ui/PageHeader'
import Select from '../components/ui/Select'
import { auditAPI } from '../services/api'

const TABLE_OPTIONS = [
  { value: '', label: 'Semua data' },
  { value: 'rab_items', label: 'RAB' },
  { value: 'realisasi_items', label: 'Realisasi' }
]

const ACTION_OPTIONS = [
  { value: '', label: 'Semua aksi' },
  { value: 'INSERT', label: 'Tambah' },
  { value: 'UPDATE', label: 'Ubah' },
  { value: 'DELETE', label: 'Hapus' }
]

const TABLE_LABELS = {
  rab_items: 'RAB',
  realisasi_items: 'Realisasi'
}

const ACTION_LABELS = {
  INSERT: 'Tambah',
  UPDATE: 'Ubah',
  DELETE: 'Hapus'
}

function formatDateTime(value) {
  if (!value) return '-'

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value))
}

function formatJson(value) {
  if (!value) return '-'

  return JSON.stringify(value, null, 2)
}

function getSummaryValue(log) {
  const value = log.nilai_baru || log.nilai_lama || {}

  if (log.tabel === 'rab_items') {
    return value.uraian || value.kode_akun_seg5 || log.record_id
  }

  if (log.tabel === 'realisasi_items') {
    return value.catatan || value.tanggal_realisasi || log.record_id
  }

  return log.record_id
}

function AuditLog() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    tabel: '',
    aksi: ''
  })

  const params = useMemo(() => Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== '')
  ), [filters])

  useEffect(() => {
    let ignore = false

    async function loadAuditLogs() {
      setLoading(true)
      setError('')

      try {
        const response = await auditAPI.getAuditLogs(params)
        if (!ignore) setLogs(response.data.data || [])
      } catch (fetchError) {
        if (!ignore) {
          setLogs([])
          setError(fetchError.response?.data?.error?.message || 'Gagal memuat audit log')
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    loadAuditLogs()

    return () => {
      ignore = true
    }
  }, [params])

  function updateFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value }))
  }

  return (
    <main className="app-shell master-shell">
      <section className="panel master-panel proyek-panel dashboard-panel">
        <div className="page-stack">
          <PageHeader
            eyebrow="Administrasi"
            title="Audit Log"
            description="Riwayat perubahan data RAB dan realisasi. Halaman ini hanya tersedia untuk admin."
          />

          <Card className="filter-card">
            <div className="filter-card-title">
              <div>
                <h2>Filter audit</h2>
                <p>Pilih jenis data dan aksi untuk menelusuri perubahan terakhir.</p>
              </div>
            </div>
            <div className="filter-row dashboard-filter-row">
              <Select label="Data" value={filters.tabel} onChange={(event) => updateFilter('tabel', event.target.value)}>
                {TABLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Select>
              <Select label="Aksi" value={filters.aksi} onChange={(event) => updateFilter('aksi', event.target.value)}>
                {ACTION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Select>
            </div>
          </Card>

          {error ? <p className="error-message">{error}</p> : null}

          <Card className="section-card">
            <div className="section-title-row">
              <div>
                <h2>Riwayat perubahan</h2>
                <p>{logs.length} audit log tampil</p>
              </div>
            </div>

            {loading ? <LoadingState label="Memuat audit log..." /> : null}
            {!loading && !error && logs.length === 0 ? (
              <EmptyState title="Belum ada audit log" description="Perubahan RAB dan realisasi belum tercatat untuk filter ini." />
            ) : null}
            {!loading && !error && logs.length > 0 ? (
              <div className="table-scroll modern-table">
                <table className="data-table proyek-table">
                  <thead>
                    <tr>
                      <th>Waktu</th>
                      <th>Data</th>
                      <th>Aksi</th>
                      <th>Ringkasan</th>
                      <th>User</th>
                      <th>Nilai lama</th>
                      <th>Nilai baru</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id}>
                        <td>{formatDateTime(log.waktu)}</td>
                        <td>{TABLE_LABELS[log.tabel] || log.tabel}</td>
                        <td><span className={`status-pill status-${log.aksi?.toLowerCase()}`}>{ACTION_LABELS[log.aksi] || log.aksi}</span></td>
                        <td>
                          <div className="project-cell">
                            <strong>{getSummaryValue(log) || '-'}</strong>
                            <span>{log.record_id || '-'}</span>
                          </div>
                        </td>
                        <td>
                          <div className="project-cell">
                            <strong>{log.user?.nama || 'User tidak tersedia'}</strong>
                            <span>{log.user?.email || log.user_id || '-'}</span>
                          </div>
                        </td>
                        <td><pre className="audit-json">{formatJson(log.nilai_lama)}</pre></td>
                        <td><pre className="audit-json">{formatJson(log.nilai_baru)}</pre></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </Card>
        </div>
      </section>
    </main>
  )
}

export default AuditLog
