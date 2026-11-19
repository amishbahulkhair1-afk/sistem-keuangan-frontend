import { useState, useEffect } from "react";
import "./LaporanCetak.css";
import CustomDropdown from "./components/common/CustomDropdown";
import CustomDatePicker from "./components/common/CustomDatePicker";
import {
  IconBook,
  IconScale,
  IconTable,
  IconUsers,
  IconPackage,
  IconArrowRight,
  IconExternalLink,
} from "./Icons";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

const REPORT_CARDS = [
  {
    id: "neraca",
    title: "Neraca Keuangan Resmi",
    category: "Laporan Finansial",
    desc: "Posisi aktiva kas & bank serta passiva alokasi saldo dana program Latee.",
    icon: IconScale,
    badge: "Bulanan",
  },
  {
    id: "buku_bantu",
    title: "Buku Pembantu Saldo Program",
    category: "Laporan Program",
    desc: "Rincian saldo awal, mutasi masuk, mutasi keluar, dan saldo akhir tiap pos.",
    icon: IconBook,
    badge: "Bulanan",
  },
  {
    id: "pemetaan_program",
    title: "Pemetaan Donatur & Program (SPM, IP, dll)",
    category: "Laporan Distribusi",
    desc: "Pemetaan lengkap alokasi donasi donatur dan distribusi dana ke setiap pos program (SPM, IP, PML2, dll).",
    icon: IconBook,
    badge: "Pemetaan Pos",
  },
  {
    id: "donatur",
    title: "Rekapitulasi Donatur (Filter per Pos)",
    category: "Laporan Donasi",
    desc: "Daftar donatur terdaftar, nomor kontak, frekuensi donasi, serta alokasi pos program (SPM, IP, dll).",
    icon: IconUsers,
    badge: "Akumulasi",
  },
  {
    id: "transaksi",
    title: "Jurnal Mutasi Kas & Bank",
    category: "Laporan Transaksi",
    desc: "Buku jurnal harian penerimaan dan pengeluaran dana lengkap beserta pos dan keterangan.",
    icon: IconTable,
    badge: "Real-time",
  },
  {
    id: "barang",
    title: "Donasi Barang & Logistik",
    category: "Laporan Logistik",
    desc: "Penerimaan material fisik semen, pasir, besi, serta logistik (Dapat difilter per Pos: SPM, IP, PTWB, dll).",
    icon: IconPackage,
    badge: "Logistik",
  },
];

export default function LaporanCetak({ categories: propsCategories = [], accounts = [], isReadOnly = false, isDonatur = false, user = null }) {
  const isUserDonatur = isDonatur || user?.role === "donatur";
  const [internalCategories, setInternalCategories] = useState([]);
  const [filterMode, setFilterMode] = useState("range"); // "monthly" | "range"
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedPos, setSelectedPos] = useState("");
  const [selectedJenis, setSelectedJenis] = useState("");

  // Jika user adalah donatur, hanya tampilkan laporan donasi & logistik
  const visibleReports = isUserDonatur
    ? REPORT_CARDS.filter((item) => ["donatur", "barang"].includes(item.id))
    : REPORT_CARDS;

  useEffect(() => {
    if (!propsCategories || propsCategories.length === 0) {
      fetch(`${API_BASE}/categories`)
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) setInternalCategories(data);
        })
        .catch(err => console.error("Gagal load kategori pos:", err));
    }
  }, [propsCategories]);

  const categories = (propsCategories && propsCategories.length > 0) ? propsCategories : internalCategories;

  const monthsList = [
    { num: 1, name: "Januari" },
    { num: 2, name: "Februari" },
    { num: 3, name: "Maret" },
    { num: 4, name: "April" },
    { num: 5, name: "Mei" },
    { num: 6, name: "Juni" },
    { num: 7, name: "Juli" },
    { num: 8, name: "Agustus" },
    { num: 9, name: "September" },
    { num: 10, name: "Oktober" },
    { num: 11, name: "November" },
    { num: 12, name: "Desember" },
  ];

  const handleOpenPdf = (reportId) => {
    let url = `${API_BASE}/reports/pdf/${reportId}?year=${year}&month=${month}`;
    if (filterMode === "range") {
      url += `&start_date=${startDate}&end_date=${endDate}`;
    }
    if (selectedPos && selectedPos.trim()) {
      url += `&pos=${encodeURIComponent(selectedPos.trim())}`;
    }
    if (reportId === "transaksi" && selectedJenis) {
      url += `&jenis=${encodeURIComponent(selectedJenis)}`;
    }
    window.open(url, "_blank");
  };

  return (
    <div className="laporan-portal-wrapper">
      {/* Header & Filter Periode */}
      <div className="laporan-intro-header">
        <div className="intro-title-badge">Pusat Laporan & Pembukuan</div>
        <h2 className="intro-title">Dokumen & Laporan Keuangan</h2>
        <p className="intro-desc">
          Pilih salah satu dokumen di bawah ini. Dokumen akan langsung dibuka sebagai <strong>file PDF resmi di tab baru browser</strong> (dilengkapi kop surat pesantren, frekuensi donasi, dan lembar pengesahan).
        </p>

        {/* Global Filter Bar Sebelum Buka PDF */}
        <div className="catalog-filter-bar">
          <div className="catalog-filter-item">
            <label>Mode Periode:</label>
            <div className="mode-toggle-group">
              <button
                type="button"
                className={`mode-toggle-btn ${filterMode === "range" ? "active" : ""}`}
                onClick={() => setFilterMode("range")}
              >
                Rentang Tanggal
              </button>
              <button
                type="button"
                className={`mode-toggle-btn ${filterMode === "monthly" ? "active" : ""}`}
                onClick={() => setFilterMode("monthly")}
              >
                Bulan & Tahun
              </button>
            </div>
          </div>

          {filterMode === "range" ? (
            <>
              <div className="catalog-filter-item">
                <label>Dari Tanggal:</label>
                <CustomDatePicker
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="catalog-filter-item">
                <label>Sampai Tanggal:</label>
                <CustomDatePicker
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </>
          ) : (
            <>
              <div className="catalog-filter-item">
                <label>Tahun:</label>
                <CustomDropdown
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  options={[
                    { value: "2024", label: "2024" },
                    { value: "2025", label: "2025" },
                    { value: "2026", label: "2026" },
                    { value: "2027", label: "2027" },
                  ]}
                />
              </div>
              <div className="catalog-filter-item">
                <label>Bulan:</label>
                <CustomDropdown
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  options={monthsList.map((m) => ({
                    value: m.num,
                    label: m.name
                  }))}
                />
              </div>
            </>
          )}

          {/* Filter Pos Program (SPM, IP, PML2, dll.) */}
          <div className="catalog-filter-item filter-pos-item">
            <label>Pos Program (SPM, IP, dll):</label>
            <CustomDropdown
              value={selectedPos}
              onChange={(e) => setSelectedPos(e.target.value)}
              placeholder="Semua Pos Program (Semua)"
              searchable={true}
              searchPlaceholder="Cari pos program..."
              options={[
                { value: "", label: "Semua Pos Program (Semua)" },
                ...categories
                  .filter((c) => c.is_active !== false)
                  .map((c) => ({
                    value: c.code,
                    label: `[${c.code}] ${c.nama_kategori || c.name}`
                  }))
              ]}
            />
          </div>
        </div>
      </div>

      {/* Grid Kartu Laporan PDF */}
      <div className="report-cards-grid">
        {visibleReports.map((item) => {
          const IconComp = item.icon;
          return (
            <div
              key={item.id}
              className="report-catalog-card"
              onClick={() => handleOpenPdf(item.id)}
            >
              <div className="card-top-row">
                <div className="card-icon-bubble">
                  <IconComp size={24} color="#0284c7" />
                </div>
                <span className="card-badge">PDF Resmi</span>
              </div>
              <div className="card-content">
                <div className="card-category-label">{item.category}</div>
                <h3 className="card-title">{item.title}</h3>
                <p className="card-desc">{item.desc}</p>
              </div>
              <div className="card-action-bar">
                <span className="btn-open-preview">
                  <span>Buka PDF di Tab Baru</span>
                  <IconExternalLink size={16} />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
