import React, { useState } from "react";
import { createPortal } from "react-dom";
import { IconPlusCircle, IconCheckCircle, IconTable, IconEdit, IconTrash, IconRefresh } from "../../Icons";
import CustomDropdown from "../common/CustomDropdown";
import TableActionMenu from "../common/TableActionMenu";
import TablePagination from "../common/TablePagination";
import BulkActionBar from "../common/BulkActionBar";
import { useTablePagination } from "../common/useTablePagination";

export default function MasterPosProgram({
  isReadOnly,
  masterMsg,
  handleTambahPos,
  newCatCode,
  setNewCatCode,
  newCatType,
  setNewCatType,
  newCatName,
  setNewCatName,
  newCatPic,
  setNewCatPic,
  newCatDigit,
  setNewCatDigit,
  newCatDesc,
  setNewCatDesc,
  categories = [],
  setEditCatItem,
  handleDeletePos,
  handleBulkDeletePos,
  setConfirmDialog,
  editCatItem,
  handleUpdatePos,
  handleReallocateQris,
  isReallocating,
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
  } = useTablePagination(categories, 10);

  const handleTriggerBulkDelete = () => {
    if (selectedCount === 0) return;
    if (setConfirmDialog) {
      setConfirmDialog({
        title: `Hapus ${selectedCount} Pos Program Terpilih`,
        message: `Apakah Anda yakin ingin menonaktifkan/menghapus ${selectedCount} pos program yang dipilih?`,
        confirmText: `Hapus ${selectedCount} Pos`,
        confirmType: "warning",
        details: [
          { label: "Jumlah Pos Terpilih", value: `${selectedCount} pos`, isHighlight: true }
        ],
        onConfirm: async () => {
          setIsBulkDeleting(true);
          try {
            if (handleBulkDeletePos) {
              const ok = await handleBulkDeletePos(Array.from(selectedIds));
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
    <div className="master-pos-container">
      <div className={!isReadOnly ? "desktop-2col-grid" : ""}>
        {!isReadOnly && (
          <div className="desktop-panel">
            <div className="panel-header">
              <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <IconPlusCircle size={18} color="var(--primary)" /> Tambah Master Pos Program Baru
              </h3>
            </div>
            {masterMsg && <div className={`alert-box alert-${masterMsg.type}`}>{masterMsg.text}</div>}

            <form onSubmit={handleTambahPos}>
              <div className="form-grid-2col">
                <div className="form-group">
                  <label className="form-label">Kode Singkat Pos (Unik)</label>
                  <input className="form-control" type="text" placeholder="Contoh: ASRAMA3" value={newCatCode} onChange={e => setNewCatCode(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Jenis Pos Program</label>
                  <CustomDropdown
                    value={newCatType}
                    onChange={e => setNewCatType(e.target.value)}
                    options={[
                      { value: "proyek_pembangunan", label: "Proyek Pembangunan Fisik" },
                      { value: "non_pembangunan", label: "Non-Pembangunan / Operasional / Sosial" }
                    ]}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Nama Lengkap Pos Program</label>
                <input className="form-control" type="text" placeholder="Contoh: Pembangunan Asrama Baru Tahap III" value={newCatName} onChange={e => setNewCatName(e.target.value)} required />
              </div>

              <div className="form-grid-2col">
                <div className="form-group">
                  <label className="form-label">Nama Penanggung Jawab (Penjab)</label>
                  <input className="form-control" type="text" placeholder="Contoh: Ainul Fais" value={newCatPic} onChange={e => setNewCatPic(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Digit Unik QRIS (Opsional)</label>
                  <input className="form-control" type="text" placeholder="Contoh: 15" value={newCatDigit} onChange={e => setNewCatDigit(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Keterangan / Deskripsi Pos</label>
                <input className="form-control" type="text" placeholder="Deskripsi peruntukan pos..." value={newCatDesc} onChange={e => setNewCatDesc(e.target.value)} />
              </div>

              <button type="submit" className="btn-primary-action">
                <IconCheckCircle size={18} color="white" />
                <span>Tambah Pos Program</span>
              </button>
            </form>
          </div>
        )}

        <div className="desktop-panel">
          <div className="panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
              <IconTable size={18} color="var(--primary)" /> Daftar Master Pos Program ({categories.length})
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {!isReadOnly && handleReallocateQris && (
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ fontSize: "12px", padding: "6px 12px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                  onClick={handleReallocateQris}
                  disabled={isReallocating}
                  title="Sinkronkan alokasi pos transaksi QRIS berdasarkan digit terbaru"
                >
                  <IconRefresh size={14} />
                  <span>{isReallocating ? "Sinkronisasi..." : "Sinkronkan Alokasi QRIS"}</span>
                </button>
              )}
              <TableActionMenu
                fontSize={tableFontSize}
                onFontSizeChange={setTableFontSize}
              />
            </div>
          </div>

          {!isReadOnly && (
            <BulkActionBar
              selectedCount={selectedCount}
              totalItems={categories.length}
              paginatedCount={paginatedItems.length}
              entityName="pos program"
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
                <th>Nama Pos Program</th>
                <th>Jenis</th>
                <th>Penjab</th>
                <th>Status</th>
                {!isReadOnly && <th style={{ textAlign: "center" }}>Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={!isReadOnly ? 7 : 5} style={{ textAlign: "center", padding: "24px", color: "var(--text-muted)" }}>
                    Belum ada pos program.
                  </td>
                </tr>
              ) : (
                paginatedItems.map(c => (
                  <tr key={c.id} className={selectedIds.has(c.id) ? "row-selected" : ""}>
                    {!isReadOnly && (
                      <td style={{ textAlign: "center" }}>
                        <input
                          type="checkbox"
                          className="portal-checkbox"
                          checked={selectedIds.has(c.id)}
                          onChange={() => toggleSelect(c.id)}
                        />
                      </td>
                    )}
                    <td><span className="badge-tag badge-pos">{c.code}</span></td>
                    <td style={{ fontWeight: "700" }}>{c.name}</td>
                    <td>
                      <span className="badge-tag" style={{ background: c.category_type === 'non_pembangunan' ? '#eff6ff' : '#f0f9ff', color: c.category_type === 'non_pembangunan' ? '#1d4ed8' : '#0284c7' }}>
                        {c.category_type === 'non_pembangunan' ? 'Non-Proyek' : 'Proyek Fisik'}
                      </span>
                    </td>
                    <td>{c.pic_name || "-"}</td>
                    <td>
                      <span className={`badge-tag ${c.is_active ? "badge-income" : "badge-expense"}`}>
                        {c.is_active ? "Aktif" : "Non-Aktif"}
                      </span>
                    </td>
                    {!isReadOnly && (
                      <td style={{ textAlign: "center" }}>
                        <div style={{ display: "inline-flex", gap: "6px" }}>
                          <button
                            type="button"
                            className="btn-edit-cell"
                            title="Edit Pos Program"
                            onClick={() => setEditCatItem({ ...c })}
                          >
                            <IconEdit size={14} />
                          </button>
                          <button
                            type="button"
                            className="btn-delete-cell"
                            title="Nonaktifkan Pos"
                            onClick={() => handleDeletePos(c)}
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
          totalItems={categories.length}
          displayStart={displayStart}
          displayEnd={displayEnd}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>

      {/* MODAL EDIT MASTER POS */}
      {editCatItem && createPortal(
        <div className="modal-backdrop-custom" onClick={() => setEditCatItem(null)}>
          <div className="modal-card-custom" onClick={e => e.stopPropagation()}>
            <div className="modal-header-custom">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div className="modal-header-icon-circle">
                  <IconEdit size={18} color="currentColor" />
                </div>
                <div>
                  <h3>Edit Pos Program [{editCatItem.code}]</h3>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "2px 0 0 0" }}>Perbarui identitas dan status pos program</p>
                </div>
              </div>
              <button className="btn-close-modal" onClick={() => setEditCatItem(null)} title="Tutup">✕</button>
            </div>
            <form onSubmit={handleUpdatePos}>
              <div className="modal-body-custom">
                <div className="form-group">
                  <label className="form-label">Nama Lengkap Pos Program</label>
                  <input
                    className="form-control"
                    type="text"
                    value={editCatItem.name}
                    onChange={e => setEditCatItem({ ...editCatItem, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-grid-2col">
                  <div className="form-group">
                    <label className="form-label">Jenis Pos Program</label>
                    <CustomDropdown
                      value={editCatItem.category_type || "proyek_pembangunan"}
                      onChange={e => setEditCatItem({ ...editCatItem, category_type: e.target.value })}
                      options={[
                        { value: "proyek_pembangunan", label: "Proyek Pembangunan Fisik" },
                        { value: "non_pembangunan", label: "Non-Pembangunan / Operasional / Sosial" }
                      ]}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Penanggung Jawab (Penjab)</label>
                    <input
                      className="form-control"
                      type="text"
                      value={editCatItem.pic_name || ""}
                      onChange={e => setEditCatItem({ ...editCatItem, pic_name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-grid-2col">
                  <div className="form-group">
                    <label className="form-label">Digit Unik QRIS</label>
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Contoh: 2 (atau kosongkan jika non-QRIS)"
                      value={editCatItem.qris_digit ?? editCatItem.qris_unit_digit ?? ""}
                      onChange={e => setEditCatItem({ ...editCatItem, qris_digit: e.target.value, qris_unit_digit: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status Pos Program</label>
                    <CustomDropdown
                      value={editCatItem.is_active ? "1" : "0"}
                      onChange={e => setEditCatItem({ ...editCatItem, is_active: e.target.value === "1" })}
                      options={[
                        { value: "1", label: "Aktif" },
                        { value: "0", label: "Non-Aktif" }
                      ]}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer-custom">
                <button type="button" className="btn-secondary" onClick={() => setEditCatItem(null)}>Batal</button>
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
