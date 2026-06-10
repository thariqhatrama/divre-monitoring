import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import MarginCard from '../components/MarginCard'
import useAuth from '../hooks/useAuth'
import { kursAPI, realisasiAPI } from '../services/api'
import { calculateLineTotalIdr, normalizeKurs } from '../utils/currencyConvert'
import { formatIDR, formatPercent } from '../utils/formatIDR'

const INITIAL_FORM = {
  rab_item_id: '',
  tanggal_realisasi: '',
  qty: '1',
  satuan: '',
  mata_uang: 'IDR',
  harga_satuan: '',
  kurs_idr: '1',
  catatan: ''
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10)
}

function RealisasiForm() {
  const { id } = useParams()
  const { user } = useAuth()
  const [project, setProject] = useState(null)
  const [rabItems, setRabItems] = useState([])
  const [items, setItems] = useState([])
  const [totalsByRabItem, setTotalsByRabItem] = useState({})
  const [totalsByAccount, setTotalsByAccount] = useState([])
  const [totalRealisasi, setTotalRealisasi] = useState(0)
  const [marginRealisasi, setMarginRealisasi] = useState(null)
  const [form, setForm] = useState({ ...INITIAL_FORM, tanggal_realisasi: todayIsoDate() })
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const canMutate = user?.role === 'admin' || user?.role === 'pm'
  const selectedRabItem = useMemo(
    () => rabItems.find((item) => item.id === form.rab_item_id),
    [form.rab_item_id, rabItems]
  )
  const totalPreview = useMemo(() => calculateLineTotalIdr(form), [form])

  async function loadRealisasi() {
    setLoading(true)
    setError('')

    try {
      const response = await realisasiAPI.getRealisasi(id)
      const data = response.data.data
      setProject(data.project)
      setRabItems(data.rab_items || [])
      setItems(data.items || [])
      setTotalsByRabItem(data.totals_by_rab_item || {})
      setTotalsByAccount(data.totals_by_account || [])
      setTotalRealisasi(data.total_realisasi_idr || 0)
      setMarginRealisasi(data.margin_realisasi || null)
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Gagal memuat realisasi proyek')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRealisasi()
  }, [id])

  useEffect(() => {
    if (form.mata_uang === 'USD' && !normalizeKurs(form.mata_uang, form.kurs_idr)) {
      fillLatestKurs()
    }
  }, [form.mata_uang])

  function updateField(name, value) {
    setForm((current) => {
      const next = { ...current, [name]: value }

      if (name === 'mata_uang' && value === 'IDR') {
        next.kurs_idr = '1'
      }

      if (name === 'rab_item_id') {
        const rabItem = rabItems.find((item) => item.id === value)
        if (rabItem) {
          next.satuan = rabItem.satuan || next.satuan
          next.mata_uang = rabItem.mata_uang || 'IDR'
          next.kurs_idr = rabItem.mata_uang === 'IDR' ? '1' : String(rabItem.kurs_idr || next.kurs_idr || '1')
        }
      }

      return next
    })
  }

  async function fillLatestKurs() {
    try {
      const response = await kursAPI.getKurs({ mata_uang: 'USD' })
      const kurs = response.data.data?.latest?.kurs_idr || response.data.data?.history?.[0]?.kurs_idr
      if (kurs) {
        updateField('kurs_idr', String(kurs))
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Gagal mengambil kurs terbaru')
    }
  }

  function resetForm() {
    setForm({ ...INITIAL_FORM, tanggal_realisasi: todayIsoDate() })
    setEditingId(null)
  }

  function buildPayload() {
    return {
      tanggal_realisasi: form.tanggal_realisasi,
      qty: Number(form.qty || 0),
      satuan: form.satuan,
      mata_uang: form.mata_uang,
      harga_satuan: Number(form.harga_satuan || 0),
      kurs_idr: form.mata_uang === 'IDR' ? 1 : Number(form.kurs_idr || 1),
      catatan: form.catatan
    }
  }

  function validateSubmit() {
    if (!editingId && !form.rab_item_id) {
      setError('Pilih item RAB terlebih dahulu')
      return false
    }

    if (form.mata_uang === 'USD' && !normalizeKurs(form.mata_uang, form.kurs_idr)) {
      setError('Kurs IDR wajib diisi dengan integer > 1 untuk mata uang USD')
      return false
    }

    return true
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!validateSubmit()) return

    setSaving(true)

    try {
      if (editingId) {
        await realisasiAPI.updateRealisasi(editingId, buildPayload())
      } else {
        await realisasiAPI.createRealisasi(form.rab_item_id, buildPayload())
      }

      resetForm()
      await loadRealisasi()
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Gagal menyimpan realisasi')
    } finally {
      setSaving(false)
    }
  }

  function handleEdit(item) {
    setEditingId(item.id)
    setForm({
      rab_item_id: item.rab_item_id,
      tanggal_realisasi: item.tanggal_realisasi || todayIsoDate(),
      qty: String(item.qty ?? '0'),
      satuan: item.satuan || '',
      mata_uang: item.mata_uang || 'IDR',
      harga_satuan: String(item.harga_satuan ?? '0'),
      kurs_idr: String(item.kurs_idr ?? '1'),
      catatan: item.catatan || ''
    })
  }

  async function handleDelete(item) {
    const confirmed = window.confirm(`Hapus realisasi tanggal ${item.tanggal_realisasi}?`)
    if (!confirmed) return

    setSaving(true)
    setError('')

    try {
      await realisasiAPI.deleteRealisasi(item.id)
      await loadRealisasi()
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Gagal menghapus realisasi')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="app-shell">
        <section className="panel">
          <p className="master-empty">Memuat realisasi proyek...</p>
        </section>
      </main>
    )
  }

  return (
    <main className="app-shell master-shell">
      <section className="panel master-panel proyek-panel">
        <header className="master-header">
          <div>
            <p className="eyebrow">Phase 2C</p>
            <h1>Realisasi per Akun</h1>
            <p className="muted">{project?.nama || 'Proyek tidak ditemukan'}</p>
          </div>
          <div className="actions">
            <Link to="/proyek">Kembali ke proyek</Link>
            {project ? <Link to={`/proyek/${project.id}/rab`}>Kembali ke RAB</Link> : null}
          </div>
        </header>

        <div className="margin-grid">
          <MarginCard
            title="Total Realisasi"
            amount={totalRealisasi}
            percent={marginRealisasi?.margin_persen}
            status={marginRealisasi?.status_margin}
            description={`Delta vs RAB ${formatPercent(marginRealisasi?.delta_margin)}`}
          />
          <MarginCard
            title="Margin RAB"
            amount={marginRealisasi?.margin_rab?.margin_idr}
            percent={marginRealisasi?.margin_rab?.margin_persen}
            status={marginRealisasi?.margin_rab?.status_margin}
            description={`Nilai proyek ${formatIDR(marginRealisasi?.nilai_proyek_idr ?? project?.nilai_proyek)}`}
          />
        </div>

        {error ? <p className="error-message">{error}</p> : null}

        {canMutate ? (
          <form className="proyek-form" onSubmit={handleSubmit}>
            <fieldset disabled={saving}>
              <legend>{editingId ? 'Edit transaksi realisasi' : 'Tambah transaksi realisasi'}</legend>

              <label>
                Item RAB
                <select value={form.rab_item_id} onChange={(event) => updateField('rab_item_id', event.target.value)} disabled={Boolean(editingId)} required>
                  <option value="">Pilih item RAB</option>
                  {rabItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.kode_akun_seg5} — {item.uraian} ({formatIDR(item.total_idr)})
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Tanggal realisasi
                <input type="date" value={form.tanggal_realisasi} onChange={(event) => updateField('tanggal_realisasi', event.target.value)} required />
              </label>

              <label>
                Qty
                <input type="number" min="0" step="0.01" value={form.qty} onChange={(event) => updateField('qty', event.target.value)} required />
              </label>

              <label>
                Satuan
                <input value={form.satuan} onChange={(event) => updateField('satuan', event.target.value)} />
              </label>

              <label>
                Mata uang
                <select value={form.mata_uang} onChange={(event) => updateField('mata_uang', event.target.value)}>
                  <option value="IDR">IDR</option>
                  <option value="USD">USD</option>
                </select>
              </label>

              <label>
                Harga satuan
                <input type="number" min="0" step="1" value={form.harga_satuan} onChange={(event) => updateField('harga_satuan', event.target.value)} required />
              </label>

              <label>
                Kurs IDR
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={form.kurs_idr}
                  onChange={(event) => updateField('kurs_idr', event.target.value)}
                  disabled={form.mata_uang === 'IDR'}
                  required
                />
              </label>

              <label>
                Catatan
                <textarea value={form.catatan} onChange={(event) => updateField('catatan', event.target.value)} rows="3" />
              </label>

              <p className="muted-inline">
                {form.mata_uang === 'IDR'
                  ? 'Input IDR dihitung langsung dengan kurs 1.'
                  : 'Kurs USD dikunci ke transaksi realisasi saat disimpan.'}
              </p>

              {form.mata_uang === 'USD' ? (
                <button type="button" onClick={fillLatestKurs}>Ambil kurs terbaru</button>
              ) : null}
            </fieldset>

            <div className="form-actions">
              <span className="total-preview">Preview total: {formatIDR(totalPreview)}</span>
              <button type="submit" disabled={saving || (!editingId && !selectedRabItem)}>
                {saving ? 'Menyimpan...' : editingId ? 'Update realisasi' : 'Tambah realisasi'}
              </button>
              {editingId ? <button type="button" onClick={resetForm}>Batal edit</button> : null}
            </div>
          </form>
        ) : (
          <p className="master-empty">Role Anda hanya dapat membaca data realisasi.</p>
        )}

        <div className="table-scroll rab-table-wrap">
          <table className="data-table proyek-table">
            <thead>
              <tr>
                <th>Akun</th>
                <th>Uraian RAB</th>
                <th>RAB</th>
                <th>Realisasi</th>
                <th>Selisih</th>
              </tr>
            </thead>
            <tbody>
              {rabItems.length === 0 ? (
                <tr>
                  <td colSpan="5">Belum ada item RAB.</td>
                </tr>
              ) : rabItems.map((item) => {
                const realisasiTotal = Number(totalsByRabItem[item.id] || 0)
                return (
                  <tr key={item.id}>
                    <td><code>{item.kode_akun_seg5}</code></td>
                    <td>{item.uraian}</td>
                    <td>{formatIDR(item.total_idr)}</td>
                    <td>{formatIDR(realisasiTotal)}</td>
                    <td>{formatIDR(Number(item.total_idr || 0) - realisasiTotal)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <h2>Riwayat Transaksi Realisasi</h2>
        <div className="table-scroll rab-table-wrap">
          <table className="data-table proyek-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Akun</th>
                <th>Qty</th>
                <th>Harga</th>
                <th>Total IDR</th>
                <th>Catatan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="7">Belum ada transaksi realisasi.</td>
                </tr>
              ) : items.map((item) => {
                const rabItem = rabItems.find((rab) => rab.id === item.rab_item_id)
                return (
                  <tr key={item.id}>
                    <td>{item.tanggal_realisasi}</td>
                    <td>
                      <code>{rabItem?.kode_akun_seg5 || '-'}</code>
                      <span>{rabItem?.uraian || 'Item RAB tidak ditemukan'}</span>
                    </td>
                    <td>{item.qty} {item.satuan || ''}</td>
                    <td>
                      {formatIDR(item.harga_satuan)}
                      <span>{item.mata_uang} · Kurs {item.kurs_idr}</span>
                    </td>
                    <td>{formatIDR(item.total_idr)}</td>
                    <td>{item.catatan || '-'}</td>
                    <td>
                      <div className="table-actions">
                        <button type="button" onClick={() => handleEdit(item)} disabled={!canMutate || saving}>Edit</button>
                        <button type="button" className="danger-button" onClick={() => handleDelete(item)} disabled={!canMutate || saving}>Hapus</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <h2>Total per Akun</h2>
        <div className="table-scroll rab-table-wrap">
          <table className="data-table proyek-table">
            <thead>
              <tr>
                <th>Akun</th>
                <th>Kategori</th>
                <th>Total RAB</th>
                <th>Total Realisasi</th>
                <th>Selisih</th>
              </tr>
            </thead>
            <tbody>
              {totalsByAccount.length === 0 ? (
                <tr>
                  <td colSpan="5">Belum ada total akun.</td>
                </tr>
              ) : totalsByAccount.map((item) => (
                <tr key={item.kode_akun_seg5}>
                  <td><code>{item.kode_akun_seg5}</code></td>
                  <td>{item.kategori || '-'}</td>
                  <td>{formatIDR(item.rab_total_idr)}</td>
                  <td>{formatIDR(item.realisasi_total_idr)}</td>
                  <td>{formatIDR(item.selisih_idr)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}

export default RealisasiForm
