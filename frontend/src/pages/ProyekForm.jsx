import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import LoadingState from '../components/ui/LoadingState'
import PageHeader from '../components/ui/PageHeader'
import Select from '../components/ui/Select'
import useAuth from '../hooks/useAuth'
import { kursAPI, masterAPI, proyekAPI } from '../services/api'
import { calculateNilaiIdr, normalizeKurs } from '../utils/currencyConvert'
import { formatIDR } from '../utils/formatIDR'

const INITIAL_FORM = {
  nama: '',
  nomor_spmk: '',
  seg11_no: '',
  cabang_id: '',
  klien: '',
  nilai_proyek: '',
  mata_uang_proyek: 'IDR',
  kurs_idr_proyek: '1',
  tgl_mulai: '',
  tgl_selesai: '',
  portofolio_seg7: '',
  sub_portofolio_seg8: '',
  pmu_kso_seg9: '',
  status: 'draft'
}

function ProyekForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isEdit = Boolean(id)
  const isPm = user?.role === 'pm'

  const [form, setForm] = useState(INITIAL_FORM)
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isPm) return

    async function loadBranches() {
      try {
        const response = await masterAPI.getCabang({ aktif: 'true' })
        setBranches(response.data.data || [])
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Gagal memuat daftar cabang')
      }
    }

    loadBranches()
  }, [isPm])

  useEffect(() => {
    if (!isEdit) return

    async function loadProject() {
      setLoading(true)
      setError('')

      try {
        const response = await proyekAPI.getProyekById(id)
        const project = response.data.data
        setForm({
          nama: project.nama || '',
          nomor_spmk: project.nomor_spmk || '',
          seg11_no: project.seg11_no || '',
          cabang_id: project.cabang_id || '',
          klien: project.klien || '',
          nilai_proyek: String(project.nilai_proyek ?? ''),
          mata_uang_proyek: project.mata_uang_proyek || 'IDR',
          kurs_idr_proyek: String(project.kurs_idr_proyek ?? '1'),
          tgl_mulai: project.tgl_mulai || '',
          tgl_selesai: project.tgl_selesai || '',
          portofolio_seg7: project.portofolio_seg7 || '',
          sub_portofolio_seg8: project.sub_portofolio_seg8 || '',
          pmu_kso_seg9: project.pmu_kso_seg9 || '',
          status: project.status || 'draft'
        })
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Gagal memuat data proyek')
      } finally {
        setLoading(false)
      }
    }

    loadProject()
  }, [id, isEdit])

  const nilaiProyekPreviewIdr = calculateNilaiIdr({
    nilai: form.nilai_proyek,
    mata_uang: form.mata_uang_proyek,
    kurs_idr: form.kurs_idr_proyek
  })

  function updateField(name, value) {
    setForm((current) => {
      const next = { ...current, [name]: value }

      if (name === 'mata_uang_proyek' && value === 'IDR') {
        next.kurs_idr_proyek = '1'
      }

      return next
    })
  }

  useEffect(() => {
    if (form.mata_uang_proyek === 'USD' && !normalizeKurs(form.mata_uang_proyek, form.kurs_idr_proyek)) {
      fillLatestKurs()
    }
  }, [form.mata_uang_proyek])

  async function fillLatestKurs() {
    try {
      const response = await kursAPI.getKurs({ mata_uang: 'USD' })
      const kurs = response.data.data?.latest?.kurs_idr || response.data.data?.history?.[0]?.kurs_idr
      if (kurs) {
        updateField('kurs_idr_proyek', String(kurs))
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Gagal mengambil kurs terbaru')
    }
  }

  function validateSubmit() {
    if (form.mata_uang_proyek === 'USD' && !normalizeKurs(form.mata_uang_proyek, form.kurs_idr_proyek)) {
      setError('Kurs IDR wajib diisi dengan integer > 1 untuk mata uang USD')
      return false
    }

    return true
  }

  function buildPayload() {
    const payload = {
      ...form,
      nilai_proyek: Number(form.nilai_proyek),
      kurs_idr_proyek: Number(form.kurs_idr_proyek || 1)
    }

    if (isPm) {
      delete payload.cabang_id
    }

    return payload
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    if (!validateSubmit()) {
      setSubmitting(false)
      return
    }

    try {
      if (isEdit) {
        await proyekAPI.updateProyek(id, buildPayload())
      } else {
        await proyekAPI.createProyek(buildPayload())
      }

      navigate('/proyek')
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Gagal menyimpan proyek')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="app-shell">
        <section className="panel">
          <LoadingState label="Memuat data proyek..." />
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
              eyebrow="Proyek"
              title={isEdit ? 'Edit Proyek' : 'Registrasi Proyek'}
              description="Proyek boleh dibuat tanpa Segmen 11. RAB tetap terkunci sampai Segmen 11 diisi."
              actions={<Link className="action-link" to="/proyek">Kembali ke proyek</Link>}
            />
          </div>

          <div className={form.seg11_no ? 'alert-card alert-success' : 'alert-card alert-warning'}>
            <strong>{form.seg11_no ? 'Segmen 11 tersedia' : 'Segmen 11 belum diisi'}</strong>
            <p>{form.seg11_no ? 'RAB siap diinput pada fase RAB.' : 'RAB terkunci. Tidak ada bypass sebelum Segmen 11 tersedia.'}</p>
          </div>

          {error ? <p className="error-message">{error}</p> : null}

          <form className="proyek-form" onSubmit={handleSubmit}>
            <Card className="form-card">
              <div className="filter-card-title">
                <div>
                  <h2>Identitas proyek</h2>
                  <p>Data utama proyek dan nomor Segmen 11.</p>
                </div>
              </div>
              <div className="proyek-form">
                <Input label="Nama proyek *" value={form.nama} onChange={(event) => updateField('nama', event.target.value)} required />
                <Input
                  label="Segmen 11"
                  value={form.seg11_no}
                  onChange={(event) => updateField('seg11_no', event.target.value)}
                  placeholder="Boleh kosong saat draft"
                />
                {isPm ? (
                  <Input label="Cabang (otomatis dari akun PM)" value={user?.cabang_id ? 'Otomatis sesuai cabang akun PM' : 'PM belum memiliki cabang'} disabled />
                ) : (
                  <Select label="Cabang *" value={form.cabang_id} onChange={(event) => updateField('cabang_id', event.target.value)} required>
                    <option value="">Pilih cabang / unit pelayanan</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.kode_seg23} — {branch.nama} ({branch.tipe === 'unit_pelayanan' ? 'UP' : 'Cabang'}){branch.aktif === false ? ' · nonaktif' : ''}
                      </option>
                    ))}
                  </Select>
                )}
                <Input label="Klien" value={form.klien} onChange={(event) => updateField('klien', event.target.value)} />
              </div>
            </Card>

            <Card className="form-card">
              <div className="filter-card-title">
                <div>
                  <h2>Nilai proyek dan kurs</h2>
                  <p>Semua kalkulasi margin tetap dikonversi ke IDR.</p>
                </div>
              </div>
              <div className="proyek-form">
                <Input
                  label="Nilai proyek *"
                  type="number"
                  min="0"
                  step="1"
                  value={form.nilai_proyek}
                  onChange={(event) => updateField('nilai_proyek', event.target.value)}
                  required
                />
                <Select label="Mata uang proyek" value={form.mata_uang_proyek} onChange={(event) => updateField('mata_uang_proyek', event.target.value)}>
                  <option value="IDR">IDR</option>
                  <option value="USD">USD</option>
                </Select>
                <Input
                  label="Kurs IDR proyek"
                  type="number"
                  min="1"
                  step="1"
                  value={form.kurs_idr_proyek}
                  onChange={(event) => updateField('kurs_idr_proyek', event.target.value)}
                  disabled={form.mata_uang_proyek === 'IDR'}
                  required
                />
                <div className="total-preview">
                  Preview nilai proyek: {formatIDR(nilaiProyekPreviewIdr)}
                </div>
                {form.mata_uang_proyek === 'USD' ? (
                  <Button type="button" variant="secondary" onClick={fillLatestKurs}>Ambil kurs terbaru</Button>
                ) : null}
              </div>
            </Card>

            <Card className="form-card">
              <div className="filter-card-title">
                <div>
                  <h2>Periode dan portofolio</h2>
                  <p>Metadata segmentasi dan status proyek.</p>
                </div>
              </div>
              <div className="proyek-form">
                <Input label="Tanggal mulai" type="date" value={form.tgl_mulai} onChange={(event) => updateField('tgl_mulai', event.target.value)} />
                <Input label="Tanggal selesai" type="date" value={form.tgl_selesai} onChange={(event) => updateField('tgl_selesai', event.target.value)} />
                <Input label="Portofolio Seg 7" value={form.portofolio_seg7} onChange={(event) => updateField('portofolio_seg7', event.target.value)} />
                <Input label="Sub-portofolio Seg 8" value={form.sub_portofolio_seg8} onChange={(event) => updateField('sub_portofolio_seg8', event.target.value)} />
                <Input label="PMU/KSO Seg 9" value={form.pmu_kso_seg9} onChange={(event) => updateField('pmu_kso_seg9', event.target.value)} />
                <Select label="Status proyek" value={form.status} onChange={(event) => updateField('status', event.target.value)}>
                  <option value="draft">Draft</option>
                  <option value="aktif">Aktif</option>
                  <option value="selesai">Selesai</option>
                  <option value="arsip">Arsip</option>
                </Select>
              </div>
            </Card>

            <div className="form-actions">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Menyimpan...' : 'Simpan proyek'}
              </Button>
              <Link className="action-link" to="/proyek">Batal</Link>
            </div>
          </form>
        </div>
      </section>
    </main>
  )
}

export default ProyekForm
