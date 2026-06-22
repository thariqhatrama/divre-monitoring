import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import MarginCard from '../components/MarginCard'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import Input from '../components/ui/Input'
import LoadingState from '../components/ui/LoadingState'
import PageHeader from '../components/ui/PageHeader'
import Select from '../components/ui/Select'
import useAuth from '../hooks/useAuth'
import { realisasiAPI } from '../services/api'
import { calculateLineTotalIdr } from '../utils/currencyConvert'
import { formatIDR, formatPercent } from '../utils/formatIDR'

const INITIAL_FORM = {
  rab_item_id: '',
  tanggal_realisasi: '',
  qty: '1',
  satuan: '',
  harga_satuan: '',
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

  function updateField(name, value) {
    setForm((current) => {
      const next = { ...current, [name]: value }

      if (name === 'rab_item_id') {
        const rabItem = rabItems.find((item) => item.id === value)
        if (rabItem) {
          next.satuan = rabItem.satuan || next.satuan
        }
      }

      return next
    })
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
      harga_satuan: Number(form.harga_satuan || 0),
      catatan: form.catatan
    }
  }

  function validateSubmit() {
    if (!editingId && !form.rab_item_id) {
      setError('Pilih item RAB terlebih dahulu')
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
      harga_satuan: String(item.harga_satuan ?? '0'),
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
          <LoadingState label="Memuat realisasi proyek..." />
        </section>
      </main>
    )
  }

  return (
    <main className="app-shell master-shell">
      <section className="panel master-panel proyek-panel dashboard-panel">
        <div className="page-stack">
          <div className="dashboard-hero">
            <PageHeader
              eyebrow="Realisasi per Akun"
              title={project?.nama || 'Proyek tidak ditemukan'}
              description="Catat transaksi realisasi per item RAB tanpa mengubah RAB awal. Total dan delta margin dihitung dari histori transaksi."
              actions={(
                <>
                  <Link className="action-link" to="/proyek">Kembali ke proyek</Link>
                  {project ? <Link className="action-link primary" to={`/proyek/${project.id}/rab`}>Kembali ke RAB</Link> : null}
                </>
              )}
            />
          </div>

          {error ? <p className="error-message">{error}</p> : null}

          <div className="metric-grid">
            <div className="metric-card">
              <span>Total Realisasi</span>
              <strong>{formatIDR(totalRealisasi)}</strong>
              <small>{items.length} transaksi tersimpan</small>
            </div>
            <div className="metric-card">
              <span>Margin Realisasi</span>
              <strong>{formatPercent(marginRealisasi?.margin_persen ?? marginRealisasi?.margin_realisasi)}</strong>
              <small>{marginRealisasi?.status_margin || 'Status belum tersedia'}</small>
            </div>
            <div className="metric-card">
              <span>Delta vs RAB</span>
              <strong>{formatPercent(marginRealisasi?.delta_margin)}</strong>
              <small>{marginRealisasi?.indikator_delta || 'Belum tersedia'}</small>
            </div>
          </div>

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
            <div className="margin-card">
              <span>Preview transaksi</span>
              <strong>{formatIDR(totalPreview)}</strong>
              <small>{selectedRabItem ? `${selectedRabItem.kode_akun_seg5} · ${selectedRabItem.uraian}` : 'Pilih item RAB untuk preview transaksi baru.'}</small>
            </div>
          </div>

          {canMutate ? (
            <Card className="form-card">
              <div className="filter-card-title">
                <div>
                  <h2>{editingId ? 'Edit transaksi realisasi' : 'Tambah transaksi realisasi'}</h2>
                  <p>Realisasi dicatat sebagai histori transaksi per akun RAB.</p>
                </div>
                <span className="total-preview">Preview total: {formatIDR(totalPreview)}</span>
              </div>

              <form className="proyek-form" onSubmit={handleSubmit}>
                <fieldset disabled={saving}>
                  <Select label="Item RAB *" value={form.rab_item_id} onChange={(event) => updateField('rab_item_id', event.target.value)} disabled={Boolean(editingId)} required>
                    <option value="">Pilih item RAB</option>
                    {rabItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.kode_akun_seg5} — {item.uraian} ({formatIDR(item.total_idr)})
                      </option>
                    ))}
                  </Select>

                  <Input label="Tanggal realisasi *" type="date" value={form.tanggal_realisasi} onChange={(event) => updateField('tanggal_realisasi', event.target.value)} required />
                  <Input label="Qty *" type="number" min="0" step="0.01" value={form.qty} onChange={(event) => updateField('qty', event.target.value)} required />
                  <Input label="Satuan" value={form.satuan} onChange={(event) => updateField('satuan', event.target.value)} />

                  <Input label="Harga satuan IDR *" type="number" min="0" step="1" value={form.harga_satuan} onChange={(event) => updateField('harga_satuan', event.target.value)} required />

                  <label>
                    Catatan
                    <textarea value={form.catatan} onChange={(event) => updateField('catatan', event.target.value)} rows="3" />
                  </label>
                </fieldset>

                <div className="form-actions">
                  <Button type="submit" disabled={saving || (!editingId && !selectedRabItem)}>
                    {saving ? 'Menyimpan...' : editingId ? 'Update realisasi' : 'Tambah realisasi'}
                  </Button>
                  {editingId ? <Button type="button" variant="secondary" onClick={resetForm}>Batal edit</Button> : null}
                </div>
              </form>
            </Card>
          ) : (
            <EmptyState title="Mode baca" description="Role Anda hanya dapat membaca data realisasi." />
          )}

          <Card className="section-card">
            <div className="section-title-row">
              <div>
                <h2>RAB vs Realisasi per Item</h2>
                <p>{rabItems.length} item RAB sebagai basis transaksi realisasi.</p>
              </div>
            </div>
            {rabItems.length === 0 ? (
              <EmptyState title="Belum ada item RAB" description="Input RAB terlebih dahulu sebelum mencatat realisasi." />
            ) : (
              <div className="table-scroll modern-table rab-table-wrap">
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
                    {rabItems.map((item) => {
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
            )}
          </Card>

          <Card className="section-card">
            <div className="section-title-row">
              <div>
                <h2>Riwayat Transaksi Realisasi</h2>
                <p>{items.length} transaksi realisasi tersimpan.</p>
              </div>
            </div>
            {items.length === 0 ? (
              <EmptyState title="Belum ada transaksi realisasi" description="Transaksi baru akan muncul di sini setelah disimpan." />
            ) : (
              <div className="table-scroll modern-table rab-table-wrap">
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
                    {items.map((item) => {
                      const rabItem = rabItems.find((rab) => rab.id === item.rab_item_id)
                      return (
                        <tr key={item.id}>
                          <td>{item.tanggal_realisasi}</td>
                          <td>
                            <code>{rabItem?.kode_akun_seg5 || '-'}</code>
                            <span>{rabItem?.uraian || 'Item RAB tidak ditemukan'}</span>
                          </td>
                          <td>{item.qty} {item.satuan || ''}</td>
                          <td>{formatIDR(item.harga_satuan)}</td>
                          <td>{formatIDR(item.total_idr)}</td>
                          <td>{item.catatan || '-'}</td>
                          <td>
                            <div className="table-actions">
                              <Button size="sm" type="button" variant="secondary" onClick={() => handleEdit(item)} disabled={!canMutate || saving}>Edit</Button>
                              <Button size="sm" type="button" variant="danger" onClick={() => handleDelete(item)} disabled={!canMutate || saving}>Hapus</Button>
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

          <Card className="section-card">
            <div className="section-title-row">
              <div>
                <h2>Total per Akun</h2>
                <p>Agregasi realisasi dan selisih berdasarkan kode akun.</p>
              </div>
            </div>
            {totalsByAccount.length === 0 ? (
              <EmptyState title="Belum ada total akun" description="Agregasi akun akan muncul setelah transaksi realisasi tersedia." />
            ) : (
              <div className="table-scroll modern-table rab-table-wrap">
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
                    {totalsByAccount.map((item) => (
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
            )}
          </Card>
        </div>
      </section>
    </main>
  )
}

export default RealisasiForm
