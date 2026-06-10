import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { kursAPI, masterAPI } from '../services/api'

const MASTER_TABS = [
  { key: 'coa', label: 'COA' },
  { key: 'cabang', label: 'Cabang' },
  { key: 'user', label: 'User' },
  { key: 'kurs', label: 'Kurs' }
]

const ROLE_OPTIONS = [
  { value: 'pm', label: 'Project Manager (PM)' },
  { value: 'kepala_divre', label: 'Kepala Divre' },
  { value: 'admin', label: 'Admin / Staff RAB' }
]

const INITIAL_USER_FORM = {
  nama: '',
  email: '',
  password: '',
  role: 'pm',
  cabang_id: '',
  aktif: true
}

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
  const [branches, setBranches] = useState([])
  const [latestKurs, setLatestKurs] = useState(null)
  const [userForm, setUserForm] = useState(INITIAL_USER_FORM)
  const [savingUser, setSavingUser] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

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
          const [userResponse, branchResponse] = await Promise.all([
            masterAPI.getUsers(),
            masterAPI.getCabang()
          ])
          if (!ignore) {
            setRows(userResponse.data.data || [])
            setBranches(branchResponse.data.data || [])
          }
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

  function updateUserForm(name, value) {
    setUserForm((current) => {
      const next = { ...current, [name]: value }

      if (name === 'role' && value !== 'pm') {
        next.cabang_id = ''
      }

      return next
    })
  }

  async function reloadUsers() {
    const response = await masterAPI.getUsers()
    setRows(response.data.data || [])
  }

  async function handleCreateUser(event) {
    event.preventDefault()
    setError('')
    setSuccessMessage('')

    if (userForm.role === 'pm' && !userForm.cabang_id) {
      setError('Pilih cabang untuk user PM')
      return
    }

    setSavingUser(true)

    try {
      const payload = {
        ...userForm,
        cabang_id: userForm.role === 'pm' ? userForm.cabang_id : null
      }

      await masterAPI.createUser(payload)
      setUserForm(INITIAL_USER_FORM)
      setSuccessMessage('User berhasil ditambahkan')
      await reloadUsers()
    } catch (createError) {
      setError(createError.response?.data?.error?.message || 'Gagal menambahkan user')
    } finally {
      setSavingUser(false)
    }
  }

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
          {!loading && successMessage && <p className="success-message">{successMessage}</p>}
          {!loading && !error && activeTab === 'coa' && <CoaTable rows={rows} />}
          {!loading && !error && activeTab === 'cabang' && <CabangTable rows={rows} />}
          {!loading && activeTab === 'user' && (
            <>
              <form className="proyek-form master-user-form" onSubmit={handleCreateUser}>
                <fieldset disabled={savingUser}>
                  <legend>Tambah user baru</legend>

                  <label>
                    Nama
                    <input value={userForm.nama} onChange={(event) => updateUserForm('nama', event.target.value)} required />
                  </label>

                  <label>
                    Email
                    <input type="email" value={userForm.email} onChange={(event) => updateUserForm('email', event.target.value)} required />
                  </label>

                  <label>
                    Password sementara
                    <input type="password" value={userForm.password} onChange={(event) => updateUserForm('password', event.target.value)} required />
                  </label>

                  <label>
                    Role
                    <select value={userForm.role} onChange={(event) => updateUserForm('role', event.target.value)} required>
                      {ROLE_OPTIONS.map((role) => (
                        <option key={role.value} value={role.value}>{role.label}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Cabang / Unit PM
                    <select
                      value={userForm.cabang_id}
                      onChange={(event) => updateUserForm('cabang_id', event.target.value)}
                      disabled={userForm.role !== 'pm'}
                      required={userForm.role === 'pm'}
                    >
                      <option value="">{userForm.role === 'pm' ? 'Pilih cabang untuk PM' : 'Tidak dipakai untuk role ini'}</option>
                      {branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.kode_seg23} — {branch.nama}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Status
                    <select value={userForm.aktif ? 'true' : 'false'} onChange={(event) => updateUserForm('aktif', event.target.value === 'true')}>
                      <option value="true">Aktif</option>
                      <option value="false">Nonaktif</option>
                    </select>
                  </label>
                </fieldset>

                <div className="form-actions">
                  <button type="submit" disabled={savingUser}>{savingUser ? 'Menyimpan...' : 'Tambah user'}</button>
                </div>
              </form>

              <UserTable rows={rows} />
            </>
          )}
          {!loading && !error && activeTab === 'kurs' && <KursTable latest={latestKurs} history={rows} />}
        </div>
      </section>
    </main>
  )
}

export default MasterData
