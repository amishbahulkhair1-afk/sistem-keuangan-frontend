import React from "react";
import { createPortal } from "react-dom";
import { IconCheckCircle, IconScale, IconEdit, IconTrash, IconExternalLink } from "../../Icons";
import { formatRupiah } from "../../utils/formatters";
import CustomDropdown from "../common/CustomDropdown";

export default function PosNeracaDinamis({
  neracaPosData,
  isReadOnly,
  setActiveMenu,
  setShowAddBalanceModal,
  showAddBalanceModal,
  editCustomItem,
  handleOpenAddBalanceModal,
  handleOpenEditBalanceModal,
  handleTambahCustomBalanceItem,
  handleHapusCustomBalanceItem,
  customItemSide,
  setCustomItemSide,
  customItemSubCat,
  setCustomItemSubCat,
  customItemCode,
  setCustomItemCode,
  customItemName,
  setCustomItemName,
  customItemAmountPrev,
  setCustomItemAmountPrev,
  customItemAmountCurr,
  setCustomItemAmountCurr,
  currentScopedPos
}) {
  return (
    <div className="neraca-page-wrapper">
      <div className={`reconciliation-card ${neracaPosData?.reconciliation?.is_balanced ? "balanced" : "unbalanced"}`}>
        <div className="rec-left">
          <div className="rec-badge-icon">
            {neracaPosData?.reconciliation?.is_balanced ? <IconCheckCircle size={20} /> : <IconScale size={20} />}
          </div>
          <div className="rec-info">
            <span className="rec-label">Status Neraca Pos: {neracaPosData?.pos?.name}</span>
            <strong className="rec-status">{neracaPosData?.reconciliation?.status}</strong>
          </div>
        </div>
        {!isReadOnly && (
          <button className="btn-primary-action" onClick={handleOpenAddBalanceModal}>
            + Tambah Baris Manual Aktiva/Passiva
          </button>
        )}
      </div>

      <div className="desktop-panel neraca-panel">
        <div className="neraca-header-box">
          <div className="neraca-tag">Neraca Pos: {neracaPosData?.pos?.name} ({neracaPosData?.pos?.code})</div>
          <h2 className="neraca-kop-title">PONDOK PESANTREN ANNUQAYAH LATEE</h2>
          <p className="neraca-kop-sub">
            Penanggung Jawab: {neracaPosData?.pos?.pic_name || "Ainul Fais"} • Tipe: {neracaPosData?.pos?.category_type === 'proyek_pembangunan' ? 'Proyek Pembangunan' : 'Non-Pembangunan / Operasional'}
          </p>
        </div>

        <div className="desktop-2col-grid neraca-tables-grid">
          {/* AKTIVA */}
          <div className="neraca-sub-card">
            <h4 className="neraca-section-title">I. AKTIVA (KEKAYAAN & REALISASI BIAYA POS)</h4>
            <div className="table-responsive-desktop">
              <table className="portal-table neraca-table">
                <thead>
                  <tr>
                    <th>Kode</th>
                    <th>Uraian Komponen</th>
                    <th style={{ textAlign: "right" }}>Jumlah (Rp)</th>
                    {!isReadOnly && <th style={{ textAlign: "center", width: "80px" }}>Aksi</th>}
                  </tr>
                </thead>
                <tbody>
                  <tr className="neraca-group-header">
                    <td colSpan={!isReadOnly ? 4 : 3}>A. Harta Lancar & Persediaan</td>
                  </tr>
                  {neracaPosData?.aktiva?.harta_lancar?.map((h, i) => (
                    <tr key={i}>
                      <td><code>{h.code}</code></td>
                      <td>
                        {h.name}
                        {h.is_auto && <span style={{ fontSize: "10px", color: "#64748b", marginLeft: "6px" }}>(Otomatis)</span>}
                      </td>
                      <td style={{ textAlign: "right", fontWeight: "700" }}>{formatRupiah(h.amount)}</td>
                      {!isReadOnly && (
                        <td style={{ textAlign: "center" }}>
                          {!h.is_auto ? (
                            <div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
                              <button
                                type="button"
                                onClick={() => handleOpenEditBalanceModal(h)}
                                className="btn-edit-cell"
                                title="Edit Baris"
                              >
                                <IconEdit size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleHapusCustomBalanceItem(h)}
                                className="btn-delete-cell"
                                title="Hapus Baris"
                              >
                                <IconTrash size={13} />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              className="btn-goto-shortcut"
                              onClick={() => {
                                if (h.code === "K.K") setActiveMenu("pos_transaksi");
                                else if (h.code === "P.U") setActiveMenu("hutang_piutang");
                                else if (h.code === "LOG") setActiveMenu("material_pemakaian");
                                else setActiveMenu("pos_transaksi");
                              }}
                              title="Buka Halaman Modul Terkait"
                            >
                              <IconExternalLink size={12} />
                              <span>Kelola</span>
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}

                  {neracaPosData?.aktiva?.biaya_operasional && neracaPosData.aktiva.biaya_operasional.length > 0 && (
                    <>
                      <tr className="neraca-group-header">
                        <td colSpan={!isReadOnly ? 4 : 3}>B. Akumulasi Realisasi Biaya</td>
                      </tr>
                      {neracaPosData.aktiva.biaya_operasional.map((b, i) => (
                        <tr key={i}>
                          <td><code>{b.code}</code></td>
                          <td>
                            {b.name}
                            {b.is_auto && <span style={{ fontSize: "10px", color: "#64748b", marginLeft: "6px" }}>(Otomatis)</span>}
                          </td>
                          <td style={{ textAlign: "right", fontWeight: "700" }}>{formatRupiah(b.amount)}</td>
                          {!isReadOnly && (
                            <td style={{ textAlign: "center" }}>
                              {!b.is_auto ? (
                                <div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditBalanceModal(b)}
                                    className="btn-edit-cell"
                                    title="Edit Baris"
                                  >
                                    <IconEdit size={13} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleHapusCustomBalanceItem(b)}
                                    className="btn-delete-cell"
                                    title="Hapus Baris"
                                  >
                                    <IconTrash size={13} />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  className="btn-goto-shortcut"
                                  onClick={() => setActiveMenu("pos_transaksi")}
                                  title="Buka Catatan Belanja Kas Pos"
                                >
                                  <IconExternalLink size={12} />
                                  <span>Kelola</span>
                                </button>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </>
                  )}
                  <tr style={{ background: "var(--surface-subtle)", fontWeight: "800" }}>
                    <td colSpan={2}>TOTAL AKTIVA</td>
                    <td style={{ textAlign: "right", color: "var(--primary)", fontSize: "14px" }}>
                      {formatRupiah(neracaPosData?.aktiva?.total_aktiva)}
                    </td>
                    {!isReadOnly && <td></td>}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* PASSIVA */}
          <div className="neraca-sub-card">
            <h4 className="neraca-section-title">II. PASSIVA (SUMBER DANA & KEWAJIBAN)</h4>
            <div className="table-responsive-desktop">
              <table className="portal-table neraca-table">
                <thead>
                  <tr>
                    <th>Kode</th>
                    <th>Uraian Komponen</th>
                    <th style={{ textAlign: "right" }}>Jumlah (Rp)</th>
                    {!isReadOnly && <th style={{ textAlign: "center", width: "80px" }}>Aksi</th>}
                  </tr>
                </thead>
                <tbody>
                  <tr className="neraca-group-header">
                    <td colSpan={!isReadOnly ? 4 : 3}>A. Kewajiban / Hutang</td>
                  </tr>
                  {neracaPosData?.passiva?.kewajiban?.map((k, i) => (
                    <tr key={i}>
                      <td><code>{k.code}</code></td>
                      <td>
                        {k.name}
                        {k.is_auto && <span style={{ fontSize: "10px", color: "#64748b", marginLeft: "6px" }}>(Otomatis)</span>}
                      </td>
                      <td style={{ textAlign: "right", fontWeight: "700" }}>{formatRupiah(k.amount)}</td>
                      {!isReadOnly && (
                        <td style={{ textAlign: "center" }}>
                          {!k.is_auto ? (
                            <div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
                              <button
                                type="button"
                                onClick={() => handleOpenEditBalanceModal(k)}
                                className="btn-edit-cell"
                                title="Edit Baris"
                              >
                                <IconEdit size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleHapusCustomBalanceItem(k)}
                                className="btn-delete-cell"
                                title="Hapus Baris"
                              >
                                <IconTrash size={13} />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              className="btn-goto-shortcut"
                              onClick={() => setActiveMenu("hutang_piutang")}
                              title="Buka Catatan Hutang Pos"
                            >
                              <IconExternalLink size={12} />
                              <span>Kelola</span>
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}

                  <tr className="neraca-group-header">
                    <td colSpan={!isReadOnly ? 4 : 3}>B. Sumber Dana Lembaga & Donasi</td>
                  </tr>
                  {neracaPosData?.passiva?.sumber_dana?.map((s, i) => (
                    <tr key={i}>
                      <td><code>{s.code}</code></td>
                      <td>
                        {s.name}
                        {s.is_auto && <span style={{ fontSize: "10px", color: "#64748b", marginLeft: "6px" }}>(Otomatis)</span>}
                      </td>
                      <td style={{ textAlign: "right", fontWeight: "700" }}>{formatRupiah(s.amount)}</td>
                      {!isReadOnly && (
                        <td style={{ textAlign: "center" }}>
                          {!s.is_auto ? (
                            <div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
                              <button
                                type="button"
                                onClick={() => handleOpenEditBalanceModal(s)}
                                className="btn-edit-cell"
                                title="Edit Baris"
                              >
                                <IconEdit size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleHapusCustomBalanceItem(s)}
                                className="btn-delete-cell"
                                title="Hapus Baris"
                              >
                                <IconTrash size={13} />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              className="btn-goto-shortcut"
                              onClick={() => setActiveMenu("pos_transaksi")}
                              title="Buka Transaksi Aliran Dana Pos"
                            >
                              <IconExternalLink size={12} />
                              <span>Kelola</span>
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                  <tr style={{ background: "var(--surface-subtle)", fontWeight: "800" }}>
                    <td colSpan={2}>TOTAL PASSIVA</td>
                    <td style={{ textAlign: "right", color: "var(--primary)", fontSize: "14px" }}>
                      {formatRupiah(neracaPosData?.passiva?.total_passiva)}
                    </td>
                    {!isReadOnly && <td></td>}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: TAMBAH / EDIT BARIS MANUAL NERACA POS */}
      {showAddBalanceModal && createPortal(
        <div className="modal-backdrop-custom" onClick={() => setShowAddBalanceModal(false)}>
          <div className="modal-card-custom" style={{ maxWidth: "580px" }} onClick={e => e.stopPropagation()}>
            <div className="modal-header-custom">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div className="modal-header-icon-circle">
                  <IconEdit size={18} color="currentColor" />
                </div>
                <div>
                  <h3>{editCustomItem ? `Ubah Baris Neraca` : `Tambah Baris Neraca Pos`}</h3>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "2px 0 0 0" }}>
                    {editCustomItem ? editCustomItem.name : (currentScopedPos?.name || "Pos Program")}
                  </p>
                </div>
              </div>
              <button className="btn-close-modal" onClick={() => setShowAddBalanceModal(false)} title="Tutup">✕</button>
            </div>
            <form onSubmit={handleTambahCustomBalanceItem}>
              <div className="modal-body-custom">
                <div className="form-grid-2col">
                  <div className="form-group">
                    <label className="form-label">Sisi Neraca</label>
                    <CustomDropdown
                      value={customItemSide}
                      onChange={e => {
                        const side = e.target.value;
                        setCustomItemSide(side);
                        setCustomItemSubCat(side === 'aktiva' ? 'harta_lancar' : 'kewajiban');
                      }}
                      options={[
                        { value: "aktiva", label: "Aktiva (Kekayaan / Biaya)" },
                        { value: "passiva", label: "Passiva (Kewajiban / Sumber Dana)" }
                      ]}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Sub Kategori</label>
                    <CustomDropdown
                      value={customItemSubCat}
                      onChange={e => setCustomItemSubCat(e.target.value)}
                      options={customItemSide === 'aktiva' ? [
                        { value: "harta_lancar", label: "Harta Lancar & Persediaan" },
                        { value: "biaya_operasional", label: "Akumulasi Realisasi Biaya" }
                      ] : [
                        { value: "kewajiban", label: "Kewajiban / Hutang" },
                        { value: "sumber_dana", label: "Sumber Dana / Modal" }
                      ]}
                    />
                  </div>
                </div>

                <div className="form-grid-2col">
                  <div className="form-group">
                    <label className="form-label">Kode Singkat (Opsional)</label>
                    <input className="form-control" type="text" placeholder="Contoh: K.B / D.P" value={customItemCode} onChange={e => setCustomItemCode(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nama Uraian Baris</label>
                    <input className="form-control" type="text" placeholder="Contoh: Kas Titipan Dewan Pengasuh" value={customItemName} onChange={e => setCustomItemName(e.target.value)} required />
                  </div>
                </div>

                <div className="form-grid-2col">
                  <div className="form-group">
                    <label className="form-label">Saldo Bulan Lalu (Rp)</label>
                    <input className="form-control" type="number" placeholder="0" value={customItemAmountPrev} onChange={e => setCustomItemAmountPrev(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mutasi Bulan Ini (Rp)</label>
                    <input className="form-control" type="number" placeholder="0" value={customItemAmountCurr} onChange={e => setCustomItemAmountCurr(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="modal-footer-custom">
                <button type="button" className="btn-secondary" onClick={() => setShowAddBalanceModal(false)}>Batal</button>
                <button type="submit" className="btn-primary">
                  {editCustomItem ? "Simpan Perubahan" : "Simpan ke Neraca Pos"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
