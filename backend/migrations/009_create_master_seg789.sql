-- Migration: 009_create_master_seg789.sql
-- Create master tables for project segmentation and seed initial data

CREATE TABLE IF NOT EXISTS master_seg7 (
    kode text PRIMARY KEY,
    nama text NOT NULL,
    aktif boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS master_seg8 (
    kode text PRIMARY KEY,
    nama text NOT NULL,
    parent_kode text REFERENCES master_seg7(kode),
    aktif boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS master_seg9 (
    kode text PRIMARY KEY,
    nama text NOT NULL,
    aktif boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Attach existing set_updated_at trigger
DROP TRIGGER IF EXISTS set_updated_at_master_seg7 ON master_seg7;
CREATE TRIGGER set_updated_at_master_seg7
    BEFORE UPDATE ON master_seg7
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_master_seg8 ON master_seg8;
CREATE TRIGGER set_updated_at_master_seg8
    BEFORE UPDATE ON master_seg8
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_master_seg9 ON master_seg9;
CREATE TRIGGER set_updated_at_master_seg9
    BEFORE UPDATE ON master_seg9
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- Seed data for Segmen 7 (Portofolio)
INSERT INTO master_seg7 (kode, nama) VALUES
('00', 'Non Portofolio'),
('11', 'Perdagangan, Industri & Kelautan'),
('12', 'Layanan Publik, Sumber Daya Alam & Investasi'),
('13', 'Hulu Migas & Produk Migas'),
('14', 'Asset dan Energi Baru & Terbarukan'),
('15', 'Industri'),
('16', 'Mineral'),
('17', 'Batubara'),
('18', 'Sertifikasi & Eco Framework'),
('19', 'Komoditi & Solusi Perdagangan'),
('20', 'Laboratorium'),
('21', 'Property'),
('22', 'Pengembangan'),
('50', 'EPISI'),
('70', 'SAU')
ON CONFLICT (kode) DO UPDATE SET nama = EXCLUDED.nama;

-- Seed data for Segmen 8 (Sub-Portofolio)
INSERT INTO master_seg8 (kode, nama, parent_kode) VALUES
('011', 'Perdagangan', '11'),
('012', 'Industri', '11'),
('013', 'Kelautan', '11'),
('014', 'Tingkat Kandungan Dalam Negeri', '11'),
('015', 'Geomatika', '11'),
('021', 'Fasilitas Layanan Publik', '12'),
('022', 'Sumber Daya Alam', '12'),
('023', 'Investasi', '12'),
('024', 'Teknologi Informasi', '12'),
('025', 'Geomatika', '12'),
('031', 'Produk Migas dan Petrokimia', '13'),
('032', 'Hulu Migas', '13'),
('033', 'Ex. Pemboran, Operasi Sumbur Pemboran', '13'),
('041', 'Energi Baru dan Terbarukan', '14'),
('042', 'Infrastruktur, Aset & Proses Produksi Migas', '14'),
('051', 'Kelistrikan, PJK3 Kemenaker, KPP, KPI', '15'),
('052', 'Kemaritiman, Transportasi dan Otomotif', '15'),
('053', 'Infrastruktur', '15'),
('054', 'BMTB', '15'),
('061', 'ISP Bahan Tambang', '16'),
('062', 'ISP Mineral Processing dan Metalurgi', '16'),
('063', 'Konsultansi Tambang Mineral', '16'),
('064', 'ISP Produk Batuan, Beton dan Tanah', '16'),
('065', 'Ex. Pengujian Bahan Tambang', '16'),
('066', 'Ex. Pengujian Produk Bebatuan, Beton & Tanah', '16'),
('071', 'Down Stream', '17'),
('072', 'Mid Stream', '17'),
('073', 'Konsultansi dan Infrastruktur', '17'),
('074', 'Ex. Pengujian Batubara', '17'),
('081', 'Sertifikasi Produk dan Sistem Mutu', '18'),
('082', 'Eco Frame Work', '18'),
('083', 'Sertifikasi Sistem Manajemen', '18'),
('084', 'Ex. Pelatihan Sistem Manajemen dan Turunannya', '18'),
('085', 'HALAL', '18'),
('091', 'Agri', '19'),
('092', 'Inco', '19'),
('093', 'Fins', '19'),
('094', 'Fumigasi dan Higiene Industri', '19'),
('095', '-', '19'),
('101', 'Analisa Kimia Umum dan Produk Konsumen', '20'),
('102', 'Analisa Lingkungan', '20'),
('103', 'Analisa Minyak dan Gas', '20'),
('104', 'Pengujian Teknik dan Mekanik', '20'),
('105', 'Kalibrasi Alat Ukur dan Uji', '20'),
('106', 'Kalibrasi dan Pengujian Alat Kesehatan', '20'),
('111', 'Space Renting', '21'),
('121', 'Pengembangan', '22'),
('501', 'Man Power Supply', '50'),
('502', 'Engineering', '50'),
('503', 'Procurement', '50'),
('504', 'Construction', '50'),
('701', 'Asset Management', '70'),
('702', 'Business Advisory', '70'),
('703', 'Information and Communication Technology (ICT)', '70'),
('704', 'Survey dan Research', '70'),
('705', 'Training Services', '70'),
('706', 'Technical Consultant', '70'),
('707', 'Safety Asset Consultant', '70'),
('708', 'Meeting Incentive Convention Exhibition (MICE)', '70')
ON CONFLICT (kode) DO UPDATE SET nama = EXCLUDED.nama, parent_kode = EXCLUDED.parent_kode;

-- Seed data for Segmen 9 (PMU/KSO)
INSERT INTO master_seg9 (kode, nama) VALUES
('1', '-'),
('2', 'PMU TIK'),
('3', 'KSO SCI VTP'),
('4', '-'),
('5', 'Halal'),
('6', 'PMU IKN'),
('7', 'PMU CSSE')
ON CONFLICT (kode) DO UPDATE SET nama = EXCLUDED.nama;