import React from "react";
import { IconTrash, IconCheckCircle, IconX } from "../../Icons";

export default function BulkActionBar({
  selectedCount = 0,
  totalItems = 0,
  paginatedCount = 0,
  onBulkDelete,
  onClearSelection,
  onSelectAllFiltered,
  entityName = "data",
  isDeleting = false
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="bulk-action-bar">
      <div className="bulk-info-group">
        <span className="bulk-badge-count">
          <IconCheckCircle size={15} color="#34d399" />
          <span>Terpilih:</span>
          <strong>{selectedCount}</strong> {entityName}
        </span>
        {totalItems > paginatedCount && selectedCount === paginatedCount && onSelectAllFiltered && (
          <button
            type="button"
            className="btn-select-all-filtered"
            onClick={onSelectAllFiltered}
            title={`Pilih semua ${totalItems} data yang sesuai filter`}
          >
            Pilih semua <strong>{totalItems}</strong> {entityName}
          </button>
        )}
      </div>

      <div className="bulk-buttons-group">
        <button
          type="button"
          className="btn-bulk-cancel"
          onClick={onClearSelection}
          disabled={isDeleting}
        >
          <IconX size={14} /> Batal Pilihan
        </button>

        <button
          type="button"
          className="btn-bulk-delete"
          onClick={onBulkDelete}
          disabled={isDeleting}
        >
          <IconTrash size={14} />
          {isDeleting ? "Menghapus..." : `Hapus ${selectedCount} Terpilih`}
        </button>
      </div>
    </div>
  );
}
