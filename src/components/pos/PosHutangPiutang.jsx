import React, { useState } from "react";
import {
  IconLayers,
  IconCheckCircle,
  IconPlusCircle,
  IconFileText,
  IconTrash
} from "../../Icons";
import { formatRupiah } from "../../utils/formatters";
import CustomDropdown from "../common/CustomDropdown";
import CustomDatePicker from "../common/CustomDatePicker";
import TableActionMenu from "../common/TableActionMenu";

export default function PosHutangPiutang({
  currentScopedPos,
  selectedPosScope,
  debtsRecap,
  isReadOnly,
  debtMsg,
  handleSimpanDebt,
  debtFormCatId,
  setDebtFormCatId,
  categories,
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
  debtsList,
  handleHapusDebt
}) {
  const [tableFontSize, setTableFontSize] = useState("compact");
  return (
    <div className="hutang-piutang-container">
      {/* Ringkasan Saldo Hutang & Piutang */}
      <div className="blade-stats-grid" style={{ marginBottom: "20px" }}>
        <div className="blade-card amber group">
          <div className="blade-card-top-bar amber"></div>
          <div className="blade-card-inner">
            <div>
              <p className="blade-card-label">Sisa Hutang Belum Lunas</p>
              <h3 className="blade-card-value" style={{ color: "#b45309" }}>{formatRupiah(debtsRecap?.total_sisa_hutang)}</h3>
              <p className="blade-card-desc">Kewajiban pos {currentScopedPos?.code} ke pihak lain</p>
            </div>
            <div className="blade-card-icon amber"><IconLayers size={24} color="white" /></div>
          </div>
        </div>

        <div className="blade-card emerald group">
          <div className="blade-card-top-bar emerald"></div>
          <div className="blade-card-inner">
            <div>
              <p className="blade-card-label">Sisa Piutang Pos</p>
              <h3 className="blade-card-value" style={{ color: "#0284c7" }}>{formatRupiah(debtsRecap?.total_sisa_piutang)}</h3>
              <p className="blade-card-desc">Pinjaman yang diberikan pos ke unit lain</p>
            </div>
            <div className="blade-card-icon emerald"><IconCheckCircle size={24} color="white" /></div>
          </div>
        </div>
      </div>

      <div className={!isReadOnly ? "desktop-2col-grid" : ""}>
        {/* Kolom Kiri: Form Catat Hutang/Piutang Baru */}
        {!isReadOnly && (
          <div className="desktop-panel">
            <div className="panel-header">
              <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <IconPlusCircle size={18} color="var(--primary)" /> Catat Hutang / Piutang Baru
              </h3>
            </div>
            {debtMsg && <div className={`alert-box alert-${debtMsg.type}`}>{debtMsg.text}</div>}

            <form onSubmit={handleSimpanDebt}>
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
                      { value: "hutang_pinjam", label: "Hutang: Pinjam Dana (Pinjam Baru)" },
                      { value: "hutang_bayar", label: "Hutang: Bayar Cicilan (Pelunasan Hutang)" },
                      { value: "piutang_pinjam", label: "Piutang: Memberi Pinjaman ke Pihak Lain" },
                      { value: "piutang_bayar", label: "Piutang: Terima Pembayaran Piutang" }
                    ]}
                  />
                </div>
              </div>

              <div className="form-grid-2col">
                <div className="form-group">
                  <label className="form-label">Nama Pihak Terkait (Kepada / Dari)</label>
                  <input className="form-control" type="text" placeholder="Contoh: Kak Affan / Toko Hidayah" value={debtFormParty} onChange={e => setDebtFormParty(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Nominal (Rp)</label>
                  <input className="form-control" type="number" placeholder="5000000" value={debtFormAmount} onChange={e => setDebtFormAmount(e.target.value)} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Keterangan / Keperluan</label>
                <input className="form-control" type="text" placeholder="Keperluan dana talangan..." value={debtFormDesc} onChange={e => setDebtFormDesc(e.target.value)} />
              </div>

              <button type="submit" className="btn-primary-action">
                <IconCheckCircle size={18} color="white" />
                <span>Simpan Transaksi Hutang / Piutang</span>
              </button>
            </form>
          </div>
        )}

        {/* Tabel Rekapitulasi per Pihak */}
        <div className="desktop-panel">
          <div className="panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <IconLayers size={18} color="var(--primary)" /> Rekapitulasi Saldo per Pihak
            </h3>
            <TableActionMenu
              fontSize={tableFontSize}
              onFontSizeChange={setTableFontSize}
            />
          </div>

          <h4 style={{ fontSize: "13px", fontWeight: "700", color: "#b45309", marginTop: "10px", marginBottom: "8px" }}>Daftar Kewajiban Hutang:</h4>
          <div className={`table-responsive-desktop table-font-${tableFontSize}`} style={{ marginBottom: "20px" }}>
            <table className={`portal-table table-font-${tableFontSize}`}>
              <thead>
                <tr>
                  <th>Kepada</th>
                  <th style={{ textAlign: "right" }}>Total Pinjam</th>
                  <th style={{ textAlign: "right" }}>Total Bayar</th>
                  <th style={{ textAlign: "right" }}>Sisa Saldo</th>
                </tr>
              </thead>
              <tbody>
                {debtsRecap?.hutang_list?.map((h, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: "700" }}>{h.party_name}</td>
                    <td style={{ textAlign: "right" }}>{formatRupiah(h.total_pinjam)}</td>
                    <td style={{ textAlign: "right", color: "var(--success-text)" }}>{formatRupiah(h.total_bayar)}</td>
                    <td style={{ textAlign: "right", fontWeight: "800", color: h.saldo > 0 ? "#b45309" : "var(--text-muted)" }}>
                      {formatRupiah(h.saldo)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h4 style={{ fontSize: "13px", fontWeight: "700", color: "#0284c7", marginBottom: "8px" }}>Daftar Piutang ke Pihak Lain:</h4>
          <div className="table-responsive-desktop">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Pihak Peminjam</th>
                  <th style={{ textAlign: "right" }}>Total Piutang</th>
                  <th style={{ textAlign: "right" }}>Sudah Dibayar</th>
                  <th style={{ textAlign: "right" }}>Sisa Saldo</th>
                </tr>
              </thead>
              <tbody>
                {debtsRecap?.piutang_list?.map((p, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: "700" }}>{p.party_name}</td>
                    <td style={{ textAlign: "right" }}>{formatRupiah(p.total_piutang)}</td>
                    <td style={{ textAlign: "right", color: "var(--success-text)" }}>{formatRupiah(p.total_bayar)}</td>
                    <td style={{ textAlign: "right", fontWeight: "800", color: p.saldo > 0 ? "#0284c7" : "var(--text-muted)" }}>
                      {formatRupiah(p.saldo)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Tabel Riwayat Jurnal Transaksi Hutang & Piutang */}
      <div className="desktop-panel" style={{ marginTop: "20px" }}>
        <div className="panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <IconFileText size={18} color="var(--primary)" /> Buku Jurnal Transaksi Hutang & Piutang ({debtsList.length})
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
                <th>Pos</th>
                <th>Pihak Terkait</th>
                <th>Jenis</th>
                <th>Keterangan</th>
                <th style={{ textAlign: "right" }}>Nominal</th>
                {!isReadOnly && <th style={{ textAlign: "center" }}>Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {debtsList.map(d => (
                <tr key={d.id}>
                  <td><code>{d.transaction_date}</code></td>
                  <td><span className="badge-tag badge-pos">{d.pos_code}</span></td>
                  <td style={{ fontWeight: "700" }}>{d.party_name}</td>
                  <td>
                    <span className={`badge-tag ${d.type.includes('pinjam') ? 'badge-expense' : 'badge-income'}`}>
                      {d.type.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td>{d.description || "-"}</td>
                  <td style={{ textAlign: "right", fontWeight: "700" }}>{formatRupiah(d.amount)}</td>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
