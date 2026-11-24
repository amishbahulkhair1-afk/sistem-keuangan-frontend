import React, { useState } from "react";
import { createPortal } from "react-dom";
import { IconCheckCircle, IconScale, IconEdit, IconTrash, IconExternalLink } from "../../Icons";
import { formatRupiah, API_BASE } from "../../utils/formatters";
import CustomDropdown from "../common/CustomDropdown";

export default function LaporanNeracaUmum({
  neracaData,
  fetchNeraca,
  isReadOnly,
  setActiveMenu,
  setConfirmDialog,
  handleRecalculateAccounts,
}) {
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [side, setSide] = useState("aktiva");
  const [subCat, setSubCat] = useState("harta_lancar");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [amountPrev, setAmountPrev] = useState("");
  const [amountCurr, setAmountCurr] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const handleOpenAddModal = () => {
    setEditItem(null);
    setSide("aktiva");
    setSubCat("harta_lancar");
    setCode("");
    setName("");
    setAmountPrev("");
    setAmountCurr("");
    setFormError(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (item) => {
    setEditItem(item);
    setSide(item.side || "aktiva");
    setSubCat(item.sub_category || (item.side === "passiva" ? "kewajiban" : "harta_lancar"));
    setCode(item.code && item.code !== "-" ? item.code : "");
    setName(item.name || "");
    setAmountPrev(item.amount_prev != null ? String(item.amount_prev) : "");
    setAmountCurr(item.amount_current != null ? String(item.amount_current) : "");
    setFormError(null);
    setShowModal(true);
  };

  const handleSubmitModal = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError("Nama uraian baris wajib diisi.");
      return;
    }

    const prev = parseFloat(amountPrev || 0);
    const curr = parseFloat(amountCurr || 0);
    const total = prev + curr;

    setIsSubmitting(true);
    try {
      if (editItem) {
        // Edit / Update
        const res = await fetch(`${API_BASE}/reports/neraca/items/${editItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            side,
            sub_category: subCat,
            code: code.trim() || "-",
            name: name.trim(),
            amount_prev_month: prev,
            amount_current_month: curr,
            amount_total: total,
          }),
        });
        const data = await res.json();
        if (res.ok && data.id) {
          setShowModal(false);
          if (fetchNeraca) fetchNeraca();
        } else {
          setFormError(data.detail || data.message || "Gagal memperbarui baris neraca.");
        }
      } else {
        // Tambah Baru
        const res = await fetch(`${API_BASE}/reports/neraca/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            side,
            sub_category: subCat,
            code: code.trim() || "-",
            name: name.trim(),
            amount_prev_month: prev,
            amount_current_month: curr,
            amount_total: total,
          }),
        });
        const data = await res.json();
        if (res.ok && data.id) {
          setShowModal(false);
          if (fetchNeraca) fetchNeraca();
        } else {
          setFormError(data.detail || data.message || "Gagal menambahkan baris neraca.");
        }
      }
    } catch (err) {
      setFormError("Terjadi gangguan jaringan atau sesi telah berakhir.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = (item) => {
    if (setConfirmDialog) {
      setConfirmDialog({
        title: "Hapus Baris Neraca Konsolidasi",
        message: "Apakah Anda yakin ingin menghapus baris penyesuaian neraca konsolidasi ini?",
        confirmLabel: "Hapus Baris",
        itemSummary: [
          { label: "Uraian", value: item.name },
          { label: "Sisi", value: item.side === "aktiva" ? "Aktiva" : "Passiva" },
          { label: "Total Saldo", value: formatRupiah(item.amount), isHighlight: true },
        ],
        onConfirm: async () => {
          try {
            await fetch(`${API_BASE}/reports/neraca/items/${item.id}`, { method: "DELETE" });
            if (fetchNeraca) fetchNeraca();
          } finally {
            setConfirmDialog(null);
          }
        },
      });
    } else if (window.confirm(`Hapus baris '${item.name}'?`)) {
      fetch(`${API_BASE}/reports/neraca/items/${item.id}`, { method: "DELETE" })
        .then(() => fetchNeraca && fetchNeraca());
    }
  };

  const handleShortcutNavigation = (item) => {
    if (!setActiveMenu) return;
    const sub = item.sub_category;
    if (sub === "harta_lancar") {
      if (item.code === "P.U") {
        setActiveMenu("hutang_piutang");
      } else {
        setActiveMenu("master_rekening");
      }
    } else if (sub === "biaya_biaya") {
      setActiveMenu("pos_transaksi");
    } else if (sub === "kewajiban") {
      setActiveMenu("hutang_piutang");
    } else if (sub === "sumber_dana") {
      setActiveMenu("buku_bantu");
    } else {
      setActiveMenu("transaksi");
    }
  };

  const aktivaGroups = neracaData?.aktiva?.groups || [];
  const passivaGroups = neracaData?.passiva?.groups || [];

  return (
    <div className="neraca-page-wrapper">
      {/* KARTU STATUS REKONSILIASI KONSOLIDASI */}
      <div className={`reconciliation-card ${neracaData?.reconciliation?.is_balanced ? "balanced" : "unbalanced"}`}>
        <div className="rec-left">
          <div className="rec-badge-icon">
            {neracaData?.reconciliation?.is_balanced ? <IconCheckCircle size={20} /> : <IconScale size={20} />}
          </div>
          <div className="rec-info">
            <span className="rec-label">Status Rekonsiliasi Otomatis Konsolidasi</span>
            <strong className="rec-status">{neracaData?.reconciliation?.status || "Memuat..."}</strong>
          </div>
        </div>
        {!isReadOnly && (
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {handleRecalculateAccounts && (
              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: "12px", padding: "8px 12px", background: "white", color: "var(--text-dark)", border: "1px solid var(--border-color)", borderRadius: "6px" }}
                onClick={handleRecalculateAccounts}
                title="Hitung ulang dan sinkronkan seluruh saldo kas sesuai riwayat transaksi saat ini"
              >
                🔄 Sinkronkan / Kosongkan Kas
              </button>
            )}
            <button className="btn-primary-action" onClick={handleOpenAddModal}>
              + Tambah Baris Manual Aktiva/Passiva
            </button>
          </div>
        )}
      </div>

      <div className="desktop-panel neraca-panel">
        <div className="neraca-header-box">
          <div className="neraca-tag">Laporan Keuangan Resmi Konsolidasi (Aktiva &amp; Passiva)</div>
          <h2 className="neraca-kop-title">PENGEMBANGAN PEMBANGUNAN PP ANNUQAYAH LATEE</h2>
          <p className="neraca-kop-sub">
            Guluk-Guluk Sumenep Jawa Timur • Periode: {neracaData?.periode || "Tahun Berjalan"}
          </p>
        </div>

        <div className="desktop-2col-grid neraca-tables-grid">
          {/* I. SISI KIRI: AKTIVA */}
          <div className="neraca-sub-card">
            <h4 className="neraca-section-title">I. AKTIVA (HARTA LANCAR &amp; BIAYA-BIAYA)</h4>
            <div className="table-responsive-desktop">
              <table className="portal-table neraca-table">
                <thead>
                  <tr>
                    <th style={{ width: "60px" }}>Kode</th>
                    <th>Uraian Komponen</th>
                    <th style={{ textAlign: "right" }}>Jumlah (Rp)</th>
                    {!isReadOnly && <th style={{ textAlign: "center", width: "80px" }}>Aksi</th>}
                  </tr>
                </thead>
                <tbody>
                  {aktivaGroups.map((group, gIdx) => (
                    <React.Fragment key={gIdx}>
                      <tr className="neraca-group-header">
                        <td colSpan={!isReadOnly ? 4 : 3}>{group.title}</td>
                      </tr>
                      {group.items.map((item, iIdx) => (
                        <tr key={iIdx}>
                          <td><code>{item.code || "-"}</code></td>
                          <td>
                            {item.name}
                            {item.is_auto && (
                              <span style={{ fontSize: "10px", color: "#64748b", marginLeft: "6px" }}>(Otomatis)</span>
                            )}
                          </td>
                          <td style={{ textAlign: "right", fontWeight: "700" }}>{formatRupiah(item.amount)}</td>
                          {!isReadOnly && (
                            <td style={{ textAlign: "center" }}>
                              {!item.is_auto ? (
                                <div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditModal(item)}
                                    className="btn-edit-cell"
                                    title="Edit Baris"
                                  >
                                    <IconEdit size={13} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteItem(item)}
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
                                  onClick={() => handleShortcutNavigation(item)}
                                  title="Buka Modul Terkait"
                                >
                                  <IconExternalLink size={12} />
                                  <span>Kelola</span>
                                </button>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                      <tr style={{ background: "var(--surface-subtle)", fontStyle: "italic", fontSize: "12px" }}>
                        <td colSpan={2} style={{ paddingLeft: "16px", fontWeight: "600" }}>
                          Subtotal {group.title}
                        </td>
                        <td style={{ textAlign: "right", fontWeight: "700" }}>
                          {formatRupiah(group.subtotal)}
                        </td>
                        {!isReadOnly && <td></td>}
                      </tr>
                    </React.Fragment>
                  ))}

                  <tr style={{ background: "var(--surface-subtle)", fontWeight: "800" }}>
                    <td colSpan={2}>TOTAL AKTIVA</td>
                    <td style={{ textAlign: "right", color: "var(--primary)", fontSize: "14px" }}>
                      {formatRupiah(neracaData?.aktiva?.total_aktiva)}
                    </td>
                    {!isReadOnly && <td></td>}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* II. SISI KANAN: PASSIVA */}
          <div className="neraca-sub-card">
            <h4 className="neraca-section-title">II. PASSIVA (KEWAJIBAN &amp; SUMBER DANA)</h4>
            <div className="table-responsive-desktop">
              <table className="portal-table neraca-table">
                <thead>
                  <tr>
                    <th style={{ width: "60px" }}>Kode</th>
                    <th>Uraian Komponen</th>
                    <th style={{ textAlign: "right" }}>Jumlah (Rp)</th>
                    {!isReadOnly && <th style={{ textAlign: "center", width: "80px" }}>Aksi</th>}
                  </tr>
                </thead>
                <tbody>
                  {passivaGroups.map((group, gIdx) => (
                    <React.Fragment key={gIdx}>
                      <tr className="neraca-group-header">
                        <td colSpan={!isReadOnly ? 4 : 3}>{group.title}</td>
                      </tr>
                      {group.items.map((item, iIdx) => (
                        <tr key={iIdx}>
                          <td><code>{item.code || "-"}</code></td>
                          <td>
                            {item.name}
                            {item.is_auto && (
                              <span style={{ fontSize: "10px", color: "#64748b", marginLeft: "6px" }}>(Otomatis)</span>
                            )}
                          </td>
                          <td style={{ textAlign: "right", fontWeight: "700" }}>{formatRupiah(item.amount)}</td>
                          {!isReadOnly && (
                            <td style={{ textAlign: "center" }}>
                              {!item.is_auto ? (
                                <div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditModal(item)}
                                    className="btn-edit-cell"
                                    title="Edit Baris"
                                  >
                                    <IconEdit size={13} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteItem(item)}
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
                                  onClick={() => handleShortcutNavigation(item)}
                                  title="Buka Modul Terkait"
                                >
                                  <IconExternalLink size={12} />
                                  <span>Kelola</span>
                                </button>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                      <tr style={{ background: "var(--surface-subtle)", fontStyle: "italic", fontSize: "12px" }}>
                        <td colSpan={2} style={{ paddingLeft: "16px", fontWeight: "600" }}>
                          Subtotal {group.title}
                        </td>
                        <td style={{ textAlign: "right", fontWeight: "700" }}>
                          {formatRupiah(group.subtotal)}
                        </td>
                        {!isReadOnly && <td></td>}
                      </tr>
                    </React.Fragment>
                  ))}

                  <tr style={{ background: "var(--surface-subtle)", fontWeight: "800" }}>
                    <td colSpan={2}>TOTAL PASSIVA</td>
                    <td style={{ textAlign: "right", color: "var(--primary)", fontSize: "14px" }}>
                      {formatRupiah(neracaData?.passiva?.total_passiva)}
                    </td>
                    {!isReadOnly && <td></td>}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: TAMBAH / UBAH BARIS MANUAL NERACA KONSOLIDASI */}
      {showModal && createPortal(
        <div className="modal-backdrop-custom" onClick={() => setShowModal(false)}>
          <div className="modal-card-custom" style={{ maxWidth: "580px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-custom">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div className="modal-header-icon-circle">
                  <IconEdit size={18} color="currentColor" />
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>
                    {editItem ? "Ubah Baris Neraca Konsolidasi" : "Tambah Baris Neraca Konsolidasi"}
                  </h3>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "2px 0 0 0" }}>
                    {editItem ? editItem.name : "Format Rinci Hierarkis (A, B, C...)"}
                  </p>
                </div>
              </div>
              <button className="btn-close-modal" onClick={() => setShowModal(false)} title="Tutup">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitModal}>
              <div className="modal-body-custom">
                {formError && (
                  <div style={{ background: "#fef2f2", color: "#b91c1c", padding: "10px 14px", borderRadius: "6px", fontSize: "12px", marginBottom: "14px", border: "1px solid #fecaca" }}>
                    {formError}
                  </div>
                )}

                <div className="form-grid-2col">
                  <div className="form-group">
                    <label className="form-label">Sisi Neraca</label>
                    <CustomDropdown
                      value={side}
                      onChange={(e) => {
                        const s = e.target.value;
                        setSide(s);
                        setSubCat(s === "aktiva" ? "harta_lancar" : "kewajiban");
                      }}
                      options={[
                        { value: "aktiva", label: "Aktiva (Kekayaan / Aset / Biaya)" },
                        { value: "passiva", label: "Passiva (Kewajiban / Dana / Ekuitas)" },
                      ]}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Sub Kategori (Grup)</label>
                    <CustomDropdown
                      value={subCat}
                      onChange={(e) => setSubCat(e.target.value)}
                      options={
                        side === "aktiva"
                          ? [
                              { value: "harta_lancar", label: "A. Harta Lancar (Kas Tunai, Kas Bank, Piutang)" },
                              { value: "biaya_biaya", label: "B. Biaya-Biaya Tiap Pos Program" },
                            ]
                          : [
                              { value: "kewajiban", label: "A. Kewajiban (Hutang ke Pihak Lain)" },
                              { value: "sumber_dana", label: "B. Sumber Dana Tiap Pos" },
                            ]
                      }
                    />
                  </div>
                </div>

                <div className="form-grid-2col">
                  <div className="form-group">
                    <label className="form-label">Kode Singkat (Opsional)</label>
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Contoh: INV / GDG / D.C"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nama Uraian Baris</label>
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Contoh: Gedung Asrama Santri Baru"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-grid-2col">
                  <div className="form-group">
                    <label className="form-label">Saldo Bulan Lalu (Rp)</label>
                    <input
                      className="form-control"
                      type="number"
                      placeholder="0"
                      value={amountPrev}
                      onChange={(e) => setAmountPrev(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mutasi Bulan Ini (Rp)</label>
                    <input
                      className="form-control"
                      type="number"
                      placeholder="0"
                      value={amountCurr}
                      onChange={(e) => setAmountCurr(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ background: "var(--surface-subtle)", padding: "10px 14px", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Total Saldo Akhir Komponen:</span>
                  <strong style={{ fontSize: "14px", color: "var(--primary)" }}>
                    {formatRupiah((parseFloat(amountPrev) || 0) + (parseFloat(amountCurr) || 0))}
                  </strong>
                </div>
              </div>

              <div className="modal-footer-custom">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)} disabled={isSubmitting}>
                  Batal
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? "Menyimpan..." : (editItem ? "Simpan Perubahan" : "Simpan ke Neraca Konsolidasi")}
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
