import React, { useState } from "react";
import { createPortal } from "react-dom";
import { IconPlusCircle, IconCheckCircle, IconBank, IconEdit, IconTrash } from "../../Icons";
import { formatRupiah } from "../../utils/formatters";
import TableActionMenu from "../common/TableActionMenu";

export default function MasterRekening({
  isReadOnly,
  masterMsg,
  handleTambahRekening,
  newAccCode,
  setNewAccCode,
  newAccName,
  setNewAccName,
  newAccBalance,
  setNewAccBalance,
  accounts,
  setEditAccItem,
  handleDeleteRekening,
  editAccItem,
  handleUpdateRekening
}) {
  const [tableFontSize, setTableFontSize] = useState("compact");
  return (
    <div className={!isReadOnly ? "desktop-2col-grid" : ""}>
      {!isReadOnly && (
        <div className="desktop-panel">
          <div className="panel-header">
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <IconPlusCircle size={18} color="var(--primary)" /> Tambah Rekening Kas / Bank Baru
            </h3>
          </div>
          {masterMsg && <div className={`alert-box alert-${masterMsg.type}`}>{masterMsg.text}</div>}

          <form onSubmit={handleTambahRekening}>
            <div className="form-group">
              <label className="form-label">Kode Rekening (Akun)</label>
              <input
                className="form-control"
                type="text"
                placeholder="Contoh: KAS-01 / BSI-UTAMA"
                value={newAccCode}
                onChange={e => setNewAccCode(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Nama Rekening / Kas</label>
              <input
                className="form-control"
                type="text"
                placeholder="Contoh: Kas Operasional Tunai Latee"
                value={newAccName}
                onChange={e => setNewAccName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Saldo Awal (Rp)</label>
              <input
                className="form-control"
                type="number"
                placeholder="0"
                value={newAccBalance}
                onChange={e => setNewAccBalance(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary-action">
              <IconCheckCircle size={16} /> Simpan Rekening Baru
            </button>
          </form>
        </div>
      )}

      {/* Tabel Data Rekening */}
      <div className="desktop-panel">
        <div className="panel-header">
          <div>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <IconBank size={18} color="var(--primary)" /> Rekening Kas & Bank Terdaftar
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              Daftar seluruh rekening penampung donasi tunai, perbankan, dan e-wallet.
            </p>
          </div>
          <TableActionMenu
            onRefresh={() => {}}
            fontSize={tableFontSize}
            onFontSizeChange={setTableFontSize}
          />
        </div>

        <div className={`table-responsive-desktop table-font-${tableFontSize}`}>
          <table className={`portal-table table-font-${tableFontSize}`}>
            <thead>
              <tr>
                <th>Kode</th>
                <th>Nama Rekening</th>
                <th style={{ textAlign: "right" }}>Saldo Saat Ini</th>
                {!isReadOnly && <th style={{ textAlign: "center" }}>Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {accounts.map(acc => (
                <tr key={acc.id}>
                  <td><code>{acc.code}</code></td>
                  <td style={{ fontWeight: "700" }}>{acc.name}</td>
                  <td style={{ textAlign: "right", fontWeight: "700", color: "#0284c7" }}>
                    {formatRupiah(acc.balance)}
                  </td>
                  {!isReadOnly && (
                    <td style={{ textAlign: "center" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <button
                          type="button"
                          className="btn-edit-cell"
                          title="Edit Rekening"
                          onClick={() => setEditAccItem(acc)}
                        >
                          <IconEdit size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn-delete-cell"
                          title="Hapus Rekening"
                          onClick={() => handleDeleteRekening(acc)}
                        >
                          <IconTrash size={14} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL EDIT MASTER REKENING */}
      {editAccItem && createPortal(
        <div className="modal-backdrop-custom" onClick={() => setEditAccItem(null)}>
          <div className="modal-card-custom" onClick={e => e.stopPropagation()}>
            <div className="modal-header-custom">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div className="modal-header-icon-circle">
                  <IconBank size={18} color="currentColor" />
                </div>
                <div>
                  <h3>Edit Rekening Kas & Bank [{editAccItem.code}]</h3>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "2px 0 0 0" }}>Perbarui nama rekening dan saldo awal</p>
                </div>
              </div>
              <button className="btn-close-modal" onClick={() => setEditAccItem(null)} title="Tutup">✕</button>
            </div>
            <form onSubmit={handleUpdateRekening}>
              <div className="modal-body-custom">
                <div className="form-group">
                  <label className="form-label">Nama Rekening Kas / Bank</label>
                  <input
                    className="form-control"
                    type="text"
                    value={editAccItem.name}
                    onChange={e => setEditAccItem({ ...editAccItem, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Saldo Awal (Rp)</label>
                  <input
                    className="form-control"
                    type="number"
                    value={editAccItem.initial_balance}
                    onChange={e => setEditAccItem({ ...editAccItem, initial_balance: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer-custom">
                <button type="button" className="btn-secondary" onClick={() => setEditAccItem(null)}>Batal</button>
                <button type="submit" className="btn-primary">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
