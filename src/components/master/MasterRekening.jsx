import React, { useState } from "react";
import { createPortal } from "react-dom";
import { IconPlusCircle, IconCheckCircle, IconBank, IconEdit, IconTrash, IconRefresh } from "../../Icons";
import { formatRupiah } from "../../utils/formatters";
import TableActionMenu from "../common/TableActionMenu";
import TablePagination from "../common/TablePagination";
import BulkActionBar from "../common/BulkActionBar";
import { useTablePagination } from "../common/useTablePagination";

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
  accounts = [],
  setEditAccItem,
  handleDeleteRekening,
  handleBulkDeleteRekening,
  handleRecalculateAccounts,
  setConfirmDialog,
  editAccItem,
  handleUpdateRekening,
  isRecalculating = false,
}) {
  const [tableFontSize, setTableFontSize] = useState("compact");
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

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
  } = useTablePagination(accounts, 10);

  const handleTriggerBulkDelete = () => {
    if (selectedCount === 0) return;
    if (setConfirmDialog) {
      setConfirmDialog({
        title: `Hapus ${selectedCount} Rekening Terpilih`,
        message: `Apakah Anda yakin ingin menghapus ${selectedCount} akun rekening/kas yang dipilih?`,
        confirmText: `Hapus ${selectedCount} Rekening`,
        confirmType: "danger",
        details: [
          { label: "Jumlah Rekening Terpilih", value: `${selectedCount} rekening`, isHighlight: true }
        ],
        onConfirm: async () => {
          setIsBulkDeleting(true);
          try {
            if (handleBulkDeleteRekening) {
              const ok = await handleBulkDeleteRekening(Array.from(selectedIds));
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
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {!isReadOnly && handleRecalculateAccounts && (
              <button
                type="button"
                className="btn-secondary-action"
                disabled={isRecalculating}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  fontSize: "12px",
                  fontWeight: "600",
                  padding: "7px 13px",
                  borderRadius: "8px",
                  background: "#ffffff",
                  color: "#0369a1",
                  border: "1.5px solid #bae6fd",
                  boxShadow: "0 1px 4px rgba(2, 132, 199, 0.08)",
                  cursor: isRecalculating ? "wait" : "pointer",
                  transition: "all 0.2s ease",
                }}
                onClick={handleRecalculateAccounts}
                title="Hitung ulang seluruh saldo kas dan bank agar cocok dengan transaksi yang ada atau kosongkan jika tidak ada transaksi"
              >
                <IconRefresh size={14} className={isRecalculating ? "spin-animate" : ""} />
                <span>{isRecalculating ? "Menyinkronkan..." : "Sinkronkan / Kosongkan Kas"}</span>
              </button>
            )}
            <TableActionMenu
              onRefresh={() => {}}
              fontSize={tableFontSize}
              onFontSizeChange={setTableFontSize}
            />
          </div>
        </div>

        {!isReadOnly && (
          <BulkActionBar
            selectedCount={selectedCount}
            totalItems={accounts.length}
            paginatedCount={paginatedItems.length}
            entityName="rekening"
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
                <th>Kode</th>
                <th>Nama Rekening</th>
                <th style={{ textAlign: "right" }}>Saldo Saat Ini</th>
                {!isReadOnly && <th style={{ textAlign: "center" }}>Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={!isReadOnly ? 5 : 4} style={{ textAlign: "center", padding: "24px", color: "var(--text-muted)" }}>
                    Belum ada rekening kas atau bank.
                  </td>
                </tr>
              ) : (
                paginatedItems.map(acc => (
                  <tr key={acc.id} className={selectedIds.has(acc.id) ? "row-selected" : ""}>
                    {!isReadOnly && (
                      <td style={{ textAlign: "center" }}>
                        <input
                          type="checkbox"
                          className="portal-checkbox"
                          checked={selectedIds.has(acc.id)}
                          onChange={() => toggleSelect(acc.id)}
                        />
                      </td>
                    )}
                    <td><code>{acc.code}</code></td>
                    <td style={{ fontWeight: "700" }}>{acc.name}</td>
                    <td style={{ textAlign: "right", fontWeight: "700", color: "#0284c7" }}>
                      {formatRupiah(acc.current_balance ?? acc.balance ?? 0)}
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
                ))
              )}
            </tbody>
          </table>
        </div>

        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={accounts.length}
          displayStart={displayStart}
          displayEnd={displayEnd}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          onPageChange={setCurrentPage}
        />
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
                    value={editAccItem.initial_balance ?? ""}
                    onChange={e => setEditAccItem({ ...editAccItem, initial_balance: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <label className="form-label" style={{ margin: 0 }}>Saldo Kas Saat Ini (Rp)</label>
                    <button
                      type="button"
                      style={{ fontSize: "11px", color: "#ef4444", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", fontWeight: "600" }}
                      onClick={() => setEditAccItem({ ...editAccItem, initial_balance: 0, current_balance: 0 })}
                    >
                      Kosongkan Saldo (Set Rp 0)
                    </button>
                  </div>
                  <input
                    className="form-control"
                    type="number"
                    value={editAccItem.current_balance ?? ""}
                    onChange={e => setEditAccItem({ ...editAccItem, current_balance: e.target.value })}
                    placeholder="Kosongkan untuk hitung otomatis dari transaksi"
                  />
                  <small style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginTop: "4px" }}>
                    Ubah langsung saldo ke 0 untuk mengosongkan nilai kas pada Harta Lancar neraca.
                  </small>
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
