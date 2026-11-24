import React from "react";
import { IconChevronLeft, IconChevronRight } from "../../Icons";

export default function TablePagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  displayStart = 0,
  displayEnd = 0,
  pageSize = 10,
  onPageSizeChange,
  onPageChange,
  unfilteredTotal = null,
  pageSizeOptions = [10, 25, 50, 100, 0] // 0 means 'Semua'
}) {
  if (totalItems === 0) {
    return (
      <div className="table-pagination-bar">
        <div className="pagination-info">
          Menampilkan <strong>0</strong> data
          {unfilteredTotal && unfilteredTotal > 0 ? (
            <span style={{ color: "var(--text-muted)", marginLeft: "4px" }}>
              (difilter dari {unfilteredTotal} total data)
            </span>
          ) : null}
        </div>
      </div>
    );
  }

  // Buat nomor tombol pagination (maksimal 5 nomor)
  const getPageNumbers = () => {
    const pages = [];
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let p = startPage; p <= endPage; p++) {
      pages.push(p);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="table-pagination-bar">
      <div className="pagination-info">
        Menampilkan <strong>{displayStart}</strong> - <strong>{displayEnd}</strong> dari <strong>{totalItems}</strong> data
        {unfilteredTotal && unfilteredTotal !== totalItems ? (
          <span style={{ color: "var(--text-muted)", marginLeft: "6px", fontSize: "12px" }}>
            (difilter dari {unfilteredTotal} total)
          </span>
        ) : null}
      </div>

      <div className="pagination-right-group">
        <div className="pagination-size-wrapper">
          <label htmlFor="page-size-select" style={{ fontSize: "12px", color: "var(--text-muted)", marginRight: "6px" }}>
            Tampilkan:
          </label>
          <select
            id="page-size-select"
            className="pagination-size-select"
            value={pageSize}
            onChange={(e) => onPageSizeChange && onPageSizeChange(Number(e.target.value))}
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt === 0 ? "Semua" : `${opt}`}
              </option>
            ))}
          </select>
          <span style={{ fontSize: "12px", color: "var(--text-muted)", marginLeft: "6px" }}>
            data
          </span>
        </div>

        {pageSize !== 0 && totalPages > 1 && (
          <div className="pagination-controls">
            <button
              type="button"
              className="btn-page-nav"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              title="Halaman Sebelumnya"
            >
              <IconChevronLeft size={14} />
              <span>Sebelumnya</span>
            </button>

            {pageNumbers.map((p) => (
              <button
                key={p}
                type="button"
                className={`btn-page-nav btn-page-number ${p === currentPage ? "active" : ""}`}
                onClick={() => onPageChange(p)}
              >
                {p}
              </button>
            ))}

            <button
              type="button"
              className="btn-page-nav"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              title="Halaman Selanjutnya"
            >
              <span>Selanjutnya</span>
              <IconChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
