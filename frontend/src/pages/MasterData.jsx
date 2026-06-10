import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { kursAPI, masterAPI } from '../services/api'

const MASTER_TABS = [
  { key: 'coa', label: 'COA' },
  { key: 'cabang', label: 'Cabang' },
  { key: 'user', label: 'User' },
  { key: 'kurs', label: 'Kurs' }
]

function getErrorMessage(error) {
  return error.response?.data?.error?.message || 'Data master gagal dimuat'
}

function EmptyState() {
  return <p className="muted master-empty">Belum ada data untuk ditampilkan.</p>
}

function CoaTable({ rows }) {
  if (!rows.length) return <EmptyState />

  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th>Kode Seg 5</th>
            <th>Nama</th>
            <th>Seg 4 Default</th>
            <th>Kategori</th>
            <th>Tipe</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => (
            <tr key={item.kode_seg5}>
              <td><code>{item.kode_seg5}</code></td>
              <td>{item.nama}</td>
              <td>{item.seg4_default || '-'}</td>
              <td>{item.kategori_rab || '-'}</td>
              <td>{item.tipe_fv || '-'}</td>
              <td>{item.aktif ? 'Aktif' : 'Nonaktif'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CabangTable({ rows }) {
  if (!rows.length) return <EmptyState />

  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th>Kode Seg 2&3</th>
            <th>Nama</th>
            <th>Tipe</th>
            <th>Parent ID</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => (
            <tr key={item.id}>
              <td><code>{item.kode_seg23}</code></td>
              <td>{item.nama}</td>
              <td>{item.tipe}</td>
              <td>{item.parent_id || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function UserTable({ rows }) {
  if (!rows.length) return <EmptyState />

  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th>Nama</th>
            <th>Email</th>
            <th>Role</th>
            <th>Cabang ID</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => (
            <tr key={item.id}>
              <td>{item.nama}</td>
              <td>{item.email}</td>
              <td>{item.role}</td>
              <td>{item.cabang_id || '-'}</td>
              <td>{item.aktif ? 'Aktif' : 'Nonaktif'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function KursTable({ latest, history }) {
  if (!history.length) return <EmptyState />

  return (
    <>
      {latest && (
        <div className="master-summary">
          <span>Kurs terbaru</span>
          <strong>USD {Number(latest.kurs_idr).toLocaleString('id-ID')} IDR</strong>
          <span>Berlaku mulai {latest.berlaku_mulai}</span>
        </div>
      )}
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Mata Uang</th>
              <th>Kurs IDR</th>
              <th>Berlaku Mulai</th>
              <th>Dibuat Oleh</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr key={item.id}>
                <td>{item.mata_uang}</td>
                <td>{Number(item.kurs_idr).toLocaleString('id-ID')}</td>
                <td>{item.berlaku_mulai}</td>
                <td>{item.dibuat_oleh || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

function MasterData() {
  const [activeTab, setActiveTab] = useState('coa')
  const [rows, setRows] = useState([])
  const [latestKurs, setLatestKurs] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const title = useMemo(() => {
    const tab = MASTER_TABS.find((item) => item.key === activeTab)
    return tab?.label || 'Master Data'
  }, [activeTab])

  useEffect(() => {
    let ignore = false

    async function loadMasterData() {
      setLoading(true)
      setError('')

      try {
        if (activeTab === 'coa') {
          const response = await masterAPI.getCoa()
          if (!ignore) setRows(response.data.data || [])
        }

        if (activeTab === 'cabang') {
          const response = await masterAPI.getCabang()
          if (!ignore) setRows(response.data.data || [])
        }

        if (activeTab === 'user') {
          const response = await masterAPI.getUsers()
          if (!ignore) setRows(response.data.data || [])
        }

        if (activeTab === 'kurs') {
          const response = await kursAPI.getKurs()
          if (!ignore) {
            setLatestKurs(response.data.data?.latest || null)
            setRows(response.data.data?.history || [])
          }
        }
      } catch (fetchError) {
        if (!ignore) {
          setRows([])
          setLatestKurs(null)
          setError(getErrorMessage(fetchError))
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    loadMasterData()

    return () => {
      ignore = true
    }
  }, [activeTab])

  return (
    <main className="app-shell master-shell">
      <section className="panel master-panel">
        <div className="master-header">
          <div>
            <p className="eyebrow">Phase 1D</p>
            <h1>Master Data</h1>
            <p className="muted">
              Halaman admin sederhana untuk melihat COA 2025, cabang, user, dan kurs.
            </p>
          </div>
          <Link to="/">Kembali</Link>
        </div>

        <div className="master-tabs" role="tablist" aria-label="Master data">
          {MASTER_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={tab.key === activeTab ? 'active' : ''}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="master-content">
          <div className="master-content-header">
            <h2>{title}</h2>
            <span>{rows.length} data</span>
          </div>

          {loading && <p className="muted master-empty">Memuat data...</p>}
          {!loading && error && <p className="error-message">{error}</p>}
          {!loading && !error && activeTab === 'coa' && <CoaTable rows={rows} />}
          {!loading && !error && activeTab === 'cabang' && <CabangTable rows={rows} />}
          {!loading && !error && activeTab === 'user' && <UserTable rows={rows} />}
          {!loading && !error && activeTab === 'kurs' && <KursTable latest={latestKurs} history={rows} />}
        </div>
      </section>
    </main>
  )
}

export default MasterData
