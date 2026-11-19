import React, { useState } from "react";
import {
  IconFolderPos,
  IconTrendingUp,
  IconUsers,
  IconPieChart,
  IconClock,
  IconCheckCircle,
  IconChevronRight
} from "../../Icons";
import { formatRupiah, formatCompactRupiah, formatPosNameShort, POS_ABBREVIATIONS } from "../../utils/formatters";
import TableActionMenu from "../common/TableActionMenu";

export default function DonaturDashboard({
  stats,
  allTransactions = [],
  categories = [],
  onNavigatePos
}) {
  const [hoveredPos, setHoveredPos] = useState(null);
  const [tableFontSize, setTableFontSize] = useState("compact");

  // Transaksi donasi masuk
  const incomeTransactions = allTransactions.filter(t => (t.jenis || t.tx_type) === "income");
  const totalIncome = stats?.total_income != null ? stats.total_income : incomeTransactions.reduce((s, t) => s + (t.amount || t.nominal || 0), 0);
  const totalDonors = stats?.total_donors != null ? stats.total_donors : new Set(incomeTransactions.map(t => t.donatur || t.donor_name)).size;
  const activeCategories = categories.filter(c => c.is_active !== false);

  // Data Distribusi Donasi per Pos Program
  const posSummaryList = (stats?.category_summary || []).length > 0
    ? stats.category_summary
    : categories.map(c => {
        const catInc = incomeTransactions.filter(t => (t.category_id === c.id || t.kategori_id === c.id))
          .reduce((s, t) => s + (t.amount || t.nominal || 0), 0);
        return {
          id: c.id,
          name: c.name || c.nama_kategori,
          code: c.code,
          income: catInc
        };
      });

  const totalPosIncome = posSummaryList.reduce((acc, pos) => acc + (pos.income > 0 ? pos.income : 0), 0) || totalIncome || 1;

  // Palet warna untuk irisan diagram lingkaran
  const palette = [
    { main: "#0284c7", light: "#f0f9ff", border: "#38bdf8" },
    { main: "#2563eb", light: "#eff6ff", border: "#3b82f6" },
    { main: "#8b5cf6", light: "#f5f3ff", border: "#a78bfa" },
    { main: "#f59e0b", light: "#fffbeb", border: "#fbbf24" },
    { main: "#06b6d4", light: "#ecfeff", border: "#22d3ee" },
    { main: "#ec4899", light: "#fdf2f8", border: "#f472b6" },
    { main: "#14b8a6", light: "#f0fdfa", border: "#2dd4bf" },
    { main: "#6366f1", light: "#eef2ff", border: "#818cf8" }
  ];

  // Hitung SVG Donut Slices (stroke-dasharray / stroke-dashoffset)
  const donutRadius = 65;
  const donutCircumference = 2 * Math.PI * donutRadius;
  let cumulativePct = 0;

  const donutSlices = posSummaryList.map((pos, idx) => {
    const val = pos.income || 0;
    const pct = totalPosIncome > 0 ? (val / totalPosIncome) * 100 : 0;
    const strokeDasharray = `${(pct / 100) * donutCircumference} ${donutCircumference}`;
    const strokeDashoffset = -(cumulativePct / 100) * donutCircumference;
    cumulativePct += pct;
    const color = palette[idx % palette.length];
    return {
      ...pos,
      val,
      pct,
      color,
      strokeDasharray,
      strokeDashoffset
    };
  });

  return (
    <div className="dashboard-blade-layout" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* 1. HERO BANNER SAMBUTAN */}
      <div
        style={{
          background: "linear-gradient(135deg, #0369a1 0%, #0284c7 60%, #0284c7 100%)",
          borderRadius: "20px",
          padding: "26px 30px",
          color: "#ffffff",
          boxShadow: "0 12px 30px -5px rgba(3, 105, 161, 0.3)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px"
        }}
      >
        <div style={{ maxWidth: "600px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.18)", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 700, marginBottom: "10px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#7dd3fc", display: "inline-block" }}></span>
            Portal Transparansi & Akuntabilitas Donasi
          </div>
          <h2 style={{ margin: "0 0 8px 0", fontSize: "24px", fontWeight: 800, letterSpacing: "-0.02em" }}>
            Ahlan Wa Sahlan, Para Dermawan & Muhsinin
          </h2>
          <p style={{ margin: 0, fontSize: "14px", opacity: 0.92, lineHeight: 1.6 }}>
            Laporan keterbukaan dana infaq, shadaqah, serta wakaf Pondok Pesantren Annuqayah Latee Guluk-Guluk Sumenep.
          </p>
        </div>
        <div style={{ textAlign: "right", background: "rgba(255,255,255,0.12)", padding: "16px 24px", borderRadius: "14px", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)" }}>
          <div style={{ fontSize: "12px", opacity: 0.9, fontWeight: 600 }}>Total Dana Donasi Terhimpun</div>
          <div style={{ fontSize: "24px", fontWeight: 900, marginTop: "4px", letterSpacing: "-0.5px" }}>{formatRupiah(totalIncome)}</div>
        </div>
      </div>

      {/* 2. STATS CARDS (MENGGUNAKAN BLADE-CARD STYLE) */}
      <div className="blade-stats-grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
        {/* KARTU 1: TOTAL DONASI MASUK */}
        <div className="blade-card emerald group">
          <div className="blade-card-top-bar emerald"></div>
          <div className="blade-card-blur emerald"></div>
          <div className="blade-card-inner">
            <div>
              <p className="blade-card-label">Total Donasi Diterima</p>
              <h3 className="blade-card-value">{formatRupiah(totalIncome)}</h3>
              <p className="blade-card-desc">
                {incomeTransactions.length} Transaksi Penerimaan Tercatat
              </p>
            </div>
            <div className="blade-card-icon emerald">
              <IconTrendingUp size={24} color="white" />
            </div>
          </div>
          <div className="blade-card-footer emerald">
            <span className="blade-footer-dot emerald"></span>
            <span>Dana Umat Terverifikasi</span>
          </div>
        </div>

        {/* KARTU 2: JUMLAH DONATUR */}
        <div className="blade-card blue group">
          <div className="blade-card-top-bar blue"></div>
          <div className="blade-card-blur blue"></div>
          <div className="blade-card-inner">
            <div>
              <p className="blade-card-label">Donatur Terdaftar</p>
              <h3 className="blade-card-value">{totalDonors} Orang</h3>
              <p className="blade-card-desc">Muhsinin & Dermawan</p>
            </div>
            <div className="blade-card-icon blue">
              <IconUsers size={24} color="white" />
            </div>
          </div>
          <div className="blade-card-footer blue">
            <span className="blade-footer-dot blue"></span>
            <span>Partisipasi Masyarakat</span>
          </div>
        </div>

        {/* KARTU 3: POS PROGRAM AKTIF */}
        <div className="blade-card violet group">
          <div className="blade-card-top-bar violet"></div>
          <div className="blade-card-blur violet"></div>
          <div className="blade-card-inner">
            <div>
              <p className="blade-card-label">Pos Program Aktif</p>
              <h3 className="blade-card-value">{activeCategories.length} Pos</h3>
              <p className="blade-card-desc">Pembangunan & Kegiatan Santri</p>
            </div>
            <div className="blade-card-icon violet">
              <IconFolderPos size={24} color="white" />
            </div>
          </div>
          <div className="blade-card-footer violet">
            <span className="blade-footer-dot violet"></span>
            <span>Alokasi & Penyaluran</span>
          </div>
        </div>
      </div>

      {/* 3. DISTRIBUSI POS PROGRAM (DONUT CHART & LIST DENGAN PROPORSI PAS) */}
      <div className="desktop-panel">
        <div className="panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
              <IconPieChart size={18} color="var(--primary)" />
              Distribusi Donasi per Pos Program
            </h3>
            <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "var(--text-muted)" }}>
              Klik pada salah satu pos untuk membuka daftar nama donatur yang menyalurkan donasi ke pos tersebut.
            </p>
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#f8fafc", padding: "6px 12px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#475569" }}>
              {posSummaryList.length} Pos Terdaftar
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "32px", flexWrap: "wrap", marginTop: "12px" }}>
          {/* SVG Donut Chart (Proporsional & Ringkas) */}
          <div style={{ position: "relative", width: "190px", height: "190px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="190" height="190" viewBox="0 0 190 190" style={{ transform: "rotate(-90deg)" }}>
              {/* Background Track Circle */}
              <circle
                cx="95"
                cy="95"
                r={donutRadius}
                fill="transparent"
                stroke="#f1f5f9"
                strokeWidth="18"
              />
              {/* Slices */}
              {donutSlices.map((slice, idx) => {
                if (slice.pct <= 0) return null;
                const isHovered = hoveredPos?.id === slice.id;
                return (
                  <circle
                    key={idx}
                    cx="95"
                    cy="95"
                    r={donutRadius}
                    fill="transparent"
                    stroke={slice.color.main}
                    strokeWidth={isHovered ? "22" : "16"}
                    strokeDasharray={slice.strokeDasharray}
                    strokeDashoffset={slice.strokeDashoffset}
                    style={{
                      transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                      cursor: onNavigatePos ? "pointer" : "default",
                      opacity: hoveredPos ? (isHovered ? 1 : 0.4) : 1
                    }}
                    onMouseEnter={() => setHoveredPos(slice)}
                    onMouseLeave={() => setHoveredPos(null)}
                    onClick={() => onNavigatePos && onNavigatePos(slice.id)}
                  />
                );
              })}
            </svg>

            {/* Donut Center Info */}
            <div
              style={{
                position: "absolute",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
                width: "120px"
              }}
            >
              <span style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {hoveredPos ? hoveredPos.code : "Total"}
              </span>
              <span style={{ fontSize: "15px", fontWeight: "900", color: "#0f172a", lineHeight: 1.2 }}>
                {hoveredPos ? `${hoveredPos.pct.toFixed(1)}%` : formatCompactRupiah(totalPosIncome)}
              </span>
              <span style={{ fontSize: "10px", fontWeight: "700", color: hoveredPos ? hoveredPos.color.main : "#0284c7", marginTop: "2px" }}>
                {hoveredPos ? formatCompactRupiah(hoveredPos.val) : "Akumulasi"}
              </span>
            </div>
          </div>

          {/* List Item Distribusi Pos (Lebar Terkontrol & Menggunakan Singkatan Nama) */}
          <div style={{ flex: 1, minWidth: "280px", maxWidth: "580px", display: "flex", flexDirection: "column", gap: "10px" }}>
            {posSummaryList.slice(0, 5).map((pos, idx) => {
              const val = pos.income || 0;
              const pct = totalPosIncome > 0 ? (val / totalPosIncome) * 100 : 0;
              const col = palette[idx % palette.length];
              const isHovered = hoveredPos?.id === pos.id;
              const shortName = formatPosNameShort(pos.name);

              return (
                <div
                  key={pos.id || idx}
                  onClick={() => onNavigatePos && onNavigatePos(pos.id)}
                  onMouseEnter={() => setHoveredPos({ ...pos, pct, val, color: col })}
                  onMouseLeave={() => setHoveredPos(null)}
                  title={`Nama Lengkap: ${pos.name}`}
                  style={{
                    padding: "9px 14px",
                    borderRadius: "12px",
                    border: `1px solid ${isHovered ? col.border : "#e2e8f0"}`,
                    background: isHovered ? col.light : "#f8fafc",
                    cursor: "pointer",
                    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ width: "10px", height: "10px", borderRadius: "3px", background: col.main, flexShrink: 0 }}></span>
                      <span style={{ fontWeight: 700, fontSize: "13px", color: "#1e293b" }}>{shortName}</span>
                      {pos.code && (
                        <span style={{ fontSize: "10px", fontWeight: "800", color: "#64748b", background: "#e2e8f0", padding: "1px 5px", borderRadius: "4px" }}>
                          {pos.code}
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontWeight: 700, fontSize: "13px", color: col.main }}>
                        {formatRupiah(val)}
                      </span>
                      <span style={{ fontSize: "11px", fontWeight: "800", color: isHovered ? col.main : "#64748b", background: isHovered ? "rgba(255,255,255,0.8)" : "#e2e8f0", padding: "1px 6px", borderRadius: "6px", minWidth: "42px", textAlign: "right" }}>
                        {pct.toFixed(1)}%
                      </span>
                      <IconChevronRight size={14} color="#94a3b8" />
                    </div>
                  </div>
                  <div style={{ height: "5px", width: "100%", background: "#e2e8f0", borderRadius: "9999px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, background: col.main, borderRadius: "9999px", transition: "width 0.5s ease" }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Indikator Singkatan Standar Sistem */}
        <div style={{ marginTop: "14px", borderTop: "1px dashed #e2e8f0", paddingTop: "10px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", fontSize: "11px", color: "#64748b" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, color: "#475569" }}>Keterangan Singkatan:</span>
            {POS_ABBREVIATIONS.slice(0, 4).map((abbr, i) => (
              <span key={i} style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px" }}>
                <strong>{abbr.short}</strong> = {abbr.full}
              </span>
            ))}
          </div>
          <span style={{ fontStyle: "italic" }}>Arahkan kursor ke pos untuk melihat nama lengkap</span>
        </div>
      </div>

      {/* 4. DAFTAR KATALOG POS PROGRAM */}
      <div className="desktop-panel">
        <div className="panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
              <IconFolderPos size={18} color="var(--primary)" />
              Daftar Pos Program Donasi
            </h3>
            <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "var(--text-muted)" }}>
              Pilih pos program untuk melihat data donatur dan laporan rinciannya.
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
            gap: "14px",
            marginTop: "14px"
          }}
        >
          {activeCategories.map((cat, idx) => {
            const col = palette[idx % palette.length];
            return (
              <div
                key={cat.id}
                onClick={() => onNavigatePos && onNavigatePos(cat.id)}
                className="catalog-pos-card"
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span
                    className="catalog-pos-code-badge"
                    style={{
                      color: col.main
                    }}
                  >
                    {cat.code || "POS"}
                  </span>
                  <IconChevronRight size={15} color="var(--text-muted)" />
                </div>
                <div className="catalog-pos-title">
                  {cat.name || cat.nama_kategori}
                </div>
                {cat.description && (
                  <div className="catalog-pos-desc" style={{ WebkitLineClamp: 2, display: "-webkit-box", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {cat.description}
                  </div>
                )}
                <div className="catalog-pos-link" style={{ marginTop: "auto", paddingTop: "8px", color: col.main }}>
                  Lihat Donatur Pos →
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. AKTIVITAS DONASI TERBARU */}
      <div className="desktop-panel">
        <div className="panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
              <IconClock size={18} color="var(--primary)" />
              Aktivitas Donasi Terkini
            </h3>
            <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "var(--text-muted)" }}>
              Riwayat donasi masuk terkini yang terverifikasi ke dalam sistem keuangan pesantren.
            </p>
          </div>
          <TableActionMenu
            fontSize={tableFontSize}
            onFontSizeChange={setTableFontSize}
          />
        </div>

        <div className={`table-responsive table-font-${tableFontSize}`} style={{ marginTop: "14px" }}>
          {incomeTransactions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>Belum ada aktivitas donasi tercatat.</div>
          ) : (
            <table className={`desktop-table table-font-${tableFontSize}`} style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th style={{ width: "120px" }}>Tanggal</th>
                  <th>Nama Donatur</th>
                  <th>Pos Program</th>
                  <th>Akad / Keterangan</th>
                  <th style={{ textAlign: "right", width: "160px" }}>Nominal</th>
                </tr>
              </thead>
              <tbody>
                {incomeTransactions.slice(0, 8).map((tx, idx) => {
                  const donorName = tx.donatur || tx.donor_name || "Hamba Allah";
                  const dateStr = tx.tanggal || tx.transaction_date || "-";
                  const posName = tx.pos_program || tx.category_name || "-";
                  const descStr = tx.keterangan || tx.description || "-";
                  const amountVal = tx.nominal || tx.amount || 0;

                  return (
                    <tr key={tx.id || idx}>
                      <td style={{ fontSize: "13px", color: "#64748b", whiteSpace: "nowrap" }}>{dateStr}</td>
                      <td>
                        <div style={{ fontWeight: 600, color: "#1e293b", display: "flex", alignItems: "center", gap: "6px" }}>
                          <span
                            style={{
                              width: "22px",
                              height: "22px",
                              borderRadius: "50%",
                              background: "rgba(3, 105, 161, 0.12)",
                              color: "#0284c7",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "10px",
                              fontWeight: 700
                            }}
                          >
                            {donorName.charAt(0).toUpperCase()}
                          </span>
                          <span>{donorName}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: "13px" }}>
                        <span className="badge badge-info" style={{ fontSize: "11px" }}>{posName}</span>
                      </td>
                      <td style={{ fontSize: "13px", color: "#64748b" }}>{descStr}</td>
                      <td style={{ textAlign: "right", fontWeight: 700, color: "#0284c7", fontSize: "14px", whiteSpace: "nowrap" }}>
                        {formatRupiah(amountVal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
