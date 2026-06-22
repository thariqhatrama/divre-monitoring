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
import { masterAPI, rabAPI, realisasiAPI } from '../services/api'
import { calculateLineTotalIdr, calculateNilaiIdr } from '../utils/currencyConvert'
import { formatIDR, formatPercent } from '../utils/formatIDR'
import { calculateRabMargin } from '../utils/marginFlag'

const KATEGORI_OPTIONS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']

const INITIAL_FORM = {
  kategori: 'I',
  kode_akun_seg5: '',
  seg4_kode: '',
  uraian: '',
  qty: '1',
  satuan: '',
  harga_satuan: ''
}

function RABForm() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [items, setItems] = useState([])
  const [totals, setTotals] = useState({})
  const [totalRab, setTotalRab] = useState(0)
  const [marginRab, setMarginRab] = useState(null)
  const [totalRealisasi, setTotalRealisasi] = useState(0)
  const [marginRealisasi, setMarginRealisasi] = useState(null)
  const [canEdit, setCanEdit] = useState(false)
  const [coaAccounts, setCoaAccounts] = useState([])
  const [form, setForm] = useState(INITIAL_FORM)
  const [editingItemId, setEditingItemId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const rabLocked = !project?.seg11_no || !canEdit

  const editingItem = useMemo(
    () => items.find((item) => item.id === editingItemId),
    [items, editingItemId]
  )

  const totalPreview = useMemo(() => calculateLineTotalIdr(form), [form])

  const filteredCoaAccounts = useMemo(() => (
    coaAccounts.filter((coa) => !form.kategori || coa.kategori_rab === form.kategori)
  ), [coaAccounts, form.kategori])

  const nilaiProyekIdr = useMemo(() => (
    marginRab?.nilai_proyek_idr ?? calculateNilaiIdr({
      nilai: project?.nilai_proyek
    })
  ), [marginRab, project])

  const projectedMargin = useMemo(() => {
    const currentItemTotal = editingItem ? Number(editingItem.total_idr || 0) : 0
    const projectedTotalRab = totalRab - currentItemTotal + totalPreview

    return {
      total_rab_idr: projectedTotalRab,
      ...calculateRabMargin({
        nilaiProyekIdr,
        totalRabIdr: projectedTotalRab
      })
    }
  }, [editingItem, nilaiProyekIdr, totalPreview, totalRab])

  const deltaLabel = useMemo(() => {
    if (!marginRealisasi?.indikator_delta) return 'Delta belum tersedia'
    if (marginRealisasi.indikator_delta === 'naik') return `▲ Naik ${formatPercent(marginRealisasi.delta_margin)} vs RAB`
    if (marginRealisasi.indikator_delta === 'turun') return `▼ Turun ${formatPercent(marginRealisasi.delta_margin)} vs RAB`
    return `■ Tetap ${formatPercent(marginRealisasi.delta_margin)} vs RAB`
  }, [marginRealisasi])

  async function loadRab() {
    setLoading(true)
    setError('')

    try {
      const [rabResponse, coaResponse, realisasiResponse] = await Promise.all([
        rabAPI.getRab(id),
        masterAPI.getCoa({ aktif: 'true' }),
        realisasiAPI.getRealisasi(id)
      ])

      const rabData = rabResponse.data.data
      const realisasiData = realisasiResponse.data.data
      setProject(rabData.project)
      setItems(rabData.items)
      setTotals(rabData.totals_by_kategori || {})
      setTotalRab(rabData.total_rab_idr || 0)
      setMarginRab(rabData.margin_rab || null)
      setTotalRealisasi(realisasiData.total_realisasi_idr || 0)
      setMarginRealisasi(realisasiData.margin_realisasi || null)
      setCanEdit(Boolean(rabData.can_edit))
      setCoaAccounts(coaResponse.data.data || [])
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Gagal memuat RAB proyek')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRab()
  }, [id])

  function updateField(name, value) {
    setForm((current) => {
      const next = { ...current, [name]: value }

      if (name === 'kategori' && current.kode_akun_seg5) {
        const currentCoa = coaAccounts.find((coa) => coa.kode_seg5 === current.kode_akun_seg5)
        if (currentCoa?.kategori_rab !== value) {
          next.kode_akun_seg5 = ''
          next.seg4_kode = ''
        }
      }

      const selectedCoa = name === 'kode_akun_seg5'
        ? coaAccounts.find((coa) => coa.kode_seg5 === value)
        : null

      if (selectedCoa) {
        next.kategori = selectedCoa.kategori_rab || next.kategori
        next.seg4_kode = selectedCoa.seg4_default || next.seg4_kode
      }

      return next
    })
  }

  function resetForm() {
    setForm(INITIAL_FORM)
    setEditingItemId(null)
  }

  function buildPayload() {
    return {
      ...form,
      qty: Number(form.qty || 0),
      harga_satuan: Number(form.harga_satuan || 0)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    setSaving(true)

    try {
      if (editingItemId) {
        await rabAPI.updateRab(editingItemId, buildPayload())
      } else {
        await rabAPI.createRab(id, buildPayload())
      }

      resetForm()
      await loadRab()
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Gagal menyimpan item RAB')
    } finally {
      setSaving(false)
    }
  }

  function handleEdit(item) {
    setEditingItemId(item.id)
    setForm({
      kategori: item.kategori || 'I',
      kode_akun_seg5: item.kode_akun_seg5 || '',
      seg4_kode: item.seg4_kode || '',
      uraian: item.uraian || '',
      qty: String(item.qty ?? '0'),
      satuan: item.satuan || '',
      harga_satuan: String(item.harga_satuan ?? '0')
    })
  }

  async function handleDelete(item) {
    const confirmed = window.confirm(`Hapus item RAB "${item.uraian}"?`)
    if (!confirmed) return

    setSaving(true)
    setError('')

    try {
      await rabAPI.deleteRab(item.id)
      await loadRab()
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Gagal menghapus item RAB')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="app-shell">
        <section className="panel">
          <LoadingState label="Memuat RAB proyek..." />
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
              eyebrow="RAB Proyek"
              title={project?.nama || 'Proyek tidak ditemukan'}
              description="Input line item RAB per akun COA, pantau preview margin, dan jaga gate Segmen 11 tetap aktif."
              actions={(
                <>
                  <Link className="action-link" to="/proyek">Kembali ke proyek</Link>
                  {project ? <Link className="action-link primary" to={`/proyek/${project.id}/realisasi`}>Realisasi</Link> : null}
                  {project ? <Link className="action-link" to={`/proyek/${project.id}/edit`}>Edit metadata</Link> : null}
                </>
              )}
            />
          </div>

          <div className={project?.seg11_no ? 'alert-card alert-success' : 'alert-card alert-warning'}>
            <strong>{project?.seg11_no ? 'Segmen 11 tersedia' : 'RAB terkunci'}</strong>
            <p>{project?.seg11_no || 'Isi No Segmen 11 pada metadata proyek sebelum input RAB. Tidak ada bypass.'}</p>
          </div>

          {error ? <p className="error-message">{error}</p> : null}

          <div className="metric-grid">
            <div className="metric-card">
              <span>Total RAB</span>
              <strong>{formatIDR(totalRab)}</strong>
              <small>{items.length} line item tersimpan</small>
            </div>
            <div className="metric-card">
              <span>Total Realisasi</span>
              <strong>{formatIDR(totalRealisasi)}</strong>
              <small>{deltaLabel}</small>
            </div>
            <div className="metric-card">
              <span>Selisih RAB vs Realisasi</span>
              <strong>{formatIDR(totalRab - totalRealisasi)}</strong>
              <small>RAB tersisa terhadap realisasi berjalan</small>
            </div>
          </div>

          <div className="margin-grid">
            <MarginCard
              title="Margin RAB tersimpan"
              amount={marginRab?.margin_idr}
              percent={marginRab?.margin_persen}
              status={marginRab?.status_margin}
              description={`Nilai proyek ${formatIDR(nilaiProyekIdr)} · Subkon ${formatPercent(marginRab?.persen_subkon)}`}
            />
            <MarginCard
              title="Margin Realisasi"
              amount={marginRealisasi?.laba_operasi_realisasi ?? marginRealisasi?.margin_idr}
              percent={marginRealisasi?.margin_realisasi ?? marginRealisasi?.margin_persen}
              status={marginRealisasi?.status_margin}
              description={`${deltaLabel} · Total realisasi ${formatIDR(totalRealisasi)}`}
            />
            <MarginCard
              title="Preview setelah input"
              amount={projectedMargin.margin_idr}
              percent={projectedMargin.margin_persen}
              status={projectedMargin.status_margin}
              description={`Total RAB preview ${formatIDR(projectedMargin.total_rab_idr)}`}
            />
          </div>

          <Card className="form-card">
            <div className="filter-card-title">
              <div>
                <h2>{editingItemId ? 'Edit line item RAB' : 'Tambah line item RAB'}</h2>
                <p>{rabLocked ? 'Form disabled karena Segmen 11 belum tersedia atau role Anda hanya baca.' : 'Pilih COA aktif dan nominal. Preview margin dihitung sebelum submit.'}</p>
              </div>
              <span className="total-preview">Preview total: {formatIDR(totalPreview)}</span>
            </div>

            <form className="proyek-form" onSubmit={handleSubmit}>
              <fieldset disabled={rabLocked || saving}>
                <Select label="Kategori" value={form.kategori} onChange={(event) => updateField('kategori', event.target.value)}>
                  {KATEGORI_OPTIONS.map((kategori) => (
                    <option key={kategori} value={kategori}>{kategori}</option>
                  ))}
                </Select>

                <Select label="Kode akun Seg 5 *" value={form.kode_akun_seg5} onChange={(event) => updateField('kode_akun_seg5', event.target.value)} required>
                  <option value="">Pilih COA aktif</option>
                  {filteredCoaAccounts.map((coa) => (
                    <option key={coa.kode_seg5} value={coa.kode_seg5}>
                      {coa.kode_seg5} — {coa.nama}
                    </option>
                  ))}
                </Select>

                <Input label="Seg 4" value={form.seg4_kode} onChange={(event) => updateField('seg4_kode', event.target.value)} />
                <Input label="Uraian *" value={form.uraian} onChange={(event) => updateField('uraian', event.target.value)} required />
                <Input label="Qty *" type="number" min="0" step="0.01" value={form.qty} onChange={(event) => updateField('qty', event.target.value)} required />
                <Input label="Satuan" value={form.satuan} onChange={(event) => updateField('satuan', event.target.value)} />

                <Input label="Harga satuan IDR *" type="number" min="0" step="1" value={form.harga_satuan} onChange={(event) => updateField('harga_satuan', event.target.value)} required />
              </fieldset>

              <div className="form-actions">
                <Button type="submit" disabled={rabLocked || saving}>
                  {saving ? 'Menyimpan...' : editingItemId ? 'Update item' : 'Tambah item'}
                </Button>
                {editingItemId ? <Button type="button" variant="secondary" onClick={resetForm}>Batal edit</Button> : null}
              </div>
            </form>
          </Card>

          <Card className="summary-card">
            <div className="section-title-row">
              <div>
                <h2>Subtotal kategori</h2>
                <p>Ringkasan RAB tersimpan per kategori I–VII.</p>
              </div>
            </div>
            <div className="rab-summary">
              {KATEGORI_OPTIONS.map((kategori) => (
                <div key={kategori}>
                  <span>Kategori {kategori}</span>
                  <strong>{formatIDR(totals[kategori] || 0)}</strong>
                </div>
              ))}
            </div>
          </Card>

          <Card className="section-card">
            <div className="section-title-row">
              <div>
                <h2>Line item RAB</h2>
                <p>{items.length} item RAB tersimpan.</p>
              </div>
            </div>
            {items.length === 0 ? (
              <EmptyState title="Belum ada line item RAB" description="Line item akan tampil setelah RAB proyek diinput." />
            ) : (
              <div className="table-scroll modern-table rab-table-wrap">
                <table className="data-table proyek-table">
                  <thead>
                    <tr>
                      <th>Kategori</th>
                      <th>Akun</th>
                      <th>Uraian</th>
                      <th>Qty</th>
                      <th>Harga</th>
                      <th>Total IDR</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td><span className="status-pill status-draft">{item.kategori}</span></td>
                        <td>
                          <code>{item.kode_akun_seg5}</code>
                          <span>{item.seg4_kode || 'Seg 4 belum diisi'}</span>
                        </td>
                        <td>{item.uraian}</td>
                        <td>{item.qty} {item.satuan || ''}</td>
                        <td>{formatIDR(item.harga_satuan)}</td>
                        <td>{formatIDR(item.total_idr)}</td>
                        <td>
                          <div className="table-actions">
                            <Button size="sm" type="button" variant="secondary" onClick={() => handleEdit(item)} disabled={rabLocked || saving}>Edit</Button>
                            <Button size="sm" type="button" variant="danger" onClick={() => handleDelete(item)} disabled={rabLocked || saving}>Hapus</Button>
                          </div>
                        </td>
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

export default RABForm
