import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  IconPlusCircle,
  IconCheckCircle,
  IconUsers,
  IconPrinter,
  IconRefresh,
  IconEdit,
  IconTrash
} from "../../Icons";
import { formatRupiah, API_BASE } from "../../utils/formatters";
import CustomDropdown from "../common/CustomDropdown";
import CustomDatePicker from "../common/CustomDatePicker";
import TableActionMenu from "../common/TableActionMenu";
import TablePagination from "../common/TablePagination";
import BulkActionBar from "../common/BulkActionBar";
import { useTablePagination } from "../common/useTablePagination";

export default function MasterDonatur({
  isReadOnly,
  masterMsg,
  handleTambahDonatur,
  newDonorName,
  setNewDonorName,
  newDonorPhone,
  setNewDonorPhone,
  newDonorAddress,
  setNewDonorAddress,
  donorsList = [],
  donorStartDate,
  donorEndDate,
  donorPosFilter,
  donorSearch,
  setDonorSearch,
  fetchDonors,
  setDonorPosFilter,
  setDonorStartDate,
  setDonorEndDate,
  categories,
  setEditDonorItem,
  handleDeleteDonatur,
  handleBulkDeleteDonatur,
  setConfirmDialog,
  editDonorItem,
  handleUpdateDonatur
}) {
  const [tableFontSize, setTableFontSize] = useState("compact");
  const [isRefreshing, setIsRefreshing] = useState(false);
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
  } = useTablePagination(donorsList, 10);

  const handleTriggerBulkDelete = () => {
    if (selectedCount === 0) return;
    if (setConfirmDialog) {
      setConfirmDialog({
        title: `Hapus ${selectedCount} Donatur Terpilih`,
        message: `Apakah Anda yakin ingin menghapus ${selectedCount} donatur yang dipilih? Donatur yang memiliki riwayat transaksi donasi akan dilewati demi integritas pembukuan.`,
        confirmText: `Hapus ${selectedCount} Donatur`,
        confirmType: "danger",
        details: [
          { label: "Jumlah Donatur Terpilih", value: `${selectedCount} donatur`, isHighlight: true }
        ],
        onConfirm: async () => {
          setIsBulkDeleting(true);
          try {
            if (handleBulkDeleteDonatur) {
              const ok = await handleBulkDeleteDonatur(Array.from(selectedIds));
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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (fetchDonors) await fetchDonors(donorSearch, donorStartDate, donorEndDate, donorPosFilter);
    setIsRefreshing(false);
  };

  return (
    <div className={!isReadOnly ? "desktop-2col-grid" : ""}>
      {!isReadOnly && (
        <div className="desktop-panel">
          <div className="panel-header">
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <IconPlusCircle size={18} color="var(--primary)" /> Tambah Donatur Baru
            </h3>
          </div>
          {masterMsg && <div className={`alert-box alert-${masterMsg.type}`}>{masterMsg.text}</div>}

          <form onSubmit={handleTambahDonatur}>
            <div className="form-group">
              <label className="form-label">Nama Lengkap Donatur</label>
              <input
                className="form-control"
                type="text"
                placeholder="Contoh: H. Ahmad Mansur"
                value={newDonorName}
                onChange={e => setNewDonorName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Nomor HP / WhatsApp</label>
              <input
                className="form-control"
                type="text"
                placeholder="081234567890"
                value={newDonorPhone}
                onChange={e => setNewDonorPhone(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Alamat / Asal Kota</label>
              <input
                className="form-control"
                type="text"
                placeholder="Contoh: Sumenep / Surabaya"
                value={newDonorAddress}
                onChange={e => setNewDonorAddress(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary-action">
              <IconCheckCircle size={18} color="white" />
              <span>Daftarkan Donatur</span>
            </button>
          </form>
        </div>
      )}

      <div className="desktop-panel">
        <div className="panel-header" style={{ flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <IconUsers size={18} color="var(--primary)" /> Database & Pemetaan Donatur ({donorsList.length})
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
              Pemetaan riwayat donasi donatur ke pos-pos program (SPM, IP, PML2, dll).
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              className="btn-secondary-action"
              style={{ padding: "6px 12px", fontSize: "13px" }}
              onClick={() => {
                const token = localStorage.getItem("token") || "";
                let url = `${API_BASE}/reports/pdf/donatur?token=${encodeURIComponent(token)}&`;
                if (donorStartDate) url += `start_date=${donorStartDate}&`;
                if (donorEndDate) url += `end_date=${donorEndDate}&`;
                if (donorPosFilter) url += `pos=${encodeURIComponent(donorPosFilter)}&`;
                window.open(url, "_blank");
              }}
              title="Cetak PDF Rekapitulasi Donatur"
            >
              <IconPrinter size={15} />
              <span>Cetak PDF</span>
            </button>
            <TableActionMenu
              onRefresh={handleRefresh}
              isRefreshing={isRefreshing}
              fontSize={tableFontSize}
              onFontSizeChange={setTableFontSize}
            />
          </div>
        </div>

        {/* Filter Bar Donatur */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "10px", marginBottom: "16px", background: "var(--surface-subtle)", padding: "12px", borderRadius: "8px" }}>
          <div>
            <label style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Cari Nama:</label>
            <input
              type="text"
              className="form-control"
              style={{ fontSize: "13px", padding: "6px 10px" }}
              placeholder="Ketik nama..."
              value={donorSearch}
              onChange={e => {
                setDonorSearch(e.target.value);
                fetchDonors(e.target.value, donorStartDate, donorEndDate, donorPosFilter);
              }}
            />
          </div>
          <div style={{ minWidth: "180px" }}>
            <label style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Pos Program:</label>
            <CustomDropdown
              value={donorPosFilter}
              size="sm"
              searchable={categories.filter(c => c.is_active).length > 5}
              searchPlaceholder="Cari pos..."
              onChange={e => {
                const val = e.target.value;
                setDonorPosFilter(val);
                fetchDonors(donorSearch, donorStartDate, donorEndDate, val);
              }}
              options={[
                { value: "", label: "Semua Pos Program" },
                ...categories.filter(c => c.is_active).map(c => ({
                  value: c.code,
                  label: `[${c.code}] ${c.name}`
                }))
              ]}
            />
          </div>
          <div>
            <label style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Dari Tanggal:</label>
            <CustomDatePicker
              value={donorStartDate}
              onChange={e => {
                setDonorStartDate(e.target.value);
                fetchDonors(donorSearch, e.target.value, donorEndDate, donorPosFilter);
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Sampai Tanggal:</label>
            <CustomDatePicker
              value={donorEndDate}
              onChange={e => {
                setDonorEndDate(e.target.value);
                fetchDonors(donorSearch, donorStartDate, e.target.value, donorPosFilter);
              }}
            />
          </div>
        </div>

        {!isReadOnly && (
          <BulkActionBar
            selectedCount={selectedCount}
            totalItems={donorsList.length}
            paginatedCount={paginatedItems.length}
            entityName="donatur"
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
                <th>Donatur</th>
                <th>Kontak & Alamat</th>
                <th>Pemetaan Pos Program</th>
                <th style={{ textAlign: "center" }}>Frekuensi</th>
                <th style={{ textAlign: "right" }}>Total Donasi</th>
                {!isReadOnly && <th style={{ textAlign: "center" }}>Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={!isReadOnly ? 7 : 5} style={{ textAlign: "center", padding: "24px", color: "var(--text-muted)" }}>
                    Tidak ada data donatur yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                paginatedItems.map(d => (
                  <tr key={d.id} className={selectedIds.has(d.id) ? "row-selected" : ""}>
                    {!isReadOnly && (
                      <td style={{ textAlign: "center" }}>
                        <input
                          type="checkbox"
                          className="portal-checkbox"
                          checked={selectedIds.has(d.id)}
                          onChange={() => toggleSelect(d.id)}
                        />
                      </td>
                    )}
                    <td>
                      <strong style={{ display: "block", color: "var(--text-main)" }}>{d.name}</strong>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>ID #{d.id}</span>
                    </td>
                    <td style={{ fontSize: "12px" }}>
                      <div>📱 {d.phone || "-"}</div>
                      <div style={{ color: "var(--text-muted)" }}>📍 {d.address || "-"}</div>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                        {Array.isArray(d.pos_breakdown) && d.pos_breakdown.length > 0 ? (
                          d.pos_breakdown.map((pb, idx) => (
                            <span
                              key={idx}
                              className="badge-tag badge-pos"
                              title={`${pb.name || pb.code}: ${formatRupiah(pb.total || 0)} (${pb.count || 1}x)`}
                              style={{ fontSize: "11px", padding: "2px 6px" }}
                            >
                              {pb.code || "POS"}: {formatRupiah(pb.total || 0)}
                            </span>
                          ))
                        ) : (d.pos_breakdown && typeof d.pos_breakdown === "object" && Object.keys(d.pos_breakdown).length > 0) ? (
                          Object.entries(d.pos_breakdown).map(([code, val], idx) => (
                            <span
                              key={idx}
                              className="badge-tag badge-pos"
                              title={`${code}: ${formatRupiah(typeof val === "object" ? val.total || 0 : val)}`}
                              style={{ fontSize: "11px", padding: "2px 6px" }}
                            >
                              {code}: {formatRupiah(typeof val === "object" ? val.total || 0 : val)}
                            </span>
                          ))
                        ) : (
                          <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>-</span>
                        )}
                      </div>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <span className="badge-tag" style={{ background: "#f0f9ff", color: "#0284c7", fontWeight: "700" }}>
                        {d.frekuensi}x
                      </span>
                    </td>
                    <td style={{ textAlign: "right", fontWeight: "800", color: "var(--primary)" }}>
                      {formatRupiah(d.total_donasi)}
                    </td>
                    {!isReadOnly && (
                      <td style={{ textAlign: "center" }}>
                        <div style={{ display: "inline-flex", gap: "6px" }}>
                          <button
                            type="button"
                            title="Edit Data Donatur"
                            className="btn-edit-cell"
                            onClick={() => setEditDonorItem({ ...d })}
                          >
                            <IconEdit size={14} />
                          </button>
                          <button
                            type="button"
                            title="Hapus Donatur"
                            className="btn-delete-cell"
                            onClick={() => handleDeleteDonatur(d)}
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
          totalItems={donorsList.length}
          displayStart={displayStart}
          displayEnd={displayEnd}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* MODAL EDIT MASTER DONATUR */}
      {editDonorItem && createPortal(
        <div className="modal-backdrop-custom" onClick={() => setEditDonorItem(null)}>
          <div className="modal-card-custom" onClick={e => e.stopPropagation()}>
            <div className="modal-header-custom">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div className="modal-header-icon-circle">
                  <IconUsers size={18} color="currentColor" />
                </div>
                <div>
                  <h3>Edit Profil Donatur</h3>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "2px 0 0 0" }}>Perbarui identitas, kontak, dan alamat donatur</p>
                </div>
              </div>
              <button className="btn-close-modal" onClick={() => setEditDonorItem(null)} title="Tutup">✕</button>
            </div>
            <form onSubmit={handleUpdateDonatur}>
              <div className="modal-body-custom">
                <div className="form-group">
                  <label className="form-label">Nama Lengkap Donatur</label>
                  <input
                    className="form-control"
                    type="text"
                    value={editDonorItem.name}
                    onChange={e => setEditDonorItem({ ...editDonorItem, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Nomor Telepon / WhatsApp</label>
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Contoh: 08123456789"
                    value={editDonorItem.phone || ""}
                    onChange={e => setEditDonorItem({ ...editDonorItem, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Alamat / Asal Kota</label>
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Contoh: Surabaya, Jawa Timur"
                    value={editDonorItem.address || ""}
                    onChange={e => setEditDonorItem({ ...editDonorItem, address: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer-custom">
                <button type="button" className="btn-secondary" onClick={() => setEditDonorItem(null)}>Batal</button>
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
