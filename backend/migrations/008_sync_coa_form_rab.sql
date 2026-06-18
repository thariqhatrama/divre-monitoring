-- 008_sync_coa_form_rab.sql
-- Dashboard Monitoring Margin Proyek Divre Timur
-- Sinkronisasi kategori dan kelengkapan master COA RAB dari docs/Form RAB.xlsm.
-- Sumber kategori: sheet pertama `RAB` dan sheet kedua `sheet 2`.
-- Status aktif tetap mengikuti COA Tahun 2025: kode nonaktif disimpan untuk referensi,
-- tetapi tidak muncul di dropdown RAB aktif dan tidak bisa dipakai untuk simpan RAB baru.

ALTER TABLE coa_accounts
  DROP CONSTRAINT IF EXISTS coa_accounts_kategori_rab_check;

ALTER TABLE coa_accounts
  ADD CONSTRAINT coa_accounts_kategori_rab_check
  CHECK (kategori_rab IN ('I', 'II', 'III', 'IV', 'V', 'VI', 'VII'));

ALTER TABLE rab_items
  DROP CONSTRAINT IF EXISTS rab_items_kategori_check;

ALTER TABLE rab_items
  ADD CONSTRAINT rab_items_kategori_check
  CHECK (kategori IN ('I', 'II', 'III', 'IV', 'V', 'VI', 'VII'));

INSERT INTO coa_accounts (
  kode_seg5,
  nama,
  seg4_default,
  kategori_rab,
  tipe_fv,
  aktif
) VALUES
  -- I. Beban Personil / Tenaga Kerja Langsung
  ('4021', 'Upah  (Gaji + Tunj. Grade)', NULL, 'I', 'F', true),
  ('4022', 'Tunjangan (THR/Cuti/Trnsp/Rumah/UPF)', NULL, 'I', 'F', true),
  ('4051', 'Jaminan Kecelakaan Kerja', NULL, 'I', 'F', true),
  ('4052', 'Jaminan Hari Tua', NULL, 'I', 'F', true),
  ('4053', 'Jaminan Kematian', NULL, 'I', 'F', true),
  ('4061', 'Jaminan Kesehatan', NULL, 'I', 'F', true),
  ('4071', 'Beban Lembur Pegawai', NULL, 'I', 'F', true),
  ('4081', 'Biaya Insentif / Jasa Produksi', NULL, 'I', 'F', true),
  ('4091', 'Tunjangan PPh Pasal 21', NULL, 'I', 'F', true),
  ('4102', 'General Chek Up', NULL, 'I', 'F', true),
  ('4151', 'Upah Pegawai Proyek', NULL, 'I', 'F', true),
  ('4152', 'Tunjangan PPh 21 Proyek', NULL, 'I', 'F', true),
  ('4153', 'Tunjangan Pegawai Proyek (THR/Cuti/Trnsp/Rumah/UPF)', NULL, 'I', 'F', true),

  -- II. Biaya Tenaga Ahli & Labour Supply
  ('4221', 'Imbalan Bukan Pegawai (Asing)', NULL, 'II', 'V', true),
  ('4222', 'Biaya Pajak TA Asing', NULL, 'II', 'V', false),
  ('4231', 'Imbalan Bukan Pegawai (Lokal)', NULL, 'II', 'V', true),
  ('4232', 'Biaya Pajak TA Lokal', NULL, 'II', 'V', false),
  ('4241', 'Biaya Labour Supply', NULL, 'II', 'V', true),
  ('4242', 'Manajemen Fee', NULL, 'II', 'V', true),

  -- III. Beban Perjalanan Dinas
  ('4301', 'Uang Saku Dinas', NULL, 'III', 'V', true),
  ('4302', 'Biaya Perjalanan Dinas', NULL, 'III', 'V', true),
  ('4303', 'Biaya Pengganti Transport', NULL, 'III', 'V', true),

  -- IV. Beban Operasional
  ('4411', 'Biaya Bahan', NULL, 'IV', 'V', true),
  ('4431', 'Biaya Perlengkapan Kerja', NULL, 'IV', 'V', true),
  ('4421', 'Kemitraan', NULL, 'IV', 'V', true),
  ('4422', 'Biaya Subkontraktor/ Lab Ekstern/ Konsultan', NULL, 'IV', 'V', true),
  ('4423', 'Biaya Konsultan Proyek', NULL, 'IV', 'V', false),
  ('4432', 'Biaya Pas Pelabuhan / Bandara / Porter / Handling', NULL, 'IV', 'V', true),
  ('4433', 'Biaya Ekstra Fooding', NULL, 'IV', 'V', false),
  ('4434', 'Biaya Pelaporan', NULL, 'IV', 'V', false),
  ('4441', 'Biaya Canvassing', NULL, 'IV', 'V', true),
  ('4442', 'Biaya Tender/Lelang/Kontrak', NULL, 'IV', 'V', false),
  ('4491', 'Biaya Operasional Intern', NULL, 'IV', 'V', true),

  -- V. Beban Fasilitas
  ('4511', 'BiayaJasaPerawatanBangunan', NULL, 'V', 'V', true),
  ('4512', 'BiayaSewaBangunan', NULL, 'V', 'V', true),
  ('4515', 'BiayaListrik/Air/GasBangunan', NULL, 'V', 'V', true),
  ('4516', 'BiayaMaterialBangunan', NULL, 'V', 'V', true),
  ('4521', 'BiayaJasaPerawatanPerlengkapanMesin', NULL, 'V', 'V', true),
  ('4522', 'BiayaSewaPerlengkapanMesin', NULL, 'V', 'V', true),
  ('4523', 'BiayaBBM/Pelumasdsb', NULL, 'V', 'V', true),
  ('4524', 'BiayaSukuCadangPerlengkapanMesin', NULL, 'V', 'V', true),
  ('4531', 'BiayaJasaPerawatanPeralatanOperasi', NULL, 'V', 'V', true),
  ('4533', 'BiayaPeralatanPenunjang', NULL, 'V', 'V', true),
  ('4535', 'BiayaSukuCadangPeralatanOperasi', NULL, 'V', 'V', true),
  ('4536', 'BiayaSewaPeralatanOperasi', NULL, 'V', 'V', true),
  ('4541', 'BiayaJasaPerawatanKendaraan', NULL, 'V', 'V', true),
  ('4542', 'BiayaSewaKendaraan', NULL, 'V', 'V', true),
  ('4545', 'BiayaBBM/Pelumas(Oli)dsb', NULL, 'V', 'V', true),
  ('4546', 'BiayaSukuCadangKendaraan', NULL, 'V', 'V', true),
  ('4551', 'BiayaJasaPerawatanPeralatanKantor', NULL, 'V', 'V', true),
  ('4552', 'BiayaSewaPeralatanKantor', NULL, 'V', 'V', true),
  ('4553', 'BiayaInventarisKecil', NULL, 'V', 'V', true),
  ('4561', 'BiayaJasaPerawatanPeralatanSI', NULL, 'V', 'V', true),
  ('4562', 'BiayaSewaPeralatanSI', NULL, 'V', 'V', true),
  ('4563', 'BiayaInventarisKecilSI', NULL, 'V', 'V', true),
  ('4564', 'BiayaSoftware/PerangkatLunak', NULL, 'V', 'V', true),
  ('4565', 'BiayaSukuCadangPeralatanSI', NULL, 'V', 'V', true),
  ('4566', 'BiayaLisensi', NULL, 'V', 'V', true),
  ('4424', 'Reimbursment', NULL, 'V', 'V', true),

  -- VI. Beban Penyusutan & Amortisasi
  ('4621', 'Beban Penyusutan Perlengkapan Mesin', NULL, 'VI', 'F', true),
  ('4631', 'Beban Penyusutan Alat Operasi', NULL, 'VI', 'F', true),
  ('4651', 'Beban Penyusutan Peralatan Kantor', NULL, 'VI', 'F', true),
  ('4661', 'Beban Penyusutan Peralatan SI', NULL, 'VI', 'F', true),

  -- VII. Beban Kantor dan Diklat
  ('4711', 'Biaya ATK', NULL, 'VII', 'V', true),
  ('4721', 'Biaya Telekomunikasi / V-Sat / Pos', NULL, 'VII', 'V', true),
  ('4722', 'Biaya Ekspedisi', NULL, 'VII', 'V', true),
  ('4731', 'Biaya Rapat', NULL, 'VII', 'V', true),
  ('4782', 'Beban Dokumentasi Proyek', NULL, 'VII', 'V', true),
  ('4791', 'Biaya Diklat Inhouse', NULL, 'VII', 'V', false),
  ('4792', 'Beban Pelatihan Eksternal', NULL, 'VII', 'V', true)
ON CONFLICT (kode_seg5) DO UPDATE SET
  nama = EXCLUDED.nama,
  seg4_default = EXCLUDED.seg4_default,
  kategori_rab = EXCLUDED.kategori_rab,
  tipe_fv = EXCLUDED.tipe_fv,
  aktif = EXCLUDED.aktif,
  updated_at = now();
