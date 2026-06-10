import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import BreakdownChart from '../components/BreakdownChart'
import MarginBadge from '../components/MarginBadge'
import MarginCard from '../components/MarginCard'
import MarginChart from '../components/MarginChart'
import { rabAPI, realisasiAPI } from '../services/api'
import { formatIDR, formatPercent } from '../utils/formatIDR'

const KATEGORI_RAB = ['I', 'II', 'III', 'IV', 'V', 'VI']
const KATEGORI_LABEL = {
  I: 'I - Beban Personil',
  II: 'II - Tenaga Ahli & Labour Supply',
  III: 'III - Perjalanan Dinas',
  IV: 'IV - Beban Operasional',
  V: 'V - Peralatan & Sewa',
  VI: 'VI - Overhead & Administrasi'
}

function toNumber(value) {
  const numberValue = Number(value || 0)
  return Number.isFinite(numberValue) ? numberValue : 0
}

function formatDelta(value, indicator) {
  const formatted = formatPercent(value)
  if (formatted === '-') return '-'
  if (indicator === 'naik') return `▲ Naik ${formatted}`
  if (indicator === 'turun') return `▼ Turun ${formatted}`
  return `◆ Tetap ${formatted}`
}

function ProyekDetail() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [rabItems, setRabItems] = useState([])
  const [realisasiItems, setRealisasiItems] = useState([])
  const [totalsByRabItem, setTotalsByRabItem] = useState({})
  const [marginRab, setMarginRab] = useState(null)
  const [marginRealisasi, setMarginRealisasi] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadDetail() {
    setLoading(true)
    setError('')

    try {
      const [rabResponse, realisasiResponse] = await Promise.all([
        rabAPI.getRab(id),
        realisasiAPI.getRealisasi(id)
      ])

      const rabData = rabResponse.data.data
      const realisasiData = realisasiResponse.data.data
      setProject(rabData.project)
      setRabItems(rabData.items || [])
      setRealisasiItems(realisasiData.items || [])
      setTotalsByRabItem(realisasiData.totals_by_rab_item || {})
      setMarginRab(rabData.margin_rab || null)
      setMarginRealisasi(realisasiData.margin_realisasi || null)
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Gagal memuat detail proyek')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDetail()
  }, [id])

  const totalRab = toNumber(marginRab?.total_rab_idr)
  const totalRealisasi = toNumber(marginRealisasi?.total_realisasi_idr)
  const nilaiProyekIdr = toNumber(marginRab?.nilai_proyek_idr ?? marginRealisasi?.nilai_proyek_idr)

  const breakdown = useMemo(() => KATEGORI_RAB.map((kategori) => {
    const items = rabItems.filter((item) => item.kategori === kategori)
    const rab = items.reduce((sum, item) => sum + toNumber(item.total_idr), 0)
    const realisasi = items.reduce((sum, item) => sum + toNumber(totalsByRabItem[item.id]), 0)

    return {
      kategori,
      label: KATEGORI_LABEL[kategori],
      rab,
      realisasi,
      selisih: rab - realisasi,
      items
    }
  }), [rabItems, totalsByRabItem])

  const chartBreakdown = useMemo(() => breakdown.map((item) => ({
    kategori: item.kategori,
    rab: item.rab,
    realisasi: item.realisasi
  })), [breakdown])

  const marginChartData = useMemo(() => [{
    name: project?.nama ? 'Proyek' : '-',
    margin_rab: Number.isFinite(Number(marginRab?.margin_persen)) ? Number(marginRab.margin_persen) : 0,
    margin_realisasi: Number.isFinite(Number(marginRealisasi?.margin_realisasi ?? marginRealisasi?.margin_persen))
      ? Number(marginRealisasi?.margin_realisasi ?? marginRealisasi?.margin_persen)
      : 0
  }], [project, marginRab, marginRealisasi])

  if (loading) {
    return (
      <main className="app-shell">
        <section className="panel">
          <p className="master-empty">Memuat detail proyek...</p>
        </section>
      </main>
    )
  }

  return (
    <main className="app-shell master-shell">
      <section className="panel master-panel proyek-panel detail-panel">
        <header className="master-header">
          <div>
            <p className="eyebrow">Phase 3C</p>
            <h1>Detail Proyek</h1>
            <p className="muted">{project?.nama || 'Proyek tidak ditemukan'}</p>
          </div>
          <div className="actions">
            <Link to="/proyek">Daftar proyek</Link>
            {project ? <Link to={`/proyek/${project.id}/rab`}>Kelola RAB</Link> : null}
            {project ? <Link to={`/proyek/${project.id}/realisasi`}>Realisasi</Link> : null}
          </div>
        </header>

        {error ? <p className="error-message">{error}</p> : null}

        <section className="detail-meta-grid">
          <div>
            <span>Nomor SPMK</span>
            <strong>{project?.nomor_spmk || '-'}</strong>
          </div>
          <div>
            <span>Klien</span>
            <strong>{project?.klien || '-'}</strong>
          </div>
          <div>
            <span>Segmen 11</span>
            <strong>{project?.seg11_no || 'Belum tersedia'}</strong>
          </div>
          <div>
            <span>Status Proyek</span>
            <strong><span className={`status-pill status-${project?.status}`}>{project?.status || '-'}</span></strong>
          </div>
          <div>
            <span>% Subkon 4422</span>
            <strong>{formatPercent(marginRab?.persen_subkon)}</strong>
          </div>
          <div>
            <span>Periode</span>
            <strong>{project?.tgl_mulai || '-'} s.d. {project?.tgl_selesai || '-'}</strong>
          </div>
        </section>

        <div className="margin-grid">
          <MarginCard
            title="Nilai Proyek"
            amount={nilaiProyekIdr}
            percent={100}
            status="aman"
            description={`${project?.mata_uang_proyek || 'IDR'} · Kurs ${project?.kurs_idr_proyek || 1}`}
          />
          <MarginCard
            title="Total RAB"
            amount={totalRab}
            percent={marginRab?.margin_persen}
            status={marginRab?.status_margin}
            description={`Margin RAB ${formatPercent(marginRab?.margin_persen)}`}
          />
          <MarginCard
            title="Total Realisasi"
            amount={totalRealisasi}
            percent={marginRealisasi?.margin_realisasi ?? marginRealisasi?.margin_persen}
            status={marginRealisasi?.status_margin}
            description={`Margin realisasi ${formatPercent(marginRealisasi?.margin_realisasi ?? marginRealisasi?.margin_persen)}`}
          />
          <div className="margin-card">
            <span>Delta Margin</span>
            <strong>{formatDelta(marginRealisasi?.delta_margin, marginRealisasi?.indikator_delta)}</strong>
            <div className="margin-card-meta">
              <MarginBadge status={marginRealisasi?.status_margin || marginRab?.status_margin} />
            </div>
            <small>Delta = margin realisasi - margin RAB</small>
          </div>
        </div>

        <section className="chart-grid">
          <MarginChart data={marginChartData} />
          <BreakdownChart data={chartBreakdown} />
        </section>

        <section className="dashboard-section">
          <div className="master-content-header">
            <h2>Breakdown RAB vs Realisasi</h2>
            <span>{breakdown.length} kategori</span>
          </div>
          <div className="table-scroll">
            <table className="data-table proyek-table">
              <thead>
                <tr>
                  <th>Kategori</th>
                  <th>Total RAB</th>
                  <th>Total Realisasi</th>
                  <th>Selisih</th>
                  <th>Line Item</th>
                </tr>
              </thead>
              <tbody>
                {breakdown.map((item) => (
                  <tr key={item.kategori}>
                    <td><strong>{item.label}</strong></td>
                    <td>{formatIDR(item.rab)}</td>
                    <td>{formatIDR(item.realisasi)}</td>
                    <td>{formatIDR(item.selisih)}</td>
                    <td>{item.items.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="master-content-header">
            <h2>Line Item Individual</h2>
            <span>{rabItems.length} item RAB · {realisasiItems.length} transaksi realisasi</span>
          </div>
          <div className="table-scroll">
            <table className="data-table proyek-table detail-line-table">
              <thead>
                <tr>
                  <th>Kategori</th>
                  <th>Akun</th>
                  <th>Uraian</th>
                  <th>Qty RAB</th>
                  <th>Total RAB</th>
                  <th>Total Realisasi</th>
                  <th>Selisih</th>
                </tr>
              </thead>
              <tbody>
                {rabItems.length === 0 ? (
                  <tr>
                    <td colSpan="7">Belum ada line item RAB.</td>
                  </tr>
                ) : rabItems.map((item) => {
                  const realisasiTotal = toNumber(totalsByRabItem[item.id])
                  const rabTotal = toNumber(item.total_idr)

                  return (
                    <tr key={item.id}>
                      <td><span className="status-pill status-draft">{item.kategori}</span></td>
                      <td>
                        <code>{item.kode_akun_seg5}</code>
                        <span>{item.seg4_kode || 'Seg 4 belum diisi'}</span>
                      </td>
                      <td>{item.uraian}</td>
                      <td>{item.qty} {item.satuan || ''}</td>
                      <td>{formatIDR(rabTotal)}</td>
                      <td>{formatIDR(realisasiTotal)}</td>
                      <td>{formatIDR(rabTotal - realisasiTotal)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  )
}

export default ProyekDetail
