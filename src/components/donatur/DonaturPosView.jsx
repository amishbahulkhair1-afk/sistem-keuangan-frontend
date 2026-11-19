import { useState, useEffect } from "react";
import {
  IconUsers,
  IconFolderPos,
  IconTrendingUp,
  IconSearch,
  IconRefresh,
  IconPrinter,
  IconArrowLeft,
  IconCheckCircle
} from "../../Icons";
import { formatRupiah, formatPosNameShort, POS_ABBREVIATIONS, API_BASE } from "../../utils/formatters";
import CustomDatePicker from "../common/CustomDatePicker";
import TableActionMenu from "../common/TableActionMenu";

export default function DonaturPosView({ stats, allTransactions = [], categories, initialPosId }) {
  const [selectedCat, setSelectedCat] = useState(null);
  const [posTransactions, setPosTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [tableFontSize, setTableFontSize] = useState("compact");

  // Aktifkan pos awal jika ada
  useEffect(() => {
    if (categories && categories.length > 0) {
      if (initialPosId) {
        const found = categories.find(c => String(c.id) === String(initialPosId));
        if (found) {
          setSelectedCat(found);
          return;
        }
      }
      if (!selectedCat) {
        setSelectedCat(categories[0]);
      }
    }
  }, [categories, initialPosId]);

  useEffect(() => {
    if (selectedCat?.id) {
      fetchDonationsForCategory(selectedCat.id);
    }
  }, [selectedCat]);

  const fetchDonationsForCategory = (catId) => {
    setIsLoading(true);
    fetch(`${API_BASE}/transactions?category_id=${catId}&tx_type=income&limit=500`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPosTransactions(data);
        } else {
          setPosTransactions([]);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Gagal memuat transaksi pos:", err);
        setIsLoading(false);
      });
  };

  const filteredTx = posTransactions.filter(tx => {
    const matchSearch = searchQuery === "" ||
      (tx.donor_name || tx.donatur || "Hamba Allah").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.description || tx.keterangan || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.reference_no || tx.no_referensi || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchDate = dateFilter === "" || (tx.transaction_date || tx.tanggal || "").startsWith(dateFilter);
    return matchSearch && matchDate;
  });

  const totalNominal = filteredTx.reduce((sum, tx) => sum + (tx.amount || tx.nominal || 0), 0);
  
  // Total donasi pos dari stats atau transaksi
  const catSummary = (stats?.category_summary || []).find(c => c.id === selectedCat?.id);
  const totalAllNominal = catSummary?.income != null && catSummary.income > 0
    ? catSummary.income
    : posTransactions.reduce((sum, tx) => sum + (tx.amount || tx.nominal || 0), 0);

  // Rata-rata donasi per donatur
  const avgDonation = posTransactions.length > 0 ? totalAllNominal / posTransactions.length : 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="dashboard-blade-layout" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* 1. STATISTIK RINGKASAN POS TERPILIH (BLADE-STATS-GRID) */}
      {selectedCat && (
        <div className="blade-stats-grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
          {/* KARTU 1: TOTAL AKUMULASI DONASI POS */}
          <div className="blade-card emerald group">
            <div className="blade-card-top-bar emerald"></div>
            <div className="blade-card-blur emerald"></div>
            <div className="blade-card-inner">
              <div>
                <p className="blade-card-label">Akumulasi Donasi Pos</p>
                <h3 className="blade-card-value">{formatRupiah(totalAllNominal)}</h3>
                <p className="blade-card-desc" title={`Nama Lengkap: ${selectedCat.name || selectedCat.nama_kategori}`}>
                  Pos [{selectedCat.code || "POS"}] • {formatPosNameShort(selectedCat.name || selectedCat.nama_kategori)}
                </p>
              </div>
              <div className="blade-card-icon emerald">
                <IconTrendingUp size={24} color="white" />
              </div>
            </div>
            <div className="blade-card-footer emerald">
              <span className="blade-footer-dot emerald"></span>
              <span>Total Penerimaan Terverifikasi</span>
            </div>
          </div>

          {/* KARTU 2: JUMLAH DONATUR POS */}
          <div className="blade-card blue group">
            <div className="blade-card-top-bar blue"></div>
            <div className="blade-card-blur blue"></div>
            <div className="blade-card-inner">
              <div>
                <p className="blade-card-label">Jumlah Donatur Terdaftar</p>
                <h3 className="blade-card-value">{posTransactions.length} Orang</h3>
                <p className="blade-card-desc">
                  {filteredTx.length !== posTransactions.length ? `${filteredTx.length} donatur sesuai filter` : "Semua dermawan terdata"}
                </p>
              </div>
              <div className="blade-card-icon blue">
                <IconUsers size={24} color="white" />
              </div>
            </div>
            <div className="blade-card-footer blue">
              <span className="blade-footer-dot blue"></span>
              <span>Partisipasi Donatur Program</span>
            </div>
          </div>

          {/* KARTU 3: RATA-RATA DONASI POS */}
          <div className="blade-card violet group">
            <div className="blade-card-top-bar violet"></div>
            <div className="blade-card-blur violet"></div>
            <div className="blade-card-inner">
              <div>
                <p className="blade-card-label">Rata-rata per Donasi</p>
                <h3 className="blade-card-value">{formatRupiah(avgDonation)}</h3>
                <p className="blade-card-desc">Kontribusi Rata-rata Dermawan</p>
              </div>
              <div className="blade-card-icon violet">
                <IconFolderPos size={24} color="white" />
              </div>
            </div>
            <div className="blade-card-footer violet">
              <span className="blade-footer-dot violet"></span>
              <span>Rerata Nominal Penyaluran</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. KATALOG PILIHAN POS PROGRAM */}
      <div className="desktop-panel">
        <div className="panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
              <IconFolderPos size={18} color="var(--primary)" />
              Pilih Pos Program Donasi
            </h3>
            <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "var(--text-muted)" }}>
              Klik salah satu pos program di bawah ini untuk beralih dan melihat statistik serta daftar donatur pos tersebut.
            </p>
          </div>
          <button
            type="button"
            className="btn-primary-small"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            onClick={() => selectedCat?.id && fetchDonationsForCategory(selectedCat.id)}
            disabled={isLoading}
            title="Perbarui Data Pos Program"
          >
            <IconRefresh size={14} className={isLoading ? "animate-spin" : ""} />
            <span className="btn-label-text">Perbarui Data</span>
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "12px",
            marginTop: "14px"
          }}
        >
          {categories.filter(c => c.is_active !== false).map((cat) => {
            const isSelected = selectedCat?.id === cat.id;
            const shortName = formatPosNameShort(cat.name || cat.nama_kategori);
            return (
              <div
                key={cat.id}
                onClick={() => setSelectedCat(cat)}
                title={`Nama Lengkap: ${cat.name || cat.nama_kategori}`}
                className={`catalog-pos-card ${isSelected ? "selected" : ""}`}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span className={`catalog-pos-code-badge ${isSelected ? "selected" : ""}`}>
                    {cat.code || "POS"}
                  </span>
                  {isSelected && <IconCheckCircle size={16} color="var(--primary)" />}
                </div>
                <div className={`catalog-pos-title ${isSelected ? "selected" : ""}`}>
                  {shortName}
                </div>
                {cat.description && (
                  <div className="catalog-pos-desc">
                    {cat.description}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Indikator Singkatan Standar Sistem */}
        <div className="catalog-abbr-footer">
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, color: "var(--text-muted)" }}>Keterangan Singkatan:</span>
            {POS_ABBREVIATIONS.slice(0, 4).map((abbr, i) => (
              <span key={i} className="abbr-badge">
                <strong>{abbr.short}</strong> = {abbr.full}
              </span>
            ))}
          </div>
          <span style={{ fontStyle: "italic", color: "var(--text-muted)" }}>Arahkan kursor ke kartu pos untuk melihat nama lengkap</span>
        </div>
      </div>

      {/* 3. TABEL DAFTAR DONATUR PER POS */}
      <div className="desktop-panel">
        <div className="panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
              <IconUsers size={18} color="var(--primary)" />
              Daftar Donatur • Pos {selectedCat?.name || selectedCat?.nama_kategori}
            </h3>
            <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "var(--text-muted)" }}>
              Rincian riwayat dana donasi yang disalurkan oleh para dermawan untuk program ini.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            {/* Filter Search */}
            <div style={{ position: "relative", minWidth: "220px" }}>
              <input
                type="text"
                className="form-control"
                placeholder="Cari nama donatur / ref..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ paddingLeft: "32px", fontSize: "13px", height: "36px" }}
              />
              <span style={{ position: "absolute", left: "10px", top: "9px", color: "#94a3b8" }}>
                <IconSearch size={14} />
              </span>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  style={{
                    position: "absolute",
                    right: "8px",
                    top: "8px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#94a3b8"
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Bulan & Tahun */}
            <div style={{ width: "190px" }}>
              <CustomDatePicker
                type="month"
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                placeholder="Filter Bulan & Tahun..."
              />
            </div>

            <button
              type="button"
              className="btn-blade-action"
              onClick={handlePrint}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", padding: "6px 12px" }}
              title="Cetak Daftar Donatur"
            >
              <IconPrinter size={15} /> Cetak
            </button>

            <TableActionMenu
              onRefresh={() => selectedCat?.id && fetchDonationsForCategory(selectedCat.id)}
              isRefreshing={isLoading}
              fontSize={tableFontSize}
              onFontSizeChange={setTableFontSize}
            />
          </div>
        </div>

        {/* Tabel View */}
        <div className={`table-responsive table-font-${tableFontSize}`} style={{ marginTop: "14px" }}>
          {isLoading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
              <IconRefresh size={24} className="animate-spin" style={{ margin: "0 auto 10px auto", display: "block" }} />
              Memuat daftar donatur pos...
            </div>
          ) : filteredTx.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
              <IconUsers size={36} color="#cbd5e1" style={{ margin: "0 auto 10px auto", display: "block" }} />
              <div style={{ fontWeight: 600, fontSize: "15px", color: "#475569" }}>Belum Ada Data Donatur</div>
              <p style={{ fontSize: "13px", margin: "4px 0 0 0" }}>
                {searchQuery || dateFilter
                  ? "Tidak ada donatur yang cocok dengan filter pencarian Anda."
                  : "Belum ada transaksi donasi masuk yang tercatat pada pos program ini."}
              </p>
            </div>
          ) : (
            <table className={`desktop-table table-font-${tableFontSize}`} style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th style={{ width: "50px", textAlign: "center" }}>No</th>
                  <th style={{ width: "120px" }}>Tanggal</th>
                  <th>Nama Donatur</th>
                  <th>Akun / Saluran</th>
                  <th>Keterangan / Akad Donasi</th>
                  <th style={{ textAlign: "right", width: "170px" }}>Nominal Donasi</th>
                </tr>
              </thead>
              <tbody>
                {filteredTx.map((tx, idx) => {
                  const donorName = tx.donor_name || tx.donatur || "Hamba Allah";
                  const dateStr = tx.transaction_date || tx.tanggal || "-";
                  const amountVal = tx.amount || tx.nominal || 0;
                  const accName = tx.account_name || tx.metode || "Kas / Bank";
                  const descStr = tx.description || tx.keterangan || "-";

                  return (
                    <tr key={tx.id || idx}>
                      <td style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "12px" }}>
                        {idx + 1}
                      </td>
                      <td style={{ fontSize: "13px", whiteSpace: "nowrap" }}>
                        {dateStr}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "6px" }}>
                          <span
                            style={{
                              width: "24px",
                              height: "24px",
                              borderRadius: "50%",
                              background: "rgba(3, 105, 161, 0.12)",
                              color: "#0284c7",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "11px",
                              fontWeight: 700
                            }}
                          >
                            {donorName.charAt(0).toUpperCase()}
                          </span>
                          <span>{donorName}</span>
                        </div>
                        {tx.reference_no && (
                          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                            Ref: {tx.reference_no}
                          </div>
                        )}
                      </td>
                      <td style={{ fontSize: "12px" }}>
                        <span className="badge badge-info" style={{ fontSize: "11px" }}>
                          {accName}
                        </span>
                      </td>
                      <td style={{ fontSize: "13px", color: "#475569" }}>
                        {descStr}
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 700, color: "#0284c7", fontSize: "14px", whiteSpace: "nowrap" }}>
                        {formatRupiah(amountVal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="table-total-row">
                  <td colSpan={5} style={{ textAlign: "right", padding: "12px 16px" }}>
                    Total Donasi Terfilter ({filteredTx.length} Transaksi):
                  </td>
                  <td style={{ textAlign: "right", padding: "12px 16px", color: "var(--primary)", fontSize: "15px", fontWeight: 800 }}>
                    {formatRupiah(totalNominal)}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
