import { useState } from "react";
import {
  IconScale,
  IconTrendingUp,
  IconTrendingDown,
  IconUsers,
  IconPieChart
} from "../../Icons";
import { formatRupiah, formatCompactRupiah, formatPosNameShort, POS_ABBREVIATIONS } from "../../utils/formatters";

export default function DashboardOverview({
  stats,
  allTransactions = [],
  donorsList = [],
  barangList = [],
  categories = [],
  chartTimeFrame = "monthly",
  setChartTimeFrame,
  activeChartMetric = "income",
  setActiveChartMetric,
  onNavigatePos
}) {
  const [hoveredPos, setHoveredPos] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Data tren dari stats backend
  const trendData =
    chartTimeFrame === "monthly"
      ? stats?.monthly_trends || []
      : stats?.yearly_trends || [];

  // Hitung Nilai Max untuk Skala Grafik
  const maxVal = Math.max(
    ...trendData.map((d) => {
      if (activeChartMetric === "income") return d.income || 0;
      if (activeChartMetric === "expense") return d.expense || 0;
      return Math.abs(d.net || 0);
    }),
    1000000
  );

  // SVG Line Chart Dimensions
  const svgWidth = 800;
  const svgHeight = 220;
  const paddingX = 58;
  const paddingTop = 25;
  const paddingBottom = 40;
  const chartAreaWidth = svgWidth - paddingX * 2;
  const chartAreaHeight = svgHeight - paddingTop - paddingBottom;

  const points = trendData.map((d, index) => {
    const x =
      trendData.length > 1
        ? paddingX + (index / (trendData.length - 1)) * chartAreaWidth
        : paddingX + chartAreaWidth / 2;
    const val =
      activeChartMetric === "income"
        ? d.income || 0
        : activeChartMetric === "expense"
        ? d.expense || 0
        : Math.max(0, d.net || 0);
    const y = paddingTop + chartAreaHeight - (val / maxVal) * chartAreaHeight;
    return { ...d, x, y, val };
  });

  const pathD = points.reduce(
    (acc, p, idx) => (idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
    ""
  );

  const areaD =
    points.length > 0
      ? `${pathD} L ${points[points.length - 1].x} ${paddingTop + chartAreaHeight} L ${points[0].x} ${paddingTop + chartAreaHeight} Z`
      : "";

  const strokeColor =
    activeChartMetric === "income"
      ? "#0284c7"
      : activeChartMetric === "expense"
      ? "#dc2626"
      : "#2563eb";

  const fillColor =
    activeChartMetric === "income"
      ? "url(#grad-income)"
      : activeChartMetric === "expense"
      ? "url(#grad-expense)"
      : "url(#grad-net)";

  // === DATA DISTRIBUSI POS PROGRAM (PIE / DONUT CHART) ===
  const posSummaryList = (stats?.category_summary || []).length > 0
    ? stats.category_summary
    : categories.map(c => {
        const catInc = allTransactions.filter(t => t.jenis === 'income' && t.category_id === c.id).reduce((s, t) => s + (t.amount || 0), 0);
        const catExp = allTransactions.filter(t => t.jenis === 'expense' && t.category_id === c.id).reduce((s, t) => s + (t.amount || 0), 0);
        return {
          id: c.id,
          name: c.name,
          code: c.code,
          income: catInc,
          expense: catExp,
          net_balance: catInc - catExp
        };
      });

  const totalPosMetric = posSummaryList.reduce((acc, pos) => {
    const val = activeChartMetric === "expense" ? pos.expense : pos.income;
    return acc + (val > 0 ? val : 0);
  }, 0) || 1;

  // Palet warna untuk irisan diagram lingkaran
  const palette = [
    { main: "#0284c7", light: "#f0f9ff", border: "#38bdf8", name: "Emerald" },
    { main: "#2563eb", light: "#eff6ff", border: "#3b82f6", name: "Blue" },
    { main: "#8b5cf6", light: "#f5f3ff", border: "#a78bfa", name: "Violet" },
    { main: "#f59e0b", light: "#fffbeb", border: "#fbbf24", name: "Amber" },
    { main: "#06b6d4", light: "#ecfeff", border: "#22d3ee", name: "Cyan" },
    { main: "#ec4899", light: "#fdf2f8", border: "#f472b6", name: "Pink" },
    { main: "#14b8a6", light: "#f0fdfa", border: "#2dd4bf", name: "Teal" },
    { main: "#6366f1", light: "#eef2ff", border: "#818cf8", name: "Indigo" },
  ];

  // Hitung SVG Donut Slices (stroke-dasharray / stroke-dashoffset)
  const donutRadius = 70;
  const donutCircumference = 2 * Math.PI * donutRadius;
  let cumulativePct = 0;

  const donutSlices = posSummaryList.map((pos, idx) => {
    const val = (activeChartMetric === "expense" ? pos.expense : pos.income) || 0;
    const pct = totalPosMetric > 0 ? (val / totalPosMetric) * 100 : 0;
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
    <div className="dashboard-blade-layout">
      {/* Header Pusat Kendali */}
      <div className="blade-header-row">
        <div>
          <p className="blade-eyebrow">Pusat Kendali Keuangan</p>
          <h1 className="blade-main-title">Ringkasan Sistem Donasi</h1>
          <p className="blade-sub-desc">
            Pantau arus kas riil, penerimaan donasi, realisasi belanja pos, logistik, dan hutang-piutang dalam satu tampilan.
          </p>
        </div>
        <div className="blade-status-badge">
          <span className="blade-status-dot"></span>
          <span>Data Sistem Aktif</span>
        </div>
      </div>

      {/* 4 Stat Cards Modern */}
      <div className="blade-stats-grid">
        {/* KARTU 1: TOTAL HARTA LANCAR */}
        <div className="blade-card blue group">
          <div className="blade-card-top-bar blue"></div>
          <div className="blade-card-blur blue"></div>
          <div className="blade-card-inner">
            <div>
              <p className="blade-card-label">Harta Lancar</p>
              <h3 className="blade-card-value">{formatRupiah(stats?.total_assets)}</h3>
              <p className="blade-card-desc">Kas & Bank Pesantren</p>
            </div>
            <div className="blade-card-icon blue">
              <IconScale size={24} color="white" />
            </div>
          </div>
          <div className="blade-card-footer blue">
            <span className="blade-footer-dot blue"></span>
            <span>
              Kas: {formatRupiah(stats?.accounts?.find((a) => a.name.includes("Kas"))?.balance)} • BNI:{" "}
              {formatRupiah(stats?.accounts?.find((a) => a.name.includes("BNI"))?.balance)}
            </span>
          </div>
        </div>

        {/* KARTU 2: PENERIMAAN DONASI */}
        <div className="blade-card emerald group">
          <div className="blade-card-top-bar emerald"></div>
          <div className="blade-card-blur emerald"></div>
          <div className="blade-card-inner">
            <div>
              <p className="blade-card-label">Donasi Masuk</p>
              <h3 className="blade-card-value">{formatRupiah(stats?.total_income)}</h3>
              <p className="blade-card-desc">
                {allTransactions.filter((t) => t.jenis === "income").length} Transaksi Penerimaan
              </p>
            </div>
            <div className="blade-card-icon emerald">
              <IconTrendingUp size={24} color="white" />
            </div>
          </div>
          <div className="blade-card-footer emerald">
            <span className="blade-footer-dot emerald"></span>
            <span>Arus Donasi Terverifikasi</span>
          </div>
        </div>

        {/* KARTU 3: PENGELUARAN POS */}
        <div className="blade-card amber group">
          <div className="blade-card-top-bar amber"></div>
          <div className="blade-card-blur amber"></div>
          <div className="blade-card-inner">
            <div>
              <p className="blade-card-label">Realisasi Pos</p>
              <h3 className="blade-card-value">{formatRupiah(stats?.total_expense)}</h3>
              <p className="blade-card-desc">
                {allTransactions.filter((t) => t.jenis === "expense").length} Realisasi Belanja
              </p>
            </div>
            <div className="blade-card-icon amber">
              <IconTrendingDown size={24} color="white" />
            </div>
          </div>
          <div className="blade-card-footer amber">
            <span className="blade-footer-dot amber"></span>
            <span>Pengeluaran Pembangunan</span>
          </div>
        </div>

        {/* KARTU 4: DONATUR & LOGISTIK */}
        <div className="blade-card violet group">
          <div className="blade-card-top-bar violet"></div>
          <div className="blade-card-blur violet"></div>
          <div className="blade-card-inner">
            <div>
              <p className="blade-card-label">Donatur & Logistik</p>
              <h3 className="blade-card-value">{donorsList.length} Donatur</h3>
              <p className="blade-card-desc">{barangList.length} Penerimaan Material</p>
            </div>
            <div className="blade-card-icon violet">
              <IconUsers size={24} color="white" />
            </div>
          </div>
          <div className="blade-card-footer violet">
            <span className="blade-footer-dot violet"></span>
            <span>Akumulasi Donasi & Barang</span>
          </div>
        </div>
      </div>

      {/* GRID 2 KOLOM: GRAFIK TREN KEUANGAN & DIAGRAM PIE / DONUT DISTRIBUSI POS */}
      <div className="dashboard-charts-2col">
        
        {/* PANEL 1: LINE CHART STATISTIK TREN KEUANGAN */}
        <div className="blade-stats-chart-card">
          <div>
            <div className="chart-header-row">
              <div>
                <div className="chart-badge-tag">Analitik Tren Keuangan</div>
                <h3 className="chart-main-title">
                  {chartTimeFrame === "monthly" ? "Grafik Fluktuasi Bulanan" : "Grafik Perkembangan Tahunan"}
                </h3>
                <p className="chart-sub-desc">
                  Kurva perkembangan {activeChartMetric === "income" ? "penerimaan donasi" : activeChartMetric === "expense" ? "pengeluaran belanja" : "surplus kas bersih"}.
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <div className="chart-metric-toggle">
                  <button
                    type="button"
                    className={`btn-metric-toggle ${activeChartMetric === "income" ? "active income" : ""}`}
                    onClick={() => setActiveChartMetric("income")}
                  >
                    Masuk
                  </button>
                  <button
                    type="button"
                    className={`btn-metric-toggle ${activeChartMetric === "expense" ? "active expense" : ""}`}
                    onClick={() => setActiveChartMetric("expense")}
                  >
                    Keluar
                  </button>
                  <button
                    type="button"
                    className={`btn-metric-toggle ${activeChartMetric === "net" ? "active net" : ""}`}
                    onClick={() => setActiveChartMetric("net")}
                  >
                    Surplus
                  </button>
                </div>

                <div className="mode-toggle-group">
                  <button
                    type="button"
                    className={`mode-toggle-btn ${chartTimeFrame === "monthly" ? "active" : ""}`}
                    onClick={() => setChartTimeFrame("monthly")}
                  >
                    12 Bln
                  </button>
                  <button
                    type="button"
                    className={`mode-toggle-btn ${chartTimeFrame === "yearly" ? "active" : ""}`}
                    onClick={() => setChartTimeFrame("yearly")}
                  >
                    Thn
                  </button>
                </div>
              </div>
            </div>

            {/* Line Chart Interactive SVG */}
            <div className="svg-chart-wrapper" style={{ position: "relative", minHeight: "220px" }}>
              {trendData.length === 0 ? (
                <div style={{ padding: "40px 20px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
                  Belum ada data transaksi tercatat untuk periode ini.
                </div>
              ) : (
                <svg
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  className="interactive-line-chart"
                  style={{ width: "100%", height: "auto", overflow: "visible" }}
                >
                  <defs>
                    <linearGradient id="grad-income" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="grad-expense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="grad-net" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                    const y = paddingTop + chartAreaHeight * (1 - pct);
                    return (
                      <g key={idx}>
                        <line
                          x1={paddingX}
                          y1={y}
                          x2={svgWidth - paddingX}
                          y2={y}
                          stroke="#e2e8f0"
                          strokeDasharray="4 4"
                          strokeWidth="1"
                        />
                        <text
                          x={paddingX - 8}
                          y={y + 3}
                          fontSize="9.5"
                          fill="#94a3b8"
                          textAnchor="end"
                          fontWeight="600"
                        >
                          {pct === 0 ? "0" : formatCompactRupiah(maxVal * pct).replace("Rp ", "")}
                        </text>
                      </g>
                    );
                  })}

                  {/* Area Shadow */}
                  {areaD && <path d={areaD} fill={fillColor} />}

                  {/* Curve Line */}
                  {pathD && (
                    <path
                      d={pathD}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* Points & Labels */}
                  {points.map((p, idx) => (
                    <g
                      key={idx}
                      className="chart-point-group"
                      onMouseEnter={() => setHoveredPoint(p)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    >
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={hoveredPoint?.label === p.label ? 7 : 4.5}
                        fill="#ffffff"
                        stroke={strokeColor}
                        strokeWidth="3"
                        className="chart-circle-point"
                      />
                      <text
                        x={p.x}
                        y={svgHeight - 12}
                        fontSize="10"
                        fill={hoveredPoint?.label === p.label ? strokeColor : "#64748b"}
                        textAnchor="middle"
                        fontWeight={hoveredPoint?.label === p.label ? "800" : "600"}
                      >
                        {p.month_name || p.label}
                      </text>
                    </g>
                  ))}
                </svg>
              )}

              {/* Tooltip Overlay */}
              {hoveredPoint && (
                <div
                  style={{
                    position: "absolute",
                    top: "14px",
                    right: "16px",
                    background: "rgba(15, 23, 42, 0.92)",
                    backdropFilter: "blur(6px)",
                    color: "white",
                    padding: "8px 14px",
                    borderRadius: "10px",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                    fontSize: "12px",
                    pointerEvents: "none",
                    zIndex: 10
                  }}
                >
                  <div style={{ fontWeight: 800, color: "#94a3b8", fontSize: "10.5px", textTransform: "uppercase" }}>
                    {hoveredPoint.label}
                  </div>
                  <div style={{ fontWeight: 900, fontSize: "14px", marginTop: "2px", color: strokeColor }}>
                    {formatRupiah(hoveredPoint.val)}
                  </div>
                  {hoveredPoint.growth_pct !== undefined && hoveredPoint.growth_pct !== 0 && (
                    <div style={{ fontSize: "10.5px", marginTop: "2px", color: hoveredPoint.growth_pct > 0 ? "#7dd3fc" : "#f87171" }}>
                      {hoveredPoint.growth_pct > 0 ? `▲ +${hoveredPoint.growth_pct}%` : `▼ ${hoveredPoint.growth_pct}%`} vs periode sebelumnya
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats Pills */}
          <div className="growth-stats-pills-row" style={{ marginTop: "16px" }}>
            {trendData.slice(-4).map((item, i) => (
              <div
                key={i}
                className={`growth-stat-pill ${
                  (item.growth_pct || 0) > 0 ? "up" : (item.growth_pct || 0) < 0 ? "down" : "neutral"
                }`}
              >
                <div className="pill-header">
                  <span className="pill-month">{item.month_name || item.label}</span>
                  <span
                    className={`pill-badge ${
                      (item.growth_pct || 0) > 0 ? "up" : (item.growth_pct || 0) < 0 ? "down" : "neutral"
                    }`}
                  >
                    {(item.growth_pct || 0) > 0 ? `+${item.growth_pct}%` : `${item.growth_pct || 0}%`}
                  </span>
                </div>
                <div className="pill-value">
                  {formatRupiah(
                    activeChartMetric === "income"
                      ? item.income
                      : activeChartMetric === "expense"
                      ? item.expense
                      : item.net
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PANEL 2: PIE & DONUT CHART DISTRIBUSI POS PROGRAM */}
        <div className="blade-stats-chart-card">
          <div>
            <div className="chart-header-row">
              <div>
                <div className="chart-badge-tag chart-badge-purple">
                  Diagram Proporsi Donasi Pos
                </div>
                <h3 className="chart-main-title">Distribusi Pos Program</h3>
                <p className="chart-sub-desc">
                  Persentase alokasi donasi dan arus dana per pos program pembangunan.
                </p>
              </div>

              <div className="pos-registered-badge">
                <IconPieChart size={16} color="var(--primary)" />
                <span className="pos-registered-text">
                  {posSummaryList.length} Pos Terdaftar
                </span>
              </div>
            </div>

            {/* Donut Chart & Breakdown Container */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "24px", flexWrap: "wrap", padding: "10px 0" }}>
              {/* Donut SVG */}
              <div style={{ position: "relative", width: "180px", height: "180px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="180" height="180" viewBox="0 0 180 180" style={{ transform: "rotate(-90deg)" }}>
                  {/* Background Track Circle */}
                  <circle
                    cx="90"
                    cy="90"
                    r={donutRadius}
                    fill="transparent"
                    className="donut-bg-track"
                    strokeWidth="20"
                  />
                  {/* Slices */}
                  {donutSlices.map((slice, idx) => {
                    if (slice.pct <= 0) return null;
                    const isHovered = hoveredPos?.id === slice.id;
                    return (
                      <circle
                        key={idx}
                        cx="90"
                        cy="90"
                        r={donutRadius}
                        fill="transparent"
                        stroke={slice.color.main}
                        strokeWidth={isHovered ? "24" : "18"}
                        strokeDasharray={slice.strokeDasharray}
                        strokeDashoffset={slice.strokeDashoffset}
                        style={{
                          transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                          cursor: onNavigatePos ? "pointer" : "default",
                          opacity: hoveredPos ? (isHovered ? 1 : 0.45) : 1
                        }}
                        onMouseEnter={() => setHoveredPos(slice)}
                        onMouseLeave={() => setHoveredPos(null)}
                        onClick={() => onNavigatePos && onNavigatePos(slice.id)}
                      >
                        <title>{`[${slice.code}] ${slice.name}: ${formatRupiah(slice.val)} (${slice.pct.toFixed(1)}%)`}</title>
                      </circle>
                    );
                  })}
                </svg>

                {/* Center Value */}
                <div
                  style={{
                    position: "absolute",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "none"
                  }}
                >
                  <span className="donut-center-label">
                    {hoveredPos ? hoveredPos.code : "Total"}
                  </span>
                  <span className="donut-center-value">
                    {hoveredPos ? `${hoveredPos.pct.toFixed(1)}%` : formatCompactRupiah(totalPosMetric)}
                  </span>
                  <span style={{ fontSize: "10.5px", fontWeight: "700", color: hoveredPos ? hoveredPos.color.main : "var(--primary)" }}>
                    {hoveredPos ? formatCompactRupiah(hoveredPos.val) : `${activeChartMetric === "expense" ? "Realisasi" : "Penerimaan"}`}
                  </span>
                </div>
              </div>

              {/* Progress List Pos Program */}
              <div style={{ flex: 1, minWidth: "220px", display: "flex", flexDirection: "column", gap: "10px" }}>
                {donutSlices.slice(0, 5).map((pos, idx) => {
                  const isHovered = hoveredPos?.id === pos.id;
                  return (
                    <div
                      key={idx}
                      className={`pos-donut-row ${isHovered ? "hovered" : ""}`}
                      style={{
                        ...(isHovered && pos.color.border ? { "--pos-hover-border": pos.color.border } : {}),
                        cursor: onNavigatePos ? "pointer" : "default",
                      }}
                      onMouseEnter={() => setHoveredPos(pos)}
                      onMouseLeave={() => setHoveredPos(null)}
                      onClick={() => onNavigatePos && onNavigatePos(pos.id)}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span
                            style={{
                              width: "10px",
                              height: "10px",
                              borderRadius: "3px",
                              background: pos.color.main,
                              display: "inline-block",
                              flexShrink: 0
                            }}
                          />
                          <span className="pos-donut-name" title={`Nama Lengkap: ${pos.name}`}>
                            {formatPosNameShort(pos.name)}
                          </span>
                          <span className="pos-code-badge">
                            {pos.code}
                          </span>
                        </div>
                        <span style={{ fontSize: "11.5px", fontWeight: "900", color: pos.color.main }}>
                          {pos.pct.toFixed(1)}%
                        </span>
                      </div>

                      <div className="pos-donut-track">
                        <div
                          style={{
                            height: "100%",
                            width: `${Math.min(pos.pct, 100)}%`,
                            background: pos.color.main,
                            borderRadius: "9999px",
                            transition: "width 0.6s cubic-bezier(0.16, 1, 0.3, 1)"
                          }}
                        />
                      </div>

                      <div className="pos-donut-subinfo">
                        <span>Penerimaan: {formatRupiah(pos.income)}</span>
                        <span>Belanja: {formatRupiah(pos.expense)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="donut-footer-row">
            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
              <span style={{ fontWeight: 700, color: "var(--text-muted)" }}>Singkatan:</span>
              {POS_ABBREVIATIONS.slice(0, 4).map((abbr, i) => (
                <span key={i} className="abbr-badge">
                  <strong>{abbr.short}</strong> = {abbr.full}
                </span>
              ))}
            </div>
            <span className="donut-sync-text">Real-time sync</span>
          </div>
        </div>
      </div>
    </div>
  );
}

