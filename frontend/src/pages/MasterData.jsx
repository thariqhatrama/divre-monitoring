import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Select from '../components/ui/Select'
import { masterAPI } from '../services/api'

const MASTER_TABS = [
  { key: 'coa', label: 'COA' },
  { key: 'cabang', label: 'Cabang' },
  { key: 'user', label: 'User' }
]

const MASTER_TAB_KEYS = MASTER_TABS.map((item) => item.key)
const KATEGORI_RAB = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']
const TIPE_FV = ['F', 'V']
const BRANCH_TYPES = [
  { value: 'cabang', label: 'Cabang' },
  { value: 'unit_pelayanan', label: 'Unit Pelayanan' }
]

const ROLE_OPTIONS = [
  { value: 'pm', label: 'Project Manager (PM)' },
  { value: 'kepala_divre', label: 'Kepala Divre' },
  { value: 'admin', label: 'Admin / Staff RAB' }
]

const INITIAL_COA_FORM = {
  kode_seg5: '',
  nama: '',
  seg4_default: '',
  kategori_rab: 'I',
  tipe_fv: 'V',
  aktif: true
}

const INITIAL_CABANG_FORM = {
  kode_seg23: '',
  nama: '',
  tipe: 'cabang',
  parent_id: '',
  aktif: true
}

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

function PencilIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" focusable="false">
      <path d="M11.7 4.2 15.8 8.3" />
      <path d="M13.5 2.4a1.9 1.9 0 0 1 2.7 2.7L6.9 14.4 3.5 15.5l1.1-3.4 8.9-9.7Z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" focusable="false">
      <path d="M3.5 5.5h13" />
      <path d="M8 5.5V4a1.5 1.5 0 0 1 1.5-1.5h1A1.5 1.5 0 0 1 12 4v1.5" />
      <path d="M6 5.5l.7 10.2A2 2 0 0 0 8.7 17.5h2.6a2 2 0 0 0 2-1.8L14 5.5" />
      <path d="M8.7 8.5v5" />
      <path d="M11.3 8.5v5" />
    </svg>
  )
}

function RestoreIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" focusable="false">
      <path d="M5.5 7.5A5.5 5.5 0 1 1 7 15" />
      <path d="M5.5 3.5v4h4" />
    </svg>
  )
}

function ActionButtons({ item, onEdit, onToggle, active = item.aktif !== false }) {
  return (
    <div className="table-actions icon-actions">
      <button className="icon-action-button edit" type="button" onClick={() => onEdit(item)} title="Edit" aria-label="Edit data">
        <PencilIcon />
      </button>
      <button className={`icon-action-button ${active ? 'delete' : 'restore'}`} type="button" onClick={() => onToggle(item)} title={active ? 'Delete' : 'Restore'} aria-label={active ? 'Delete data' : 'Restore data'}>
        {active ? <TrashIcon /> : <RestoreIcon />}
      </button>
    </div>
  )
}

function CoaTable({ rows, onEdit, onToggle }) {
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
            <th>Aksi</th>
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
              <td>{item.aktif ? 'Aktif' : 'Delete'}</td>
              <td><ActionButtons item={item} onEdit={onEdit} onToggle={onToggle} active={item.aktif} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function formatBranchName(branch) {
  if (!branch) return '-'
  return `${branch.kode_seg23} — ${branch.nama}`
}

function CabangTable({ rows, onEdit, onToggle, branchById = {} }) {
  if (!rows.length) return <EmptyState />

  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th>Kode Seg 2&3</th>
            <th>Nama</th>
            <th>Tipe</th>
            <th>Parent Cabang</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => (
            <tr key={item.id}>
              <td><code>{item.kode_seg23}</code></td>
              <td>{item.nama}</td>
              <td>{item.tipe}</td>
              <td>{formatBranchName(branchById[item.parent_id])}</td>
              <td>{item.aktif === false ? 'Delete' : 'Aktif'}</td>
              <td><ActionButtons item={item} onEdit={onEdit} onToggle={onToggle} active={item.aktif !== false} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function UserTable({ rows, onEdit, onToggle }) {
  if (!rows.length) return <EmptyState />

  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th>Nama</th>
            <th>Email</th>
            <th>Role</th>
            <th>Cabang</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => (
            <tr key={item.id}>
              <td>{item.nama}</td>
              <td>{item.email}</td>
              <td>{item.role}</td>
              <td>{formatBranchName(item.cabang)}</td>
              <td>{item.aktif ? 'Aktif' : 'Delete'}</td>
              <td><ActionButtons item={item} onEdit={onEdit} onToggle={onToggle} active={item.aktif} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MasterData() {
  const navigate = useNavigate()
  const { tab } = useParams()
  const activeTab = MASTER_TAB_KEYS.includes(tab) ? tab : 'coa'
  const [rows, setRows] = useState([])
  const [branches, setBranches] = useState([])
  const [coaForm, setCoaForm] = useState(INITIAL_COA_FORM)
  const [cabangForm, setCabangForm] = useState(INITIAL_CABANG_FORM)
  const [userForm, setUserForm] = useState(INITIAL_USER_FORM)
  const [editingCoa, setEditingCoa] = useState(null)
  const [editingCabang, setEditingCabang] = useState(null)
  const [editingUser, setEditingUser] = useState(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const title = useMemo(() => {
    const tab = MASTER_TABS.find((item) => item.key === activeTab)
    return tab?.label || 'Master Data'
  }, [activeTab])

  const branchOptions = activeTab === 'cabang' ? rows : branches
  const branchById = useMemo(() => Object.fromEntries(
    branchOptions.map((branch) => [branch.id, branch])
  ), [branchOptions])

  useEffect(() => {
    if (tab && !MASTER_TAB_KEYS.includes(tab)) {
      navigate('/master-data/coa', { replace: true })
    }
  }, [navigate, tab])

  async function loadMasterData() {
    setLoading(true)
    setError('')

    try {
      if (activeTab === 'coa') {
        const response = await masterAPI.getCoa()
        setRows(response.data.data || [])
      }

      if (activeTab === 'cabang') {
        const response = await masterAPI.getCabang()
        const branchRows = response.data.data || []
        setRows(branchRows)
        setBranches(branchRows)
      }

      if (activeTab === 'user') {
        const [userResponse, branchResponse] = await Promise.all([
          masterAPI.getUsers(),
          masterAPI.getCabang()
        ])
        setRows(userResponse.data.data || [])
        setBranches(branchResponse.data.data || [])
      }
    } catch (fetchError) {
      setRows([])
      setError(getErrorMessage(fetchError))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMasterData()
    setSuccessMessage('')
    setError('')
  }, [activeTab])

  function updateCoaForm(name, value) {
    setCoaForm((current) => ({ ...current, [name]: value }))
  }

  function updateCabangForm(name, value) {
    setCabangForm((current) => ({ ...current, [name]: value }))
  }

  function updateUserForm(name, value) {
    setUserForm((current) => {
      const next = { ...current, [name]: value }
      if (name === 'role' && value !== 'pm') next.cabang_id = ''
      return next
    })
  }

  function resetCoaForm() {
    setCoaForm(INITIAL_COA_FORM)
    setEditingCoa(null)
  }

  function resetCabangForm() {
    setCabangForm(INITIAL_CABANG_FORM)
    setEditingCabang(null)
  }

  function resetUserForm() {
    setUserForm(INITIAL_USER_FORM)
    setEditingUser(null)
  }

  async function handleSaveCoa(event) {
    event.preventDefault()
    setError('')
    setSuccessMessage('')
    setSaving(true)

    try {
      const payload = {
        ...coaForm,
        kode_seg5: coaForm.kode_seg5.trim(),
        nama: coaForm.nama.trim(),
        seg4_default: coaForm.seg4_default.trim() || null
      }

      if (editingCoa) {
        const { kode_seg5, ...updatePayload } = payload
        await masterAPI.updateCoa(editingCoa.kode_seg5, updatePayload)
        setSuccessMessage('COA berhasil diperbarui')
      } else {
        await masterAPI.createCoa(payload)
        setSuccessMessage('COA berhasil ditambahkan')
      }

      resetCoaForm()
      await loadMasterData()
    } catch (saveError) {
      setError(saveError.response?.data?.error?.message || 'Gagal menyimpan COA')
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveCabang(event) {
    event.preventDefault()
    setError('')
    setSuccessMessage('')
    setSaving(true)

    try {
      const payload = {
        ...cabangForm,
        kode_seg23: cabangForm.kode_seg23.trim(),
        nama: cabangForm.nama.trim(),
        parent_id: cabangForm.parent_id.trim() || null
      }

      if (editingCabang) {
        await masterAPI.updateCabang(editingCabang.id, payload)
        setSuccessMessage('Cabang berhasil diperbarui')
      } else {
        await masterAPI.createCabang(payload)
        setSuccessMessage('Cabang berhasil ditambahkan')
      }

      resetCabangForm()
      await loadMasterData()
    } catch (saveError) {
      setError(saveError.response?.data?.error?.message || 'Gagal menyimpan cabang')
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveUser(event) {
    event.preventDefault()
    setError('')
    setSuccessMessage('')

    if (userForm.role === 'pm' && !userForm.cabang_id) {
      setError('Pilih cabang untuk user PM')
      return
    }

    setSaving(true)

    try {
      const payload = {
        nama: userForm.nama.trim(),
        email: userForm.email.trim().toLowerCase(),
        role: userForm.role,
        cabang_id: userForm.role === 'pm' ? userForm.cabang_id : null,
        aktif: userForm.aktif
      }

      if (!editingUser || userForm.password.trim()) {
        payload.password = userForm.password
      }

      if (editingUser) {
        await masterAPI.updateUser(editingUser.id, payload)
        setSuccessMessage('User berhasil diperbarui')
      } else {
        await masterAPI.createUser(payload)
        setSuccessMessage('User berhasil ditambahkan')
      }

      resetUserForm()
      await loadMasterData()
    } catch (saveError) {
      setError(saveError.response?.data?.error?.message || 'Gagal menyimpan user')
    } finally {
      setSaving(false)
    }
  }

  function editCoa(item) {
    setEditingCoa(item)
    setCoaForm({
      kode_seg5: item.kode_seg5 || '',
      nama: item.nama || '',
      seg4_default: item.seg4_default || '',
      kategori_rab: item.kategori_rab || 'I',
      tipe_fv: item.tipe_fv || 'V',
      aktif: item.aktif !== false
    })
    setSuccessMessage('')
    setError('')
  }

  function editCabang(item) {
    setEditingCabang(item)
    setCabangForm({
      kode_seg23: item.kode_seg23 || '',
      nama: item.nama || '',
      tipe: item.tipe || 'cabang',
      parent_id: item.parent_id || '',
      aktif: item.aktif !== false
    })
    setSuccessMessage('')
    setError('')
  }

  function editUser(item) {
    setEditingUser(item)
    setUserForm({
      nama: item.nama || '',
      email: item.email || '',
      password: '',
      role: item.role || 'pm',
      cabang_id: item.cabang_id || '',
      aktif: item.aktif !== false
    })
    setSuccessMessage('')
    setError('')
  }

  async function toggleCoa(item) {
    const nextActive = !item.aktif
    if (!window.confirm(`${nextActive ? 'Restore' : 'Delete'} COA ${item.kode_seg5}? Data historis tidak akan dihapus permanen.`)) return
    await masterAPI.updateCoa(item.kode_seg5, { aktif: nextActive })
    setSuccessMessage(`COA berhasil ${nextActive ? 'direstore' : 'ditandai delete'}`)
    await loadMasterData()
  }

  async function toggleCabang(item) {
    const currentActive = item.aktif !== false
    const nextActive = !currentActive
    if (!window.confirm(`${nextActive ? 'Restore' : 'Delete'} cabang ${item.nama}? Data historis tidak akan dihapus permanen.`)) return
    await masterAPI.updateCabang(item.id, { aktif: nextActive })
    setSuccessMessage(`Cabang berhasil ${nextActive ? 'direstore' : 'ditandai delete'}`)
    await loadMasterData()
  }

  async function toggleUser(item) {
    const nextActive = !item.aktif
    if (!window.confirm(`${nextActive ? 'Restore' : 'Delete'} user ${item.email}?`)) return
    await masterAPI.updateUser(item.id, { aktif: nextActive })
    setSuccessMessage(`User berhasil ${nextActive ? 'direstore' : 'ditandai delete'}`)
    await loadMasterData()
  }

  return (
    <main className="app-shell master-shell">
      <section className="panel master-panel">
        <div className="master-header">
          <div>
            <p className="eyebrow">Administrasi</p>
            <h1>Master Data</h1>
            <p className="muted">Kelola data COA 2025, cabang, dan user aplikasi. Delete bersifat soft delete agar riwayat data tetap aman.</p>
          </div>
          <Link to="/">Kembali</Link>
        </div>

        <div className="master-tabs" role="tablist" aria-label="Master data">
          {MASTER_TABS.map((tabItem) => (
            <button
              key={tabItem.key}
              type="button"
              className={tabItem.key === activeTab ? 'active' : ''}
              onClick={() => navigate(`/master-data/${tabItem.key}`)}
            >
              {tabItem.label}
            </button>
          ))}
        </div>

        <div className="master-content">
          <div className="master-content-header">
            <h2>{title}</h2>
            <span>{rows.length} data</span>
          </div>

          {activeTab === 'coa' && (
            <form className="proyek-form master-user-form" onSubmit={handleSaveCoa}>
              <fieldset disabled={saving}>
                <legend>{editingCoa ? 'Edit COA' : 'Tambah COA'}</legend>
                <label>Kode Seg 5<input value={coaForm.kode_seg5} onChange={(event) => updateCoaForm('kode_seg5', event.target.value)} disabled={Boolean(editingCoa)} required /></label>
                <label>Nama<input value={coaForm.nama} onChange={(event) => updateCoaForm('nama', event.target.value)} required /></label>
                <label>Seg 4 Default<input value={coaForm.seg4_default} onChange={(event) => updateCoaForm('seg4_default', event.target.value)} /></label>
                <Select label="Kategori" value={coaForm.kategori_rab} onChange={(event) => updateCoaForm('kategori_rab', event.target.value)}>{KATEGORI_RAB.map((item) => <option key={item} value={item}>{item}</option>)}</Select>
                <Select label="Tipe" value={coaForm.tipe_fv} onChange={(event) => updateCoaForm('tipe_fv', event.target.value)}>{TIPE_FV.map((item) => <option key={item} value={item}>{item}</option>)}</Select>
                <Select label="Status" value={coaForm.aktif ? 'true' : 'false'} onChange={(event) => updateCoaForm('aktif', event.target.value === 'true')}><option value="true">Aktif</option><option value="false">Delete</option></Select>
              </fieldset>
              <div className="form-actions">
                <button type="submit" disabled={saving}>{saving ? 'Menyimpan...' : editingCoa ? 'Simpan perubahan' : 'Tambah COA'}</button>
                {editingCoa ? <button type="button" onClick={resetCoaForm}>Batal edit</button> : null}
              </div>
            </form>
          )}

          {activeTab === 'cabang' && (
            <form className="proyek-form master-user-form" onSubmit={handleSaveCabang}>
              <fieldset disabled={saving}>
                <legend>{editingCabang ? 'Edit cabang' : 'Tambah cabang'}</legend>
                <label>Kode Seg 2&3<input value={cabangForm.kode_seg23} onChange={(event) => updateCabangForm('kode_seg23', event.target.value)} required /></label>
                <label>Nama<input value={cabangForm.nama} onChange={(event) => updateCabangForm('nama', event.target.value)} required /></label>
                <Select label="Tipe" value={cabangForm.tipe} onChange={(event) => updateCabangForm('tipe', event.target.value)}>{BRANCH_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</Select>
                <Select label="Parent Cabang" value={cabangForm.parent_id} onChange={(event) => updateCabangForm('parent_id', event.target.value)}><option value="">Tidak ada parent</option>{branches.filter((branch) => branch.id !== editingCabang?.id).map((branch) => <option key={branch.id} value={branch.id}>{branch.kode_seg23} — {branch.nama}</option>)}</Select>
                <Select label="Status" value={cabangForm.aktif ? 'true' : 'false'} onChange={(event) => updateCabangForm('aktif', event.target.value === 'true')}><option value="true">Aktif</option><option value="false">Delete</option></Select>
              </fieldset>
              <div className="form-actions">
                <button type="submit" disabled={saving}>{saving ? 'Menyimpan...' : editingCabang ? 'Simpan perubahan' : 'Tambah cabang'}</button>
                {editingCabang ? <button type="button" onClick={resetCabangForm}>Batal edit</button> : null}
              </div>
            </form>
          )}

          {activeTab === 'user' && (
            <form className="proyek-form master-user-form" onSubmit={handleSaveUser}>
              <fieldset disabled={saving}>
                <legend>{editingUser ? 'Edit user' : 'Tambah user baru'}</legend>
                <label>Nama<input value={userForm.nama} onChange={(event) => updateUserForm('nama', event.target.value)} required /></label>
                <label>Email<input type="email" value={userForm.email} onChange={(event) => updateUserForm('email', event.target.value)} required /></label>
                <label>{editingUser ? 'Password baru (opsional)' : 'Password sementara'}<input type="password" value={userForm.password} onChange={(event) => updateUserForm('password', event.target.value)} required={!editingUser} /></label>
                <Select label="Role" value={userForm.role} onChange={(event) => updateUserForm('role', event.target.value)} required>{ROLE_OPTIONS.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}</Select>
                <Select label="Cabang / Unit PM" value={userForm.cabang_id} onChange={(event) => updateUserForm('cabang_id', event.target.value)} disabled={userForm.role !== 'pm'} required={userForm.role === 'pm'}><option value="">{userForm.role === 'pm' ? 'Pilih cabang untuk PM' : 'Tidak dipakai untuk role ini'}</option>{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.kode_seg23} — {branch.nama}</option>)}</Select>
                <Select label="Status" value={userForm.aktif ? 'true' : 'false'} onChange={(event) => updateUserForm('aktif', event.target.value === 'true')}><option value="true">Aktif</option><option value="false">Delete</option></Select>
              </fieldset>
              <div className="form-actions">
                <button type="submit" disabled={saving}>{saving ? 'Menyimpan...' : editingUser ? 'Simpan perubahan' : 'Tambah user'}</button>
                {editingUser ? <button type="button" onClick={resetUserForm}>Batal edit</button> : null}
              </div>
            </form>
          )}

          {loading && <p className="muted master-empty">Memuat data...</p>}
          {!loading && error && <p className="error-message">{error}</p>}
          {!loading && successMessage && <p className="success-message">{successMessage}</p>}
          {!loading && !error && activeTab === 'coa' && <CoaTable rows={rows} onEdit={editCoa} onToggle={toggleCoa} />}
          {!loading && !error && activeTab === 'cabang' && <CabangTable rows={rows} onEdit={editCabang} onToggle={toggleCabang} branchById={branchById} />}
          {!loading && !error && activeTab === 'user' && <UserTable rows={rows} onEdit={editUser} onToggle={toggleUser} />}
        </div>
      </section>
    </main>
  )
}

export default MasterData
