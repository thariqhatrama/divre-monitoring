import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import MarginCard from '../components/MarginCard'
import { kursAPI, masterAPI, rabAPI, realisasiAPI } from '../services/api'
import { calculateLineTotalIdr, calculateNilaiIdr, normalizeKurs } from '../utils/currencyConvert'
import { formatIDR, formatPercent } from '../utils/formatIDR'
import { calculateRabMargin } from '../utils/marginFlag'

const KATEGORI_OPTIONS = ['I', 'II', 'III', 'IV', 'V', 'VI']

const INITIAL_FORM = {
  kategori: 'I',
  kode_akun_seg5: '',
  seg4_kode: '',
  uraian: '',
  qty: '1',
  satuan: '',
  mata_uang: 'IDR',
  harga_satuan: '',
  kurs_idr: '1'
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

  const nilaiProyekIdr = useMemo(() => (
    marginRab?.nilai_proyek_idr ?? calculateNilaiIdr({
      nilai: project?.nilai_proyek,
      mata_uang: project?.mata_uang_proyek,
      kurs_idr: project?.kurs_idr_proyek
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
    setForm(INITIAL_FORM)
    setEditingItemId(null)
  }

  function buildPayload() {
    return {
      ...form,
      qty: Number(form.qty || 0),
      harga_satuan: Number(form.harga_satuan || 0),
      kurs_idr: form.mata_uang === 'IDR' ? 1 : Number(form.kurs_idr || 1)
    }
  }

  function validateSubmit() {
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
      mata_uang: item.mata_uang || 'IDR',
      harga_satuan: String(item.harga_satuan ?? '0'),
      kurs_idr: String(item.kurs_idr ?? '1')
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
          <p className="master-empty">Memuat RAB proyek...</p>
        </section>
      </main>
    )
  }

  return (
    <main className="app-shell master-shell">
      <section className="panel master-panel proyek-panel">
        <header className="master-header">
          <div>
            <p className="eyebrow">Phase 1F</p>
            <h1>RAB Proyek</h1>
            <p className="muted">{project?.nama || 'Proyek tidak ditemukan'}</p>
          </div>
          <div className="actions">
            <Link to="/proyek">Kembali ke proyek</Link>
            {project ? <Link to={`/proyek/${project.id}/realisasi`}>Realisasi</Link> : null}
            {project ? <Link to={`/proyek/${project.id}/edit`}>Edit metadata</Link> : null}
          </div>
        </header>

        <div className={project?.seg11_no ? 'gate-message gate-open' : 'gate-message gate-locked'}>
          <strong>{project?.seg11_no ? 'Segmen 11 tersedia' : 'RAB terkunci'}</strong>
          <span>{project?.seg11_no || 'Isi No Segmen 11 pada metadata proyek sebelum input RAB.'}</span>
        </div>

        <div className="rab-summary">
          <div>
            <span>Total RAB</span>
            <strong>{formatIDR(totalRab)}</strong>
          </div>
          <div>
            <span>Total Realisasi</span>
            <strong>{formatIDR(totalRealisasi)}</strong>
          </div>
          <div>
            <span>Selisih RAB vs Realisasi</span>
            <strong>{formatIDR(totalRab - totalRealisasi)}</strong>
          </div>
          {KATEGORI_OPTIONS.map((kategori) => (
            <div key={kategori}>
              <span>Kategori {kategori}</span>
              <strong>{formatIDR(totals[kategori] || 0)}</strong>
            </div>
          ))}
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

        {error ? <p className="error-message">{error}</p> : null}

        <form className="proyek-form" onSubmit={handleSubmit}>
          <fieldset disabled={rabLocked || saving}>
            <legend>{editingItemId ? 'Edit line item RAB' : 'Tambah line item RAB'}</legend>

            <label>
              Kategori
              <select value={form.kategori} onChange={(event) => updateField('kategori', event.target.value)}>
                {KATEGORI_OPTIONS.map((kategori) => (
                  <option key={kategori} value={kategori}>{kategori}</option>
                ))}
              </select>
            </label>

            <label>
              Kode akun Seg 5
              <select value={form.kode_akun_seg5} onChange={(event) => updateField('kode_akun_seg5', event.target.value)} required>
                <option value="">Pilih COA aktif</option>
                {coaAccounts.map((coa) => (
                  <option key={coa.kode_seg5} value={coa.kode_seg5}>
                    {coa.kode_seg5} — {coa.nama}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Seg 4
              <input value={form.seg4_kode} onChange={(event) => updateField('seg4_kode', event.target.value)} />
            </label>

            <label>
              Uraian
              <input value={form.uraian} onChange={(event) => updateField('uraian', event.target.value)} required />
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

            <p className="muted-inline">
              {form.mata_uang === 'IDR'
                ? 'Kurs otomatis 1 untuk IDR.'
                : 'Kurs USD dikunci ke item RAB saat disimpan.'}
            </p>

            {form.mata_uang === 'USD' ? (
              <button type="button" onClick={fillLatestKurs}>Ambil kurs terbaru</button>
            ) : null}
          </fieldset>

          <div className="form-actions">
            <span className="total-preview">Preview total: {formatIDR(totalPreview)}</span>
            <button type="submit" disabled={rabLocked || saving}>
              {saving ? 'Menyimpan...' : editingItemId ? 'Update item' : 'Tambah item'}
            </button>
            {editingItemId ? <button type="button" onClick={resetForm}>Batal edit</button> : null}
          </div>
        </form>

        {rabLocked ? (
          <p className="master-empty">Form RAB disabled karena Segmen 11 belum tersedia atau role Anda hanya baca.</p>
        ) : null}

        <div className="table-scroll rab-table-wrap">
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
              {items.length === 0 ? (
                <tr>
                  <td colSpan="7">Belum ada line item RAB.</td>
                </tr>
              ) : items.map((item) => (
                <tr key={item.id}>
                  <td><span className="status-pill status-draft">{item.kategori}</span></td>
                  <td>
                    <code>{item.kode_akun_seg5}</code>
                    <span>{item.seg4_kode || 'Seg 4 belum diisi'}</span>
                  </td>
                  <td>{item.uraian}</td>
                  <td>{item.qty} {item.satuan || ''}</td>
                  <td>
                    {formatIDR(item.harga_satuan)}
                    <span>{item.mata_uang} · Kurs {item.kurs_idr}</span>
                  </td>
                  <td>{formatIDR(item.total_idr)}</td>
                  <td>
                    <div className="table-actions">
                      <button type="button" onClick={() => handleEdit(item)} disabled={rabLocked || saving}>Edit</button>
                      <button type="button" className="danger-button" onClick={() => handleDelete(item)} disabled={rabLocked || saving}>Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}

export default RABForm
