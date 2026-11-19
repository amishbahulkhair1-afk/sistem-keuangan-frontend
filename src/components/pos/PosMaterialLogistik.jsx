import React, { useState } from "react";
import {
  IconTruck,
  IconPackage,
  IconClipboard,
  IconCheckCircle,
  IconTrash
} from "../../Icons";
import { formatRupiah } from "../../utils/formatters";
import CustomDropdown from "../common/CustomDropdown";
import CustomDatePicker from "../common/CustomDatePicker";
import TableActionMenu from "../common/TableActionMenu";

export default function PosMaterialLogistik({
  currentScopedPos,
  grandStockValue,
  materialsList,
  materialTxList,
  isReadOnly,
  usageMsg,
  handleCatatPemakaianMaterial,
  usageMatId,
  setUsageMatId,
  usageDate,
  setUsageDate,
  usageQty,
  setUsageQty,
  usagePurpose,
  setUsagePurpose,
  usageRecipient,
  setUsageRecipient,
  handleHapusMaterialTx
}) {
  const [tableFontSize, setTableFontSize] = useState("compact");
  return (
    <div className="material-logistik-container">
      {/* 1. Stat Card */}
      <div className="blade-stats-grid" style={{ marginBottom: "20px" }}>
        <div className="blade-card blue group">
          <div className="blade-card-top-bar blue"></div>
          <div className="blade-card-inner">
            <div>
              <p className="blade-card-label">Estimasi Nilai Total Aset Material</p>
              <h3 className="blade-card-value" style={{ color: "#0284c7" }}>{formatRupiah(grandStockValue)}</h3>
              <p className="blade-card-desc">Total valuasi sisa fisik barang di gudang ({materialsList.length} jenis)</p>
            </div>
            <div className="blade-card-icon blue"><IconTruck size={24} color="white" /></div>
          </div>
        </div>
      </div>

      <div className={!isReadOnly ? "desktop-2col-grid" : ""}>
        {/* Kolom Kiri: Form Catat Pemakaian Material */}
        {!isReadOnly && (
          <div className="desktop-panel">
            <div className="panel-header" style={{ marginBottom: "16px" }}>
              <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <IconClipboard size={18} color="var(--primary)" /> Formulir Pemakaian Material di Lapangan
              </h3>
              <span className="badge-tag badge-income">Potong Stok Otomatis</span>
            </div>
            {usageMsg && <div className={`alert-box alert-${usageMsg.type}`}>{usageMsg.text}</div>}

            <form onSubmit={handleCatatPemakaianMaterial}>
              <div className="form-group">
                <label className="form-label">Pilih Material yang Digunakan</label>
                <CustomDropdown
                  value={usageMatId}
                  onChange={e => setUsageMatId(e.target.value)}
                  searchable={materialsList.length > 5}
                  searchPlaceholder="Cari material..."
                  options={materialsList.map(m => ({
                    value: m.id,
                    label: `[${m.code}] ${m.name} (Sisa: ${m.current_stock} ${m.unit})`
                  }))}
                  required
                />
              </div>

              <div className="form-grid-2col">
                <div className="form-group">
                  <label className="form-label">Tanggal Pemakaian</label>
                  <CustomDatePicker value={usageDate} onChange={e => setUsageDate(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Volume / Jumlah Terpakai</label>
                  <input className="form-control" type="number" step="0.1" placeholder="Contoh: 10" value={usageQty} onChange={e => setUsageQty(e.target.value)} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Keterangan Alokasi Pemakaian</label>
                <input
                  className="form-control"
                  type="text"
                  placeholder="Contoh: Pengecoran dak lantai 2 / Pasang dinding bata"
                  value={usagePurpose}
                  onChange={e => setUsagePurpose(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-primary-action" style={{ background: "#0284c7" }}>
                <IconCheckCircle size={18} color="white" />
                <span>Catat Pemakaian (Kurangi Stok)</span>
              </button>
            </form>
          </div>
        )}

        {/* TABEL KATALOG & STOK MATERIAL */}
        <div className="desktop-panel">
          <div className="panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <IconPackage size={18} color="var(--primary)" /> Katalog & Stok Material ({materialsList.length})
              </h3>
            </div>
            <TableActionMenu
              fontSize={tableFontSize}
              onFontSizeChange={setTableFontSize}
            />
          </div>

          <div className={`table-responsive-desktop table-font-${tableFontSize}`}>
            <table className={`portal-table table-font-${tableFontSize}`}>
              <thead>
                <tr>
                  <th>Kode</th>
                  <th>Nama Material</th>
                  <th style={{ textAlign: "center" }}>Masuk</th>
                  <th style={{ textAlign: "center" }}>Terpakai</th>
                  <th style={{ textAlign: "center" }}>Sisa Stok</th>
                  <th style={{ textAlign: "right" }}>Estimasi Nilai</th>
                </tr>
              </thead>
              <tbody>
                {materialsList.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "24px", color: "var(--text-muted)" }}>
                      Belum ada katalog jenis material yang terdaftar di pos ini. Material otomatis tercatat dari belanja kas pos (Kategori: Belanja Material).
                    </td>
                  </tr>
                ) : (
                  materialsList.map(m => (
                    <tr key={m.id}>
                      <td><code>{m.code}</code></td>
                      <td style={{ fontWeight: "700" }}>{m.name}</td>
                      <td style={{ textAlign: "center", color: "var(--success-text)" }}>{m.total_masuk + m.initial_stock} {m.unit}</td>
                      <td style={{ textAlign: "center", color: "var(--danger-text)" }}>{m.total_keluar} {m.unit}</td>
                      <td style={{ textAlign: "center", fontWeight: "800", color: m.current_stock > 0 ? "var(--primary)" : "var(--text-muted)" }}>
                        {m.current_stock} {m.unit}
                      </td>
                      <td style={{ textAlign: "right", fontWeight: "700" }}>{formatRupiah(m.total_value)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* TABEL LOG RIWAYAT PEMAKAIAN LAPANGAN */}
      <div className="desktop-panel" style={{ marginTop: "20px" }}>
        <div className="panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <IconClipboard size={18} color="var(--primary)" /> Log Riwayat Keluar-Masuk & Pemakaian Material Lapangan
          </h3>
          <TableActionMenu
            fontSize={tableFontSize}
            onFontSizeChange={setTableFontSize}
          />
        </div>
        <div className={`table-responsive-desktop table-font-${tableFontSize}`}>
          <table className={`portal-table table-font-${tableFontSize}`}>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Kode & Material</th>
                <th>Jenis</th>
                <th>Jumlah</th>
                <th>Alokasi Pemakaian / Sumber</th>
                <th style={{ textAlign: "right" }}>Nilai Biaya</th>
                {!isReadOnly && <th style={{ textAlign: "center" }}>Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {materialTxList.length === 0 ? (
                <tr>
                  <td colSpan={!isReadOnly ? "7" : "6"} style={{ textAlign: "center", padding: "24px", color: "var(--text-muted)" }}>
                    Belum ada riwayat penerimaan/pemakaian material di pos ini.
                  </td>
                </tr>
              ) : (
                materialTxList.map(t => (
                  <tr key={t.id}>
                    <td><code>{t.transaction_date}</code></td>
                    <td style={{ fontWeight: "700" }}>[{t.material_code}] {t.material_name}</td>
                    <td>
                      <span className={`badge-tag ${t.type === 'keluar' ? 'badge-expense' : 'badge-income'}`}>
                        {t.type === 'keluar' ? 'Pemakaian' : 'Penerimaan'}
                      </span>
                    </td>
                    <td style={{ fontWeight: "700" }}>{t.quantity} {t.unit}</td>
                    <td>{t.usage_for || t.supplier_or_source || "-"}</td>
                    <td style={{ textAlign: "right" }}>{formatRupiah(t.total_price)}</td>
                    {!isReadOnly && (
                      <td style={{ textAlign: "center" }}>
                        <button
                          type="button"
                          title="Batalkan Transaksi"
                          onClick={() => handleHapusMaterialTx(t)}
                          style={{ background: "#fee2e2", color: "#b91c1c", border: "none", padding: "4px 8px", borderRadius: "6px", cursor: "pointer" }}
                        >
                          <IconTrash size={14} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
