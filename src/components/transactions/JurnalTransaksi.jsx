import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  IconTable,
  IconRefresh,
  IconSearch,
  IconEdit,
  IconTrash,
  IconEye,
  IconCheckCircle,
  IconCamera,
  IconImage,
  IconTrendingUp,
  IconTrendingDown
} from "../../Icons";
import { formatRupiah, compressImage } from "../../utils/formatters";
import CustomDropdown from "../common/CustomDropdown";
import CustomDatePicker from "../common/CustomDatePicker";
import TableActionMenu from "../common/TableActionMenu";
import TablePagination from "../common/TablePagination";
import BulkActionBar from "../common/BulkActionBar";
import ConfirmModal from "../common/ConfirmModal";
import { useTablePagination } from "../common/useTablePagination";

export default function JurnalTransaksi({
  allTransactions = [],
  filteredTransactions = [],
  categories = [],
  accounts = [],
  searchFilter,
  setSearchFilter,
  posFilter,
  setPosFilter,
  jenisFilter,
  setJenisFilter,
  fetchTransactions,
  isReadOnly = false,
  isAdmin = true,
  canManageMaster = true,
  editTxItem,
  setEditTxItem,
  handleUpdateTransaction,
  handleDeleteTransaction,
  handleBulkDeleteTransactions,
  setConfirmDialog
}) {
  const [tableFontSize, setTableFontSize] = useState("compact");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewDetailTx, setViewDetailTx] = useState(null); // Modal view detail / bukti
  const [editFormData, setEditFormData] = useState(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [deleteConfirmTx, setDeleteConfirmTx] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [showBulkConfirmModal, setShowBulkConfirmModal] = useState(false);

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
  } = useTablePagination(filteredTransactions, 10);

  const handleTriggerBulkDelete = () => {
    if (selectedCount === 0) return;
    if (setConfirmDialog) {
      setConfirmDialog({
        title: `Hapus ${selectedCount} Transaksi Terpilih`,
        message: `Apakah Anda yakin ingin menghapus ${selectedCount} data transaksi terpilih secara permanen? Mutasi saldo kas rekening terkait akan disinkronkan kembali.`,
        confirmText: `Hapus ${selectedCount} Transaksi`,
        confirmType: "danger",
        details: [
          { label: "Jumlah Transaksi Terpilih", value: `${selectedCount} transaksi`, isHighlight: true },
        ],
        onConfirm: async () => {
          setIsBulkDeleting(true);
          try {
            if (handleBulkDeleteTransactions) {
              const ok = await handleBulkDeleteTransactions(Array.from(selectedIds));
              if (ok) clearSelection();
            }
          } finally {
            setIsBulkDeleting(false);
            setConfirmDialog(null);
          }
        }
      });
    } else {
      setShowBulkConfirmModal(true);
    }
  };

  const executeBulkDeleteLocal = async () => {
    setIsBulkDeleting(true);
    try {
      if (handleBulkDeleteTransactions) {
        const ok = await handleBulkDeleteTransactions(Array.from(selectedIds));
        if (ok) clearSelection();
      }
    } finally {
      setIsBulkDeleting(false);
      setShowBulkConfirmModal(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (fetchTransactions) await fetchTransactions();
    setIsRefreshing(false);
  };

  const executeDelete = async () => {
    if (!deleteConfirmTx) return;
    setIsDeleting(true);
    if (handleDeleteTransaction) {
      await handleDeleteTransaction(deleteConfirmTx);
    }
    setIsDeleting(false);
    setDeleteConfirmTx(null);
  };

  const openEditModal = (tx) => {
    const foundCat = categories.find(c => c.name === tx.pos_program || c.code === tx.pos_code);
    const foundAcc = accounts.find(a => a.name === tx.metode);
    
    setEditFormData({
      id: tx.id,
      tanggal: tx.tanggal,
      jenis: tx.jenis || "income",
      category_id: tx.category_id || (foundCat ? foundCat.id : (categories[0]?.id || 1)),
      metode: tx.account_id || (foundAcc ? foundAcc.id : (accounts[0]?.id || 1)),
      donatur: tx.donatur || "",
      nominal: tx.nominal || 0,
      keterangan: tx.keterangan || "",
      bukti_foto_current: tx.bukti_foto || null,
      bukti_foto_file: null,
      bukti_foto_preview: null
    });
  };

  const handlePhotoEditChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      setEditFormData(prev => ({
        ...prev,
        bukti_foto_file: compressed,
        bukti_foto_preview: URL.createObjectURL(compressed)
      }));
    } catch (err) {
      setEditFormData(prev => ({
        ...prev,
        bukti_foto_file: file,
        bukti_foto_preview: URL.createObjectURL(file)
      }));
    }
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    if (!editFormData) return;
    setIsSavingEdit(true);
    if (handleUpdateTransaction) {
      await handleUpdateTransaction(e, editFormData);
    }
    setIsSavingEdit(false);
    setEditFormData(null);
  };

  return (
    <div className="desktop-panel">
      <div className="panel-header">
        <div>
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <IconTable size={18} color="var(--primary)" /> Jurnal Mutasi Kas & Bank
          </h3>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            Seluruh riwayat transaksi donasi masuk dan realisasi belanja pos. Kelola, edit, dan hapus transaksi pembukuan.
          </p>
        </div>
        <TableActionMenu
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          fontSize={tableFontSize}
          onFontSizeChange={setTableFontSize}
        />
      </div>

      <div className="filter-bar-desktop" style={{ alignItems: "center" }}>
        <div className="filter-input-wrap">
          <IconSearch size={15} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Cari donatur, pos, atau keterangan..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
        </div>
        <div style={{ minWidth: "180px" }}>
          <CustomDropdown
            value={posFilter}
            onChange={(e) => setPosFilter(e.target.value)}
            placeholder="Semua Pos Program"
            searchable={categories.length > 5}
            searchPlaceholder="Cari pos..."
            options={[
              { value: "", label: "Semua Pos Program" },
              ...categories.map((c) => ({
                value: c.name,
                label: c.name
              }))
            ]}
          />
        </div>
        <div style={{ minWidth: "180px" }}>
          <CustomDropdown
            value={jenisFilter}
            onChange={(e) => setJenisFilter(e.target.value)}
            placeholder="Semua Jenis Transaksi"
            options={[
              { value: "", label: "Semua Jenis Transaksi" },
              { value: "income", label: "Donasi Masuk (Income)" },
              { value: "expense", label: "Pengeluaran Pos (Expense)" }
            ]}
          />
        </div>
      </div>

      {!isReadOnly && (
        <BulkActionBar
          selectedCount={selectedCount}
          totalItems={filteredTransactions.length}
          paginatedCount={paginatedItems.length}
          entityName="transaksi"
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
              <th>Donatur / Penerima</th>
              <th>Pos Program</th>
              <th>Rekening / Metode</th>
              <th>Keterangan</th>
              <th style={{ textAlign: "right" }}>Nominal</th>
              <th style={{ textAlign: "center" }}>Bukti</th>
              {!isReadOnly && <th style={{ textAlign: "center", width: "130px" }}>Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={!isReadOnly ? 9 : 7} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                  Tidak ada transaksi yang sesuai dengan filter.
                </td>
              </tr>
            ) : (
              paginatedItems.map((tx) => (
                <tr key={tx.id} className={selectedIds.has(tx.id) ? "row-selected" : ""}>
                  {!isReadOnly && (
                    <td style={{ textAlign: "center" }}>
                      <input
                        type="checkbox"
                        className="portal-checkbox"
                        checked={selectedIds.has(tx.id)}
                        onChange={() => toggleSelect(tx.id)}
                      />
                    </td>
                  )}
                  <td><code>{tx.tanggal}</code></td>
                  <td style={{ fontWeight: "700" }}>{tx.donatur}</td>
                  <td><span className="badge-tag badge-pos">{tx.pos_program}</span></td>
                  <td>{tx.metode}</td>
                  <td>{tx.keterangan || "-"}</td>
                  <td style={{ textAlign: "right", fontWeight: "700" }} className={tx.jenis === "income" ? "color-income" : "color-expense"}>
                    {tx.jenis === "income" ? `+ ${formatRupiah(tx.nominal)}` : `- ${formatRupiah(tx.nominal)}`}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {tx.bukti_foto ? (
                      <button
                        type="button"
                        className="btn-action-icon view"
                        title="Lihat Foto Bukti"
                        onClick={() => setViewDetailTx(tx)}
                        style={{ padding: "4px 8px", fontSize: "12px", borderRadius: "6px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                      >
                        <IconEye size={14} /> Lihat
                      </button>
                    ) : (
                      <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>-</span>
                    )}
                  </td>
                  {!isReadOnly && (
                    <td style={{ textAlign: "center" }}>
                      <div style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
                        <button
                          type="button"
                          className="btn-action-icon edit"
                          title="Edit Transaksi"
                          onClick={() => openEditModal(tx)}
                        >
                          <IconEdit size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn-action-icon delete"
                          title="Hapus Transaksi"
                          onClick={() => setDeleteConfirmTx(tx)}
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
        totalItems={filteredTransactions.length}
        displayStart={displayStart}
        displayEnd={displayEnd}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        onPageChange={setCurrentPage}
        unfilteredTotal={allTransactions.length}
      />

      {showBulkConfirmModal && (
        <ConfirmModal
          isOpen={showBulkConfirmModal}
          onClose={() => setShowBulkConfirmModal(false)}
          onConfirm={executeBulkDeleteLocal}
          title={`Hapus ${selectedCount} Transaksi Terpilih`}
          message={`Apakah Anda yakin ingin menghapus ${selectedCount} transaksi terpilih sekaligus? Mutasi kas rekening terkait akan dikembalikan secara otomatis.`}
          confirmText={`Hapus ${selectedCount} Transaksi`}
          confirmType="danger"
          isLoading={isBulkDeleting}
          details={[
            { label: "Jumlah Transaksi Terpilih", value: `${selectedCount} transaksi`, isHighlight: true }
          ]}
        />
      )}

      {/* MODAL 1: LIHAT DETAIL & FOTO BUKTI (PORTAL KE BODY) */}
      {viewDetailTx && createPortal(
        <div className="modal-backdrop-custom" onClick={() => setViewDetailTx(null)}>
          <div className="modal-box-custom" style={{ maxWidth: "560px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-custom">
              <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <IconEye size={20} color="var(--primary)" /> Detail Transaksi & Bukti
              </h3>
              <button type="button" className="btn-close-modal" onClick={() => setViewDetailTx(null)}>✕</button>
            </div>
            <div className="modal-body-custom" style={{ padding: "16px 20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px", fontSize: "13.5px" }}>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase" }}>Tanggal</span>
                  <strong>{viewDetailTx.tanggal}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase" }}>Jenis</span>
                  <span className={`badge-tag ${viewDetailTx.jenis === "income" ? "badge-income" : "badge-expense"}`}>
                    {viewDetailTx.jenis === "income" ? "Donasi Masuk" : "Pengeluaran Pos"}
                  </span>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase" }}>Nama Donatur / Pihak</span>
                  <strong>{viewDetailTx.donatur}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase" }}>Pos Program</span>
                  <span className="badge-tag badge-pos">{viewDetailTx.pos_program}</span>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase" }}>Rekening Penyimpanan</span>
                  <strong>{viewDetailTx.metode}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase" }}>Nominal</span>
                  <strong style={{ fontSize: "16px" }} className={viewDetailTx.jenis === "income" ? "color-income" : "color-expense"}>
                    {formatRupiah(viewDetailTx.nominal)}
                  </strong>
                </div>
              </div>

              {viewDetailTx.keterangan && (
                <div style={{ marginBottom: "16px", fontSize: "13px", background: "rgba(0,0,0,0.02)", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                  <span style={{ color: "var(--text-muted)", display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", marginBottom: "4px" }}>Keterangan / Catatan</span>
                  {viewDetailTx.keterangan}
                </div>
              )}

              {viewDetailTx.bukti_foto ? (
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", marginBottom: "8px" }}>Foto Bukti Fisik / Kwitansi</span>
                  <div style={{ textAlign: "center", background: "#f8fafc", padding: "12px", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
                    <img
                      src={viewDetailTx.bukti_foto}
                      alt="Bukti Transaksi"
                      style={{ maxWidth: "100%", maxHeight: "320px", objectFit: "contain", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                    />
                    <div style={{ marginTop: "10px" }}>
                      <a
                        href={viewDetailTx.bukti_foto}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-primary-sm"
                        style={{ textDecoration: "none", display: "inline-block" }}
                      >
                        Buka Foto Penuh di Tab Baru
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <p style={{ color: "var(--text-muted)", fontStyle: "italic", fontSize: "13px" }}>Tidak ada lampiran foto bukti pada transaksi ini.</p>
              )}
            </div>
            <div className="modal-footer-custom">
              <button type="button" className="btn-secondary" onClick={() => setViewDetailTx(null)}>Tutup</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 2: EDIT TRANSAKSI (PORTAL KE BODY) */}
      {editFormData && createPortal(
        <div className="modal-backdrop-custom" onClick={() => setEditFormData(null)}>
          <div className="modal-box-custom" style={{ maxWidth: "600px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-custom">
              <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <IconEdit size={20} color="var(--primary)" /> Edit Transaksi #{editFormData.id}
              </h3>
              <button type="button" className="btn-close-modal" onClick={() => setEditFormData(null)}>✕</button>
            </div>
            <form onSubmit={submitEdit}>
              <div className="modal-body-custom" style={{ maxHeight: "75vh", overflowY: "auto", padding: "16px 20px" }}>
                <div className="form-grid-2col">
                  <div className="form-group">
                    <label className="form-label">Tanggal Transaksi</label>
                    <CustomDatePicker
                      value={editFormData.tanggal}
                      onChange={(e) => setEditFormData({ ...editFormData, tanggal: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Jenis Transaksi</label>
                    <CustomDropdown
                      value={editFormData.jenis}
                      onChange={(e) => setEditFormData({ ...editFormData, jenis: e.target.value })}
                      options={[
                        { value: "income", label: "Donasi Masuk (Income)" },
                        { value: "expense", label: "Penyaluran / Beban (Expense)" }
                      ]}
                      required
                    />
                  </div>
                </div>

                <div className="form-grid-2col">
                  <div className="form-group">
                    <label className="form-label">Pos Program / Alokasi</label>
                    <CustomDropdown
                      value={editFormData.category_id}
                      onChange={(e) => setEditFormData({ ...editFormData, category_id: e.target.value })}
                      searchable={categories.length > 5}
                      searchPlaceholder="Cari pos..."
                      options={categories.map((c) => ({
                        value: c.id,
                        label: `[${c.code || "POS"}] ${c.nama_kategori || c.name}`
                      }))}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Rekening Kas / Bank</label>
                    <CustomDropdown
                      value={editFormData.metode}
                      onChange={(e) => setEditFormData({ ...editFormData, metode: e.target.value })}
                      options={accounts.map((a) => ({
                        value: a.id,
                        label: a.name
                      }))}
                      required
                    />
                  </div>
                </div>

                <div className="form-grid-2col">
                  <div className="form-group">
                    <label className="form-label">
                      {editFormData.jenis === "income" ? "Nama Donatur / Penyumbang" : "Penerima Dana / Keperluan"}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Contoh: H. Ahmad Mansur"
                      value={editFormData.donatur}
                      onChange={(e) => setEditFormData({ ...editFormData, donatur: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nominal (Rp)</label>
                    <div className="input-prefix-wrapper">
                      <span className="input-prefix">Rp</span>
                      <input
                        type="number"
                        className="form-control with-prefix"
                        placeholder="500000"
                        value={editFormData.nominal}
                        onChange={(e) => setEditFormData({ ...editFormData, nominal: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Keterangan / Catatan</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Catatan donatur / rincian pengeluaran..."
                    value={editFormData.keterangan}
                    onChange={(e) => setEditFormData({ ...editFormData, keterangan: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Foto Bukti / Kwitansi</label>
                  <div style={{ background: "rgba(0,0,0,0.02)", border: "1px dashed var(--border-color)", padding: "12px", borderRadius: "10px" }}>
                    {editFormData.bukti_foto_preview || editFormData.bukti_foto_current ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <img
                          src={editFormData.bukti_foto_preview || editFormData.bukti_foto_current}
                          alt="Preview Bukti"
                          style={{ width: "70px", height: "70px", objectFit: "cover", borderRadius: "8px", border: "1px solid var(--border-color)" }}
                        />
                        <div>
                          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px" }}>
                            {editFormData.bukti_foto_preview ? "Foto baru dipilih" : "Foto bukti saat ini"}
                          </div>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <label className="btn-secondary" style={{ cursor: "pointer", fontSize: "12px", padding: "4px 10px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <IconCamera size={14} /> Ganti Foto
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoEditChange}
                                style={{ display: "none" }}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: "10px" }}>
                        <label className="btn-secondary" style={{ cursor: "pointer", fontSize: "13px", padding: "6px 14px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <IconCamera size={16} /> Unggah Foto Bukti
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoEditChange}
                            style={{ display: "none" }}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer-custom">
                <button type="button" className="btn-secondary" onClick={() => setEditFormData(null)} disabled={isSavingEdit}>
                  Batal
                </button>
                <button type="submit" className="btn-primary" disabled={isSavingEdit}>
                  {isSavingEdit ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 3: POPUP KONFIRMASI HAPUS TRANSAKSI (PORTAL KE BODY) */}
      {deleteConfirmTx && createPortal(
        <div className="modal-backdrop-custom" onClick={() => !isDeleting && setDeleteConfirmTx(null)}>
          <div className="modal-box-custom" style={{ maxWidth: "460px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-custom" style={{ borderBottomColor: "#fee2e2", background: "#fef2f2" }}>
              <h3 style={{ display: "flex", alignItems: "center", gap: "8px", color: "#dc2626" }}>
                <IconTrash size={20} color="#dc2626" /> Konfirmasi Hapus Transaksi
              </h3>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => !isDeleting && setDeleteConfirmTx(null)}
                disabled={isDeleting}
              >
                ✕
              </button>
            </div>
            <div className="modal-body-custom" style={{ padding: "20px" }}>
              <p style={{ fontSize: "14px", color: "var(--text-main)", marginBottom: "14px", lineHeight: "1.5" }}>
                Apakah Anda yakin ingin menghapus transaksi pembukuan ini? Tindakan ini akan <strong>menyesuaikan kembali saldo kas / rekening</strong> secara otomatis.
              </p>

              <div style={{ background: "rgba(0,0,0,0.03)", padding: "12px 14px", borderRadius: "12px", border: "1px solid var(--border-color)", fontSize: "13px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ color: "var(--text-muted)" }}>Tanggal:</span>
                  <strong>{deleteConfirmTx.tanggal}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ color: "var(--text-muted)" }}>Donatur / Pihak:</span>
                  <strong>{deleteConfirmTx.donatur || "-"}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ color: "var(--text-muted)" }}>Pos Program:</span>
                  <span className="badge-tag badge-pos">{deleteConfirmTx.pos_program}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ color: "var(--text-muted)" }}>Rekening:</span>
                  <strong>{deleteConfirmTx.metode}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px dashed var(--border-color)", paddingTop: "6px", marginTop: "6px" }}>
                  <span style={{ color: "var(--text-muted)" }}>Nominal:</span>
                  <strong className={deleteConfirmTx.jenis === "income" ? "color-income" : "color-expense"} style={{ fontSize: "15px" }}>
                    {deleteConfirmTx.jenis === "income" ? `+ ${formatRupiah(deleteConfirmTx.nominal)}` : `- ${formatRupiah(deleteConfirmTx.nominal)}`}
                  </strong>
                </div>
              </div>
            </div>
            <div className="modal-footer-custom">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setDeleteConfirmTx(null)}
                disabled={isDeleting}
              >
                Batal
              </button>
              <button
                type="button"
                className="btn-primary"
                style={{ background: "#dc2626", borderColor: "#b91c1c", color: "#ffffff", boxShadow: "0 4px 12px rgba(220, 38, 38, 0.25)" }}
                onClick={executeDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus Transaksi"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
