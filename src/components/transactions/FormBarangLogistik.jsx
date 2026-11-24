import React, { useState } from "react";
import { IconPackage, IconCheckCircle, IconTrash } from "../../Icons";
import CustomDropdown from "../common/CustomDropdown";
import CustomDatePicker from "../common/CustomDatePicker";
import TableActionMenu from "../common/TableActionMenu";
import TablePagination from "../common/TablePagination";
import BulkActionBar from "../common/BulkActionBar";
import { useTablePagination } from "../common/useTablePagination";

export default function FormBarangLogistik({
  barangMessage,
  handleSimpanBarang,
  tglBarang,
  setTglBarang,
  donaturBarang,
  setDonaturBarang,
  katBarang,
  setKatBarang,
  namaBarang,
  setNamaBarang,
  jumlahBarang,
  setJumlahBarang,
  satuanBarang,
  setSatuanBarang,
  ketBarang,
  setKetBarang,
  categories = [],
  posBarang,
  setPosBarang,
  setFotoBarang,
  barangList = [],
  handleHapusBarang,
  handleBulkDeleteBarang,
  setConfirmDialog,
  fetchBarang
}) {
  const [tableFontSize, setTableFontSize] = useState("compact");
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
  } = useTablePagination(barangList, 10);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (fetchBarang) await fetchBarang();
    setIsRefreshing(false);
  };

  const handleTriggerBulkDelete = () => {
    if (selectedCount === 0) return;
    if (setConfirmDialog) {
      setConfirmDialog({
        title: `Hapus ${selectedCount} Donasi Barang Terpilih`,
        message: `Apakah Anda yakin ingin menghapus ${selectedCount} data donasi barang terpilih secara permanen?`,
        confirmText: `Hapus ${selectedCount} Barang`,
        confirmType: "danger",
        details: [
          { label: "Jumlah Item Terpilih", value: `${selectedCount} item`, isHighlight: true }
        ],
        onConfirm: async () => {
          setIsBulkDeleting(true);
          try {
            if (handleBulkDeleteBarang) {
              const ok = await handleBulkDeleteBarang(Array.from(selectedIds));
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
    <div className="desktop-2col-grid">
      <div className="desktop-panel" style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div className="panel-header">
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <IconPackage size={18} color="var(--primary)" /> Form Input Penerimaan Barang Logistik
          </h3>
        </div>
        {barangMessage && <div className={`alert-box alert-${barangMessage.type}`}>{barangMessage.text}</div>}

        <form onSubmit={handleSimpanBarang}>
          <div className="form-grid-2col">
            <div className="form-group">
              <label className="form-label">Tanggal Penerimaan</label>
              <CustomDatePicker value={tglBarang} onChange={e => setTglBarang(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Nama Penyumbang</label>
              <input className="form-control" type="text" placeholder="Nama donatur..." value={donaturBarang} onChange={e => setDonaturBarang(e.target.value)} required />
            </div>
          </div>

          <div className="form-grid-2col">
            <div className="form-group">
              <label className="form-label">Alokasi Pos Program (Tujuan Donasi)</label>
              <CustomDropdown
                value={posBarang || ""}
                onChange={e => setPosBarang(e.target.value)}
                placeholder="-- Pilih Pos Program Tujuan --"
                searchable={categories.filter(c => c.is_active !== false).length > 5}
                searchPlaceholder="Cari pos..."
                options={[
                  { value: "", label: "-- Pilih Pos Program Tujuan --", disabled: true },
                  ...categories
                    .filter(c => c.is_active !== false)
                    .map(c => ({
                      value: c.id,
                      label: `${c.code} - ${c.nama_kategori || c.name}`
                    }))
                ]}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Kategori Logistik</label>
              <CustomDropdown
                value={katBarang}
                onChange={e => setKatBarang(e.target.value)}
                options={[
                  { value: "Material Bangunan", label: "Material Bangunan (Semen, Pasir, Bata, Cat, Besi)" },
                  { value: "Konsumsi Tukang", label: "Konsumsi Untuk Tukang (Beras, Kopi, Gula, Makanan)" },
                  { value: "Perlengkapan Lainnya", label: "Perlengkapan Lainnya" }
                ]}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Nama Barang</label>
            <input className="form-control" type="text" placeholder="Contoh: Semen Gresik 40kg" value={namaBarang} onChange={e => setNamaBarang(e.target.value)} required />
          </div>

          <div className="form-grid-2col">
            <div className="form-group">
              <label className="form-label">Jumlah</label>
              <input className="form-control" type="number" step="0.1" placeholder="10" value={jumlahBarang} onChange={e => setJumlahBarang(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Satuan</label>
              <input className="form-control" type="text" placeholder="Sak / Truk / Dus" value={satuanBarang} onChange={e => setSatuanBarang(e.target.value)} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Keterangan Tambahan (Opsional)</label>
            <input className="form-control" type="text" placeholder="Catatan spesifikasi atau tujuan khusus..." value={ketBarang} onChange={e => setKetBarang(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Foto / Bukti Fisik Penerimaan</label>
            <input className="form-control" type="file" accept="image/*" onChange={e => setFotoBarang(e.target.files[0])} />
          </div>

          <button type="submit" className="btn-primary-action">
            <IconCheckCircle size={18} color="white" />
            <span>Simpan Donasi Barang</span>
          </button>
        </form>
      </div>

      <div className="desktop-panel">
        <div className="panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <IconPackage size={18} color="var(--primary)" /> Riwayat Penerimaan Barang ({barangList.length})
          </h3>
          <TableActionMenu
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
            fontSize={tableFontSize}
            onFontSizeChange={setTableFontSize}
          />
        </div>

        <BulkActionBar
          selectedCount={selectedCount}
          totalItems={barangList.length}
          paginatedCount={paginatedItems.length}
          entityName="donasi barang"
          onClearSelection={clearSelection}
          onSelectAllFiltered={selectAllFiltered}
          onBulkDelete={handleTriggerBulkDelete}
          isDeleting={isBulkDeleting}
        />

        <div className={`table-responsive-desktop table-font-${tableFontSize}`}>
          <table className={`portal-table table-font-${tableFontSize}`}>
            <thead>
              <tr>
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
                <th>Tanggal</th>
                <th>Donatur</th>
                <th>Pos Program</th>
                <th>Kategori</th>
                <th>Barang & Jumlah</th>
                <th>Keterangan</th>
                <th>Bukti</th>
                <th style={{ textAlign: "center", width: "80px" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "24px", color: "var(--text-muted)" }}>
                    Belum ada riwayat donasi barang / natura.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((b) => (
                  <tr key={b.id} className={selectedIds.has(b.id) ? "row-selected" : ""}>
                    <td style={{ textAlign: "center" }}>
                      <input
                        type="checkbox"
                        className="portal-checkbox"
                        checked={selectedIds.has(b.id)}
                        onChange={() => toggleSelect(b.id)}
                      />
                    </td>
                    <td><code>{b.tanggal}</code></td>
                    <td style={{ fontWeight: "700" }}>{b.nama_donatur}</td>
                    <td>
                      {b.pos_code && b.pos_code !== "-" ? (
                        <span className="badge-tag badge-pos">{b.pos_code}</span>
                      ) : (
                        <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>-</span>
                      )}
                    </td>
                    <td><span className="badge-tag">{b.kategori_barang}</span></td>
                    <td style={{ fontWeight: "700" }}>{b.nama_barang} ({b.jumlah} {b.satuan})</td>
                    <td>{b.keterangan || "-"}</td>
                    <td>
                      {b.bukti_foto ? (
                        <a href={b.bukti_foto} target="_blank" rel="noreferrer" className="btn-foto-link">Lihat Bukti</a>
                      ) : "-"}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {handleHapusBarang && (
                        <button
                          type="button"
                          title="Hapus Donasi Barang"
                          onClick={() => handleHapusBarang(b)}
                          style={{ background: "#fee2e2", color: "#b91c1c", border: "none", padding: "4px 8px", borderRadius: "6px", cursor: "pointer" }}
                        >
                          <IconTrash size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={barangList.length}
          displayStart={displayStart}
          displayEnd={displayEnd}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
