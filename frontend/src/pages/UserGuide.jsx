import Card from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import useAuth from '../hooks/useAuth'

const ROLE_TITLES = {
  admin: 'Admin / Staff RAB',
  kepala_divre: 'Kepala Divre',
  pm: 'Project Manager (PM)'
}

const GUIDES = {
  admin: [
    {
      title: 'Akses dan navigasi admin',
      steps: [
        'Login memakai akun admin aktif.',
        'Gunakan sidebar untuk membuka Dashboard, Proyek, Master COA, Master Cabang, User Management, Audit Log, dan Panduan.',
        'Admin memiliki akses semua cabang dan bisa mengelola master data aplikasi.'
      ]
    },
    {
      title: 'Dashboard dan proyek',
      steps: [
        'Buka Dashboard untuk melihat KPI seluruh cabang, margin per cabang, dan tabel proyek.',
        'Gunakan filter cabang, tahun, status proyek, dan status margin untuk mempersempit monitoring.',
        'Buka detail proyek untuk melihat RAB vs realisasi, delta margin, % subkon, dan line item.'
      ]
    },
    {
      title: 'Master COA 2025',
      steps: [
        'Buka Master COA untuk melihat akun biaya COA 2025 yang dipakai pada RAB.',
        'Tambah COA jika ada akun aktif yang harus tersedia untuk input RAB.',
        'Edit nama, Seg 4 default, kategori RAB, tipe F/V, dan status aktif.',
        'Gunakan Nonaktifkan, bukan hapus permanen, agar data historis RAB tetap aman.'
      ]
    },
    {
      title: 'Master cabang dan user',
      steps: [
        'Buka Master Cabang untuk menambah atau memperbarui cabang/unit pelayanan.',
        'Kosongkan Parent ID untuk cabang induk, isi Parent ID untuk unit pelayanan jika diperlukan.',
        'Buka User Management untuk membuat admin, Kepala Divre, atau PM.',
        'User PM wajib memiliki cabang. Role non-PM tidak memakai cabang.',
        'Saat edit user, kosongkan password jika tidak ingin reset password; isi password baru jika ingin reset.'
      ]
    },
    {
      title: 'Audit log dan batasan scope',
      steps: [
        'Buka Audit Log untuk melihat perubahan RAB dan realisasi, termasuk nilai lama dan nilai baru.',
        'Aplikasi ini monitoring margin, bukan approval workflow.',
        'Tidak ada email notification, SLA monitoring, atau integrasi ERP langsung di scope saat ini.'
      ]
    }
  ],
  kepala_divre: [
    {
      title: 'Akses Kepala Divre',
      steps: [
        'Login memakai akun Kepala Divre aktif.',
        'Role ini bersifat read-only untuk monitoring seluruh cabang.',
        'Gunakan sidebar Dashboard Monitoring dan Semua Proyek untuk memantau kinerja cabang.'
      ]
    },
    {
      title: 'Membaca dashboard monitoring',
      steps: [
        'KPI menunjukkan total proyek aktif, total nilai proyek, rata-rata margin RAB, rata-rata margin realisasi, dan jumlah proyek kritis/rugi.',
        'Chart margin per cabang membandingkan margin RAB dan margin realisasi.',
        'Tabel proyek menampilkan Segmen 11, nilai proyek, total RAB, total realisasi, margin, delta, status margin, dan status proyek.'
      ]
    },
    {
      title: 'Interpretasi status margin',
      steps: [
        'Aman: margin minimal 15%.',
        'Perhatian: margin minimal 6% dan di bawah 15%.',
        'Kritis: margin 0% sampai di bawah 6%.',
        'Rugi: margin negatif.',
        'Prioritaskan proyek kritis/rugi dan proyek dengan delta margin turun.'
      ]
    },
    {
      title: 'Detail proyek',
      steps: [
        'Klik Lihat detail dari tabel proyek untuk membuka breakdown proyek.',
        'Periksa RAB vs realisasi per kategori dan line item.',
        'Periksa % subkon untuk akun 4422.',
        'Kepala Divre tidak mengubah proyek, RAB, realisasi, atau master data dari halaman ini.'
      ]
    }
  ],
  pm: [
    {
      title: 'Akses PM cabang',
      steps: [
        'Login memakai akun PM aktif yang sudah terhubung ke cabang.',
        'PM hanya melihat dan mengelola proyek pada cabangnya sendiri.',
        'Gunakan Dashboard Cabang untuk memantau margin proyek cabang sendiri.'
      ]
    },
    {
      title: 'Mengelola proyek',
      steps: [
        'Buka Proyek Saya untuk melihat daftar proyek cabang.',
        'Buat proyek baru dan isi metadata utama seperti nama, klien, nilai proyek, mata uang, tanggal, portofolio, dan Segmen 11 bila sudah tersedia.',
        'Update metadata proyek sesuai kebutuhan selama masih dalam kewenangan PM cabang.'
      ]
    },
    {
      title: 'Input RAB dan gate Segmen 11',
      steps: [
        'RAB tidak bisa diinput jika nomor Segmen 11 belum tersedia.',
        'Setelah Segmen 11 ada, buka RAB dari proyek terkait untuk menambah line item.',
        'Pilih akun COA aktif, kategori RAB, mata uang, kurs, qty, satuan, dan harga satuan.',
        'Sistem menghitung total IDR dan margin RAB secara otomatis.'
      ]
    },
    {
      title: 'Input realisasi',
      steps: [
        'Buka Realisasi dari proyek terkait untuk menambahkan transaksi realisasi per akun RAB.',
        'Isi tanggal, qty, satuan, mata uang, kurs, harga satuan, dan catatan.',
        'Sistem menghitung total realisasi, margin realisasi, dan delta margin.',
        'Pantau proyek dengan status perhatian, kritis, atau rugi untuk tindak lanjut operasional.'
      ]
    }
  ]
}

function GuideSection({ role }) {
  return (
    <Card className="section-card user-guide-card" title={ROLE_TITLES[role]} description={`Panduan operasional untuk role ${ROLE_TITLES[role]}.`}>
      <div className="guide-section-list">
        {GUIDES[role].map((section) => (
          <section key={section.title} className="guide-section">
            <h3>{section.title}</h3>
            <ol>
              {section.steps.map((step) => <li key={step}>{step}</li>)}
            </ol>
          </section>
        ))}
      </div>
    </Card>
  )
}

function UserGuide() {
  const { user } = useAuth()
  const rolesToShow = user?.role === 'admin' ? ['admin', 'kepala_divre', 'pm'] : [user?.role].filter(Boolean)

  return (
    <main className="app-shell master-shell">
      <section className="panel master-panel proyek-panel dashboard-panel">
        <div className="page-stack">
          <PageHeader
            eyebrow="Panduan"
            title="Panduan Pengguna"
            description="Panduan penggunaan aplikasi monitoring margin proyek sesuai role dan batas akses."
          />

          <div className="guide-grid">
            {rolesToShow.map((role) => <GuideSection key={role} role={role} />)}
          </div>
        </div>
      </section>
    </main>
  )
}

export default UserGuide
