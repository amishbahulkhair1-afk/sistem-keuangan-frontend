import React, { useState, useMemo } from "react";
import {
  IconLayers,
  IconCheckCircle,
  IconPlusCircle,
  IconFileText,
  IconTrash,
  IconWallet,
  IconRefresh,
  IconX,
  IconTrendingUp,
  IconTrendingDown
} from "../../Icons";
import { formatRupiah } from "../../utils/formatters";
import CustomDropdown from "../common/CustomDropdown";
import CustomDatePicker from "../common/CustomDatePicker";
import TableActionMenu from "../common/TableActionMenu";
import TablePagination from "../common/TablePagination";
import BulkActionBar from "../common/BulkActionBar";
import { useTablePagination } from "../common/useTablePagination";

export default function PosHutangPiutang({
  currentScopedPos,
  selectedPosScope,
  debtsRecap,
  isReadOnly,
  debtMsg,
  handleSimpanDebt,
  debtFormCatId,
  setDebtFormCatId,
  categories = [],
  debtFormTgl,
  setDebtFormTgl,
  debtFormType,
  setDebtFormType,
  debtFormParty,
  setDebtFormParty,
  debtFormAmount,
  setDebtFormAmount,
  debtFormDesc,
  setDebtFormDesc,
  debtsList = [],
  handleHapusDebt,
  handleBulkDeleteDebts,
  setConfirmDialog,
  setActiveMenu,
  fetchDebts
}) {
  const [tableFontSize, setTableFontSize] = useState("compact");
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Search & Filters
  const [rekapSearchHutang, setRekapSearchHutang] = useState("");
  const [rekapSearchPiutang, setRekapSearchPiutang] = useState("");
  const [jurnalTypeFilter, setJurnalTypeFilter] = useState("all"); // 'all' | 'hutang' | 'piutang'
  const [jurnalSearch, setJurnalSearch] = useState("");

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (fetchDebts) {
      await fetchDebts(selectedPosScope);
    }
    setIsRefreshing(false);
  };

  // Data Rekap
  const rawHutangList = debtsRecap?.hutang_list || [];
  const rawPiutangList = debtsRecap?.piutang_list || [];

  // Daftar pihak yang sudah pernah ada untuk autocomplete
  const knownParties = useMemo(() => {
    const set = new Set();
    rawHutangList.forEach(h => h.party_name && set.add(h.party_name.trim()));
    rawPiutangList.forEach(p => p.party_name && set.add(p.party_name.trim()));
    debtsList.forEach(d => d.party_name && set.add(d.party_name.trim()));
    return Array.from(set);
  }, [rawHutangList, rawPiutangList, debtsList]);

  const filteredHutangList = useMemo(() => {
    if (!rekapSearchHutang.trim()) return rawHutangList;
    const q = rekapSearchHutang.toLowerCase().trim();
    return rawHutangList.filter(h => (h.party_name || "").toLowerCase().includes(q));
  }, [rawHutangList, rekapSearchHutang]);

  const filteredPiutangList = useMemo(() => {
    if (!rekapSearchPiutang.trim()) return rawPiutangList;
    const q = rekapSearchPiutang.toLowerCase().trim();
    return rawPiutangList.filter(p => (p.party_name || "").toLowerCase().includes(q));
  }, [rawPiutangList, rekapSearchPiutang]);

  // Statistik Ringkasan
  const totalSisaHutang = parseFloat(debtsRecap?.total_sisa_hutang || 0);
  const totalSisaPiutang = parseFloat(debtsRecap?.total_sisa_piutang || 0);
  const totalHutangPinjam = parseFloat(debtsRecap?.total_hutang_pinjam || rawHutangList.reduce((acc, h) => acc + (parseFloat(h.total_pinjam) || 0), 0));
  const totalHutangBayar = parseFloat(debtsRecap?.total_hutang_bayar || rawHutangList.reduce((acc, h) => acc + (parseFloat(h.total_bayar) || 0), 0));
  const totalPiutangPinjam = parseFloat(debtsRecap?.total_piutang_pinjam || rawPiutangList.reduce((acc, p) => acc + (parseFloat(p.total_piutang) || 0), 0));
  const totalPiutangBayar = parseFloat(debtsRecap?.total_piutang_bayar || rawPiutangList.reduce((acc, p) => acc + (parseFloat(p.total_bayar) || 0), 0));

  const activeHutangCount = rawHutangList.filter(h => parseFloat(h.saldo || 0) > 0).length;
  const activePiutangCount = rawPiutangList.filter(p => parseFloat(p.saldo || 0) > 0).length;

  const hutangPaidPercentage = totalHutangPinjam > 0 ? Math.min(100, Math.round((totalHutangBayar / totalHutangPinjam) * 100)) : 100;
  const piutangRecoveredPercentage = totalPiutangPinjam > 0 ? Math.min(100, Math.round((totalPiutangBayar / totalPiutangPinjam) * 100)) : 100;

  // Filter Buku Jurnal
  const filteredDebtsList = useMemo(() => {
    return debtsList.filter(d => {
      if (jurnalTypeFilter === "hutang" && !d.type.startsWith("hutang")) return false;
      if (jurnalTypeFilter === "piutang" && !d.type.startsWith("piutang")) return false;
      if (jurnalSearch.trim()) {
        const q = jurnalSearch.toLowerCase().trim();
        const party = (d.party_name || "").toLowerCase();
        const desc = (d.description || "").toLowerCase();
        const pos = (d.pos_code || "").toLowerCase();
        if (!party.includes(q) && !desc.includes(q) && !pos.includes(q)) return false;
      }
      return true;
    });
  }, [debtsList, jurnalTypeFilter, jurnalSearch]);

  const {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
    displayStart,
    displayEnd,
    paginatedItems,
    selectedIds,
    selectedCount,
    isAllSelected,
    isSomeSelected,
    toggleSelect,
    toggleSelectAll,
    selectAllFiltered,
    clearSelection
  } = useTablePagination(filteredDebtsList, 10);

  const handleTriggerBulkDelete = () => {
    if (selectedCount === 0) return;
    if (setConfirmDialog) {
      setConfirmDialog({
        title: `Hapus ${selectedCount} Data Hutang / Piutang`,
        message: `Apakah Anda yakin ingin menghapus ${selectedCount} catatan hutang/piutang yang dipilih secara permanen?`,
        confirmText: `Hapus ${selectedCount} Data`,
        confirmType: "danger",
        details: [
          { label: "Jumlah Data Terpilih", value: `${selectedCount} item`, isHighlight: true }
        ],
        onConfirm: async () => {
          setIsBulkDeleting(true);
          try {
            if (handleBulkDeleteDebts) {
              const ok = await handleBulkDeleteDebts(Array.from(selectedIds));
              if (ok) clearSelection();
            }
          } finally {
            setIsBulkDeleting(false);
            setConfirmDialog(null);
          }
        }
      });
    }
  };

  const handleModalSubmit = (e) => {
    if (handleSimpanDebt) {
      handleSimpanDebt(e);
      setShowAddModal(false);
    }
  };

  return (
    <div className="hutang-piutang-container">
      {/* HEADER SECTION: Judul & Action Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "20px",
          background: "#ffffff",
          padding: "16px 20px",
          borderRadius: "12px",
          border: "1px solid var(--border-color)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
        }}
      >
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-main)", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <IconLayers size={22} color="var(--primary)" />
            Informasi & Rekapitulasi Hutang & Piutang Pos
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "4px 0 0 0" }}>
            Pos Program: <strong>[{currentScopedPos?.code || "SEMUA"}] {currentScopedPos?.name || "Seluruh Pos"}</strong> • Otomatis terintegrasi dari Kas & Belanja Pos
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {setActiveMenu && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setActiveMenu("pos_transaksi")}
              title="Beralih ke Menu Kas & Belanja Pos"
              style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", padding: "8px 14px" }}
            >
              <IconWallet size={16} />
              <span>Input Belanja di Kas Pos</span>
            </button>
          )}

          {!isReadOnly && (
            <button
              type="button"
              className="btn-primary"
              onClick={() => setShowAddModal(true)}
              style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", padding: "8px 14px" }}
            >
              <IconPlusCircle size={16} color="white" />
              <span>+ Catat Penyesuaian</span>
            </button>
          )}

          <button
            type="button"
            className="btn-secondary"
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Segarkan Data"
            style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", padding: "8px 12px" }}
          >
            <IconRefresh size={16} className={isRefreshing ? "spin-animation" : ""} />
            <span>{isRefreshing ? "Memuat..." : "Segarkan"}</span>
          </button>
        </div>
      </div>

      {debtMsg && (
        <div className={`alert-box alert-${debtMsg.type}`} style={{ marginBottom: "16px" }}>
          {debtMsg.text}
        </div>
      )}

      {/* INFORMASI REKAP: 4 STATS CARDS */}
      <div className="blade-stats-grid" style={{ marginBottom: "20px" }}>
        {/* Card 1: Total Sisa Hutang */}
        <div className="blade-card amber group">
          <div className="blade-card-top-bar amber"></div>
          <div className="blade-card-inner">
            <div style={{ width: "100%" }}>
              <p className="blade-card-label">Sisa Kewajiban Hutang (Belum Lunas)</p>
              <h3 className="blade-card-value" style={{ color: "#b45309" }}>
                {formatRupiah(totalSisaHutang)}
              </h3>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                <div>Total Pinjam / Tempo: <strong>{formatRupiah(totalHutangPinjam)}</strong></div>
                <div>Sudah Dicicil / Bayar: <strong style={{ color: "#16a34a" }}>{formatRupiah(totalHutangBayar)}</strong></div>
              </div>
              <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <span className={`badge-tag ${activeHutangCount > 0 ? 'badge-expense' : 'badge-income'}`} style={{ fontSize: "11px" }}>
                  {activeHutangCount > 0 ? `${activeHutangCount} Mitra Belum Lunas` : "Semua Hutang Lunas"}
                </span>
              </div>
            </div>
            <div className="blade-card-icon amber">
              <IconTrendingDown size={24} color="white" />
            </div>
          </div>
        </div>

        {/* Card 2: Total Sisa Piutang */}
        <div className="blade-card blue group">
          <div className="blade-card-top-bar blue"></div>
          <div className="blade-card-inner">
            <div style={{ width: "100%" }}>
              <p className="blade-card-label">Sisa Hak Piutang Pos (Belum Kembali)</p>
              <h3 className="blade-card-value" style={{ color: "#0284c7" }}>
                {formatRupiah(totalSisaPiutang)}
              </h3>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                <div>Total Dipinjamkan: <strong>{formatRupiah(totalPiutangPinjam)}</strong></div>
                <div>Sudah Dikembalikan: <strong style={{ color: "#16a34a" }}>{formatRupiah(totalPiutangBayar)}</strong></div>
              </div>
              <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <span className={`badge-tag ${activePiutangCount > 0 ? 'badge-pos' : 'badge-income'}`} style={{ fontSize: "11px" }}>
                  {activePiutangCount > 0 ? `${activePiutangCount} Pihak Belum Kembali` : "Semua Piutang Kembali"}
                </span>
              </div>
            </div>
            <div className="blade-card-icon blue">
              <IconTrendingUp size={24} color="white" />
            </div>
          </div>
        </div>

        {/* Card 3: Persentase Pelunasan Hutang */}
        <div className="blade-card emerald group">
          <div className="blade-card-top-bar emerald"></div>
          <div className="blade-card-inner">
            <div style={{ width: "100%" }}>
              <p className="blade-card-label">Rasio Pelunasan Kewajiban</p>
              <h3 className="blade-card-value" style={{ color: "#16a34a" }}>
                {hutangPaidPercentage}%
              </h3>
              <p className="blade-card-desc">
                {totalSisaHutang === 0 && totalHutangPinjam > 0
                  ? "Seluruh kewajiban hutang telah lunas 100%"
                  : `${formatRupiah(totalHutangBayar)} terbayar dari ${formatRupiah(totalHutangPinjam)}`}
              </p>
              <div style={{ width: "100%", height: "6px", background: "#e2e8f0", borderRadius: "3px", overflow: "hidden", marginTop: "8px" }}>
                <div style={{ width: `${hutangPaidPercentage}%`, height: "100%", background: "#16a34a", transition: "width 0.3s ease" }}></div>
              </div>
            </div>
            <div className="blade-card-icon emerald">
              <IconCheckCircle size={24} color="white" />
            </div>
          </div>
        </div>

        {/* Card 4: Status Integrasi Otomatis */}
        <div className="blade-card group" style={{ background: "#f8fafc" }}>
          <div className="blade-card-top-bar" style={{ background: "#6366f1" }}></div>
          <div className="blade-card-inner">
            <div style={{ width: "100%" }}>
              <p className="blade-card-label">Sistem Integrasi Kas & Belanja</p>
              <h3 className="blade-card-value" style={{ color: "#4f46e5", fontSize: "18px" }}>
                Terhubung Otomatis
              </h3>
              <p className="blade-card-desc" style={{ fontSize: "12px", lineHeight: "1.4", marginTop: "6px" }}>
                Setiap transaksi belanja kasbon/tempo di <strong>Kas & Belanja Pos</strong> otomatis dicatat dan disinkronkan ke rekap ini.
              </p>
              <div style={{ marginTop: "6px" }}>
                <span className="badge-tag" style={{ background: "#e0e7ff", color: "#3730a3", fontSize: "10px", fontWeight: "700" }}>
                  SYNC REAL-TIME
                </span>
              </div>
            </div>
            <div className="blade-card-icon" style={{ background: "#6366f1" }}>
              <IconWallet size={24} color="white" />
            </div>
          </div>
        </div>
      </div>

      {/* REKAPITULASI DETAIL PER PIHAK: DUA PANEL BERDAMPINGAN / FULL */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }} className="rekap-grid-2col">
        {/* PANEL 1: REKAP KEWAJIBAN HUTANG */}
        <div className="desktop-panel">
          <div className="panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ display: "flex", alignItems: "center", gap: "8px", color: "#b45309" }}>
                <IconTrendingDown size={18} color="#b45309" /> Rekap Kewajiban Hutang ({rawHutangList.length})
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "2px 0 0 0" }}>
                Kewajiban kepada toko, supplier, atau kreditur
              </p>
            </div>
            <input
              type="text"
              placeholder="Cari pihak/toko..."
              className="form-control"
              style={{ maxWidth: "160px", padding: "4px 8px", fontSize: "12px" }}
              value={rekapSearchHutang}
              onChange={e => setRekapSearchHutang(e.target.value)}
            />
          </div>

          <div className={`table-responsive-desktop table-font-${tableFontSize}`}>
            <table className={`portal-table table-font-${tableFontSize}`}>
              <thead>
                <tr>
                  <th style={{ width: "35px", textAlign: "center" }}>No</th>
                  <th>Nama Pihak / Toko</th>
                  <th style={{ textAlign: "right" }}>Total Hutang</th>
                  <th style={{ textAlign: "right" }}>Total Bayar</th>
                  <th style={{ textAlign: "right" }}>Sisa Saldo</th>
                  <th style={{ textAlign: "center" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredHutangList.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "24px", color: "var(--text-muted)" }}>
                      {rekapSearchHutang ? "Tidak ditemukan nama pihak yang cocok" : "Belum ada catatan kewajiban hutang"}
                    </td>
                  </tr>
                ) : (
                  filteredHutangList.map((h, i) => {
                    const isLunas = parseFloat(h.saldo || 0) <= 0;
                    const percent = parseFloat(h.total_pinjam) > 0
                      ? Math.min(100, Math.round((parseFloat(h.total_bayar) / parseFloat(h.total_pinjam)) * 100))
                      : 100;
                    return (
                      <tr key={i}>
                        <td style={{ textAlign: "center", color: "var(--text-muted)" }}>{i + 1}</td>
                        <td>
                          <strong style={{ display: "block", color: "var(--text-main)" }}>
                            {h.party_name}
                            {h.transaction_count > 1 && (
                              <span style={{ fontSize: "11px", fontWeight: "normal", color: "#b45309", marginLeft: "6px" }}>
                                ({h.transaction_count} transaksi)
                              </span>
                            )}
                          </strong>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                            <div style={{ flex: 1, maxWidth: "60px", height: "4px", background: "#e2e8f0", borderRadius: "2px", overflow: "hidden" }}>
                              <div style={{ width: `${percent}%`, height: "100%", background: isLunas ? "#16a34a" : "#d97706" }}></div>
                            </div>
                            <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>{percent}%</span>
                          </div>
                        </td>
                        <td style={{ textAlign: "right" }}>{formatRupiah(h.total_pinjam)}</td>
                        <td style={{ textAlign: "right", color: "#16a34a", fontWeight: "600" }}>{formatRupiah(h.total_bayar)}</td>
                        <td style={{ textAlign: "right", fontWeight: "800", color: isLunas ? "var(--text-muted)" : "#b45309" }}>
                          {formatRupiah(h.saldo)}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span className={`badge-tag ${isLunas ? 'badge-income' : 'badge-expense'}`} style={{ fontSize: "10px" }}>
                            {isLunas ? "LUNAS" : "BELUM LUNAS"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {filteredHutangList.length > 0 && (
                <tfoot>
                  <tr style={{ background: "#fffbeb", fontWeight: "700", borderTop: "2px solid #fde68a" }}>
                    <td colSpan={2} style={{ textAlign: "right" }}>TOTAL:</td>
                    <td style={{ textAlign: "right" }}>{formatRupiah(totalHutangPinjam)}</td>
                    <td style={{ textAlign: "right", color: "#16a34a" }}>{formatRupiah(totalHutangBayar)}</td>
                    <td style={{ textAlign: "right", color: "#b45309", fontWeight: "800" }}>{formatRupiah(totalSisaHutang)}</td>
                    <td style={{ textAlign: "center" }}>
                      <span style={{ fontSize: "11px", color: "#b45309" }}>
                        {activeHutangCount} Aktif
                      </span>
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* PANEL 2: REKAP HAK PIUTANG */}
        <div className="desktop-panel">
          <div className="panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ display: "flex", alignItems: "center", gap: "8px", color: "#0284c7" }}>
                <IconTrendingUp size={18} color="#0284c7" /> Rekap Hak Piutang ({rawPiutangList.length})
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "2px 0 0 0" }}>
                Pinjaman yang diberikan pos ke unit/pihak lain
              </p>
            </div>
            <input
              type="text"
              placeholder="Cari peminjam..."
              className="form-control"
              style={{ maxWidth: "160px", padding: "4px 8px", fontSize: "12px" }}
              value={rekapSearchPiutang}
              onChange={e => setRekapSearchPiutang(e.target.value)}
            />
          </div>

          <div className={`table-responsive-desktop table-font-${tableFontSize}`}>
            <table className={`portal-table table-font-${tableFontSize}`}>
              <thead>
                <tr>
                  <th style={{ width: "35px", textAlign: "center" }}>No</th>
                  <th>Pihak Peminjam</th>
                  <th style={{ textAlign: "right" }}>Total Piutang</th>
                  <th style={{ textAlign: "right" }}>Sudah Kembali</th>
                  <th style={{ textAlign: "right" }}>Sisa Saldo</th>
                  <th style={{ textAlign: "center" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredPiutangList.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "24px", color: "var(--text-muted)" }}>
                      {rekapSearchPiutang ? "Tidak ditemukan nama pihak yang cocok" : "Belum ada catatan hak piutang"}
                    </td>
                  </tr>
                ) : (
                  filteredPiutangList.map((p, i) => {
                    const isLunas = parseFloat(p.saldo || 0) <= 0;
                    const percent = parseFloat(p.total_piutang) > 0
                      ? Math.min(100, Math.round((parseFloat(p.total_bayar) / parseFloat(p.total_piutang)) * 100))
                      : 100;
                    return (
                      <tr key={i}>
                        <td style={{ textAlign: "center", color: "var(--text-muted)" }}>{i + 1}</td>
                        <td>
                          <strong style={{ display: "block", color: "var(--text-main)" }}>
                            {p.party_name}
                            {p.transaction_count > 1 && (
                              <span style={{ fontSize: "11px", fontWeight: "normal", color: "#0284c7", marginLeft: "6px" }}>
                                ({p.transaction_count} transaksi)
                              </span>
                            )}
                          </strong>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                            <div style={{ flex: 1, maxWidth: "60px", height: "4px", background: "#e2e8f0", borderRadius: "2px", overflow: "hidden" }}>
                              <div style={{ width: `${percent}%`, height: "100%", background: isLunas ? "#16a34a" : "#0284c7" }}></div>
                            </div>
                            <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>{percent}%</span>
                          </div>
                        </td>
                        <td style={{ textAlign: "right" }}>{formatRupiah(p.total_piutang)}</td>
                        <td style={{ textAlign: "right", color: "#16a34a", fontWeight: "600" }}>{formatRupiah(p.total_bayar)}</td>
                        <td style={{ textAlign: "right", fontWeight: "800", color: isLunas ? "var(--text-muted)" : "#0284c7" }}>
                          {formatRupiah(p.saldo)}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span className={`badge-tag ${isLunas ? 'badge-income' : 'badge-pos'}`} style={{ fontSize: "10px" }}>
                            {isLunas ? "LUNAS" : "BELUM KEMBALI"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {filteredPiutangList.length > 0 && (
                <tfoot>
                  <tr style={{ background: "#f0f9ff", fontWeight: "700", borderTop: "2px solid #bae6fd" }}>
                    <td colSpan={2} style={{ textAlign: "right" }}>TOTAL:</td>
                    <td style={{ textAlign: "right" }}>{formatRupiah(totalPiutangPinjam)}</td>
                    <td style={{ textAlign: "right", color: "#16a34a" }}>{formatRupiah(totalPiutangBayar)}</td>
                    <td style={{ textAlign: "right", color: "#0284c7", fontWeight: "800" }}>{formatRupiah(totalSisaPiutang)}</td>
                    <td style={{ textAlign: "center" }}>
                      <span style={{ fontSize: "11px", color: "#0284c7" }}>
                        {activePiutangCount} Aktif
                      </span>
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>

      {/* BUKU JURNAL RIWAYAT TRANSAKSI HUTANG & PIUTANG */}
      <div className="desktop-panel">
        <div className="panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <IconFileText size={18} color="var(--primary)" /> Buku Jurnal Transaksi Hutang & Piutang ({debtsList.length})
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
              Rincian seluruh mutasi pinjam baru, belanja tempo, dan pembayaran cicilan
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            {/* Filter Jenis: Semua, Hutang, Piutang */}
            <div style={{ display: "inline-flex", background: "#f1f5f9", borderRadius: "8px", padding: "2px" }}>
              <button
                type="button"
                onClick={() => setJurnalTypeFilter("all")}
                style={{
                  border: "none",
                  padding: "5px 12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: jurnalTypeFilter === "all" ? "700" : "500",
                  background: jurnalTypeFilter === "all" ? "#ffffff" : "transparent",
                  color: jurnalTypeFilter === "all" ? "var(--primary)" : "var(--text-muted)",
                  boxShadow: jurnalTypeFilter === "all" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  cursor: "pointer"
                }}
              >
                Semua ({debtsList.length})
              </button>
              <button
                type="button"
                onClick={() => setJurnalTypeFilter("hutang")}
                style={{
                  border: "none",
                  padding: "5px 12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: jurnalTypeFilter === "hutang" ? "700" : "500",
                  background: jurnalTypeFilter === "hutang" ? "#ffffff" : "transparent",
                  color: jurnalTypeFilter === "hutang" ? "#b45309" : "var(--text-muted)",
                  boxShadow: jurnalTypeFilter === "hutang" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  cursor: "pointer"
                }}
              >
                Hutang Saja
              </button>
              <button
                type="button"
                onClick={() => setJurnalTypeFilter("piutang")}
                style={{
                  border: "none",
                  padding: "5px 12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: jurnalTypeFilter === "piutang" ? "700" : "500",
                  background: jurnalTypeFilter === "piutang" ? "#ffffff" : "transparent",
                  color: jurnalTypeFilter === "piutang" ? "#0284c7" : "var(--text-muted)",
                  boxShadow: jurnalTypeFilter === "piutang" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  cursor: "pointer"
                }}
              >
                Piutang Saja
              </button>
            </div>

            <input
              type="text"
              placeholder="Cari transaksi / pihak..."
              className="form-control"
              style={{ maxWidth: "180px", padding: "5px 10px", fontSize: "12px" }}
              value={jurnalSearch}
              onChange={e => setJurnalSearch(e.target.value)}
            />

            <TableActionMenu
              fontSize={tableFontSize}
              onFontSizeChange={setTableFontSize}
              onRefresh={handleRefresh}
              isRefreshing={isRefreshing}
            />
          </div>
        </div>

        {!isReadOnly && (
          <BulkActionBar
            selectedCount={selectedCount}
            totalItems={filteredDebtsList.length}
            paginatedCount={paginatedItems.length}
            entityName="catatan hutang/piutang"
            onClearSelection={clearSelection}
            onSelectAllFiltered={selectAllFiltered}
            onBulkDelete={handleTriggerBulkDelete}
            isDeleting={isBulkDeleting}
          />
        )}

        <div className={`table-responsive-desktop table-font-${tableFontSize}`}>
          <table className={`portal-table table-font-${tableFontSize}`}>
            <thead>
              <tr>
                {!isReadOnly && (
                  <th style={{ width: "40px", textAlign: "center" }}>
                    <input
                      type="checkbox"
                      className="portal-checkbox"
                      title="Pilih Semua di Halaman Ini"
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isSomeSelected;
                      }}
                      onChange={toggleSelectAll}
                    />
                  </th>
                )}
                <th>Tanggal</th>
                <th>Pos Program</th>
                <th>Pihak Terkait</th>
                <th>Jenis Mutasi</th>
                <th>Keterangan / Uraian</th>
                <th style={{ textAlign: "right" }}>Nominal</th>
                {!isReadOnly && <th style={{ textAlign: "center" }}>Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={!isReadOnly ? 8 : 7} style={{ textAlign: "center", padding: "28px", color: "var(--text-muted)" }}>
                    Belum ada riwayat transaksi hutang atau piutang yang cocok.
                  </td>
                </tr>
              ) : (
                paginatedItems.map(d => {
                  const isHutang = d.type.startsWith("hutang");
                  const isPinjam = d.type.includes("pinjam");
                  return (
                    <tr key={d.id} className={selectedIds.has(d.id) ? "row-selected" : ""}>
                      {!isReadOnly && (
                        <td style={{ textAlign: "center" }}>
                          <input
                            type="checkbox"
                            className="portal-checkbox"
                            checked={selectedIds.has(d.id)}
                            onChange={() => toggleSelect(d.id)}
                          />
                        </td>
                      )}
                      <td><code>{d.transaction_date}</code></td>
                      <td><span className="badge-tag badge-pos">{d.pos_code}</span></td>
                      <td style={{ fontWeight: "700" }}>{d.party_name}</td>
                      <td>
                        <span className={`badge-tag ${isHutang ? (isPinjam ? 'badge-expense' : 'badge-income') : (isPinjam ? 'badge-pos' : 'badge-income')}`}>
                          {d.type.replace(/_/g, ' ').toUpperCase()}
                        </span>
                        {d.source_pos_tx_id && (
                          <span className="badge-tag" style={{ marginLeft: "4px", fontSize: "10px", background: "#ecfdf5", color: "#065f46", border: "1px solid #a7f3d0" }}>
                            KAS POS
                          </span>
                        )}
                      </td>
                      <td>{d.description || "-"}</td>
                      <td style={{ textAlign: "right", fontWeight: "700" }}>
                        <span className={isPinjam ? (isHutang ? "color-expense" : "color-income") : "color-income"}>
                          {formatRupiah(d.amount)}
                        </span>
                      </td>
                      {!isReadOnly && (
                        <td style={{ textAlign: "center" }}>
                          <button
                            type="button"
                            title="Hapus Transaksi"
                            onClick={() => handleHapusDebt(d)}
                            style={{ background: "#fee2e2", color: "#b91c1c", border: "none", padding: "4px 8px", borderRadius: "6px", cursor: "pointer" }}
                          >
                            <IconTrash size={14} />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredDebtsList.length}
          displayStart={displayStart}
          displayEnd={displayEnd}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* MODAL POPUP: FORM CATAT PENYESUAIAN HUTANG / PIUTANG BARU */}
      {showAddModal && (
        <div className="modal-backdrop-custom" onClick={() => setShowAddModal(false)}>
          <div
            className="modal-box-custom"
            role="dialog"
            aria-modal="true"
            style={{ maxWidth: "560px" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header-custom" style={{ background: "#f0f9ff", borderBottomColor: "#bae6fd" }}>
              <h3 style={{ display: "flex", alignItems: "center", gap: "8px", color: "#0369a1", margin: 0 }}>
                <IconPlusCircle size={20} color="#0284c7" /> Catat Penyesuaian Hutang / Piutang
              </h3>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setShowAddModal(false)}
                title="Tutup"
              >
                <IconX size={18} />
              </button>
            </div>

            <form onSubmit={handleModalSubmit}>
              <div className="modal-body-custom" style={{ padding: "20px" }}>
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "10px 12px", borderRadius: "8px", marginBottom: "16px", fontSize: "12px", color: "#166534" }}>
                  💡 <strong>Info:</strong> Transaksi yang dicatat di sini otomatis disinkronkan ke dalam arus <strong>Kas & Belanja Pos</strong>.
                </div>

                <div className="form-group">
                  <label className="form-label">Pos Program</label>
                  <CustomDropdown
                    value={debtFormCatId || selectedPosScope}
                    onChange={e => setDebtFormCatId(e.target.value)}
                    searchable={categories.filter(c => c.is_active).length > 5}
                    searchPlaceholder="Cari pos..."
                    options={categories.filter(c => c.is_active).map(c => ({
                      value: c.id,
                      label: `[${c.code}] ${c.name}`
                    }))}
                    required
                  />
                </div>

                <div className="form-grid-2col">
                  <div className="form-group">
                    <label className="form-label">Tanggal Transaksi</label>
                    <CustomDatePicker value={debtFormTgl} onChange={e => setDebtFormTgl(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Jenis Transaksi</label>
                    <CustomDropdown
                      value={debtFormType}
                      onChange={e => setDebtFormType(e.target.value)}
                      options={[
                        { value: "hutang_pinjam", label: "Hutang: Pinjam Dana / Tempo (Pinjam Baru)" },
                        { value: "hutang_bayar", label: "Hutang: Bayar Cicilan (Pelunasan Hutang)" },
                        { value: "piutang_pinjam", label: "Piutang: Memberi Pinjaman ke Pihak Lain" },
                        { value: "piutang_bayar", label: "Piutang: Terima Pembayaran Piutang" }
                      ]}
                    />
                  </div>
                </div>

                <div className="form-grid-2col">
                  <div className="form-group">
                    <label className="form-label">Nama Pihak / Toko / Supplier</label>
                    <input
                      className="form-control"
                      type="text"
                      list="debt-party-datalist"
                      placeholder="Contoh: Pujasera / Toko Bangunan Berkah"
                      value={debtFormParty}
                      onChange={e => setDebtFormParty(e.target.value)}
                      required
                    />
                    <datalist id="debt-party-datalist">
                      {knownParties.map((p, idx) => (
                        <option key={idx} value={p} />
                      ))}
                    </datalist>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nominal (Rp)</label>
                    <input
                      className="form-control"
                      type="number"
                      placeholder="1000000"
                      value={debtFormAmount}
                      onChange={e => setDebtFormAmount(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Keterangan / Keperluan</label>
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Contoh: Pinjaman talangan pembelian material..."
                    value={debtFormDesc}
                    onChange={e => setDebtFormDesc(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer-custom">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <IconCheckCircle size={16} color="white" />
                  <span>Simpan Transaksi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
