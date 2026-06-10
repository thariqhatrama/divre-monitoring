import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
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
        const response = await masterAPI.getCabang()
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
          <p className="master-empty">Memuat data proyek...</p>
        </section>
      </main>
    )
  }

  return (
    <main className="app-shell master-shell">
      <section className="panel master-panel proyek-panel">
        <header className="master-header">
          <div>
            <p className="eyebrow">Phase 1E</p>
            <h1>{isEdit ? 'Edit Proyek' : 'Registrasi Proyek'}</h1>
            <p className="muted">
              Proyek boleh dibuat tanpa Segmen 11. RAB tetap terkunci sampai Segmen 11 diisi.
            </p>
          </div>
          <div className="actions">
            <Link to="/proyek">Kembali ke proyek</Link>
          </div>
        </header>

        <div className={form.seg11_no ? 'gate-message gate-open' : 'gate-message gate-locked'}>
          <strong>{form.seg11_no ? 'Segmen 11 tersedia' : 'Segmen 11 belum diisi'}</strong>
          <span>{form.seg11_no ? 'RAB siap diinput pada fase RAB.' : 'RAB terkunci. Tidak ada bypass sebelum Segmen 11 tersedia.'}</span>
        </div>

        {error ? <p className="error-message">{error}</p> : null}

        <form className="proyek-form" onSubmit={handleSubmit}>
          <label>
            Nama proyek *
            <input value={form.nama} onChange={(event) => updateField('nama', event.target.value)} required />
          </label>

          <label>
            Nomor SPMK
            <input value={form.nomor_spmk} onChange={(event) => updateField('nomor_spmk', event.target.value)} />
          </label>

          <label>
            Segmen 11
            <input
              value={form.seg11_no}
              onChange={(event) => updateField('seg11_no', event.target.value)}
              placeholder="Boleh kosong saat draft"
            />
          </label>

          <label>
            Cabang {isPm ? '(otomatis dari akun PM)' : '*'}
            {isPm ? (
              <input value={user?.cabang_id ? 'Otomatis sesuai cabang akun PM' : 'PM belum memiliki cabang'} disabled />
            ) : (
              <select value={form.cabang_id} onChange={(event) => updateField('cabang_id', event.target.value)} required>
                <option value="">Pilih cabang / unit pelayanan</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.kode_seg23} — {branch.nama} ({branch.tipe === 'unit_pelayanan' ? 'UP' : 'Cabang'})
                  </option>
                ))}
              </select>
            )}
          </label>

          <label>
            Klien
            <input value={form.klien} onChange={(event) => updateField('klien', event.target.value)} />
          </label>

          <label>
            Nilai proyek *
            <input
              type="number"
              min="0"
              step="1"
              value={form.nilai_proyek}
              onChange={(event) => updateField('nilai_proyek', event.target.value)}
              required
            />
          </label>

          <label>
            Mata uang proyek
            <select value={form.mata_uang_proyek} onChange={(event) => updateField('mata_uang_proyek', event.target.value)}>
              <option value="IDR">IDR</option>
              <option value="USD">USD</option>
            </select>
          </label>

          <label>
            Kurs IDR proyek
            <input
              type="number"
              min="1"
              step="1"
              value={form.kurs_idr_proyek}
              onChange={(event) => updateField('kurs_idr_proyek', event.target.value)}
              disabled={form.mata_uang_proyek === 'IDR'}
              required
            />
          </label>

          <p className="muted-inline">
            {form.mata_uang_proyek === 'IDR'
              ? 'Input IDR dihitung langsung dengan kurs 1.'
              : `Nilai proyek preview dalam IDR: ${formatIDR(nilaiProyekPreviewIdr)}`}
          </p>

          {form.mata_uang_proyek === 'USD' ? (
            <button type="button" onClick={fillLatestKurs}>Ambil kurs terbaru</button>
          ) : null}

          <label>
            Tanggal mulai
            <input type="date" value={form.tgl_mulai} onChange={(event) => updateField('tgl_mulai', event.target.value)} />
          </label>

          <label>
            Tanggal selesai
            <input type="date" value={form.tgl_selesai} onChange={(event) => updateField('tgl_selesai', event.target.value)} />
          </label>

          <label>
            Portofolio Seg 7
            <input value={form.portofolio_seg7} onChange={(event) => updateField('portofolio_seg7', event.target.value)} />
          </label>

          <label>
            Sub-portofolio Seg 8
            <input value={form.sub_portofolio_seg8} onChange={(event) => updateField('sub_portofolio_seg8', event.target.value)} />
          </label>

          <label>
            PMU/KSO Seg 9
            <input value={form.pmu_kso_seg9} onChange={(event) => updateField('pmu_kso_seg9', event.target.value)} />
          </label>

          <label>
            Status proyek
            <select value={form.status} onChange={(event) => updateField('status', event.target.value)}>
              <option value="draft">Draft</option>
              <option value="aktif">Aktif</option>
              <option value="selesai">Selesai</option>
              <option value="arsip">Arsip</option>
            </select>
          </label>

          <div className="form-actions">
            <button type="submit" disabled={submitting}>
              {submitting ? 'Menyimpan...' : 'Simpan proyek'}
            </button>
            <Link to="/proyek">Batal</Link>
          </div>
        </form>
      </section>
    </main>
  )
}

export default ProyekForm
