import React, { useState, useRef, useEffect } from "react";
import { IconSliders, IconRefresh, IconType, IconCheck } from "../../Icons";

const FONT_OPTIONS = [
  { id: "mini", label: "Paling Kecil (Mini / 10px)", size: "10px", badge: "Mini" },
  { id: "compact", label: "Kecil / Kompak (11px)", size: "11px", badge: "Kompak" },
  { id: "medium", label: "Sedang / Standar (12px)", size: "12px", badge: "Standar" },
  { id: "large", label: "Normal / Lega (13px)", size: "13px", badge: "Lega" }
];

export default function TableActionMenu({
  onRefresh,
  fontSize = "mini",
  onFontSizeChange,
  isRefreshing = false,
  className = ""
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleRefreshClick = () => {
    if (onRefresh && !isRefreshing) {
      onRefresh();
    }
    setIsOpen(false);
  };

  const handleSelectFont = (optId) => {
    if (onFontSizeChange) {
      onFontSizeChange(optId);
    }
    setIsOpen(false);
  };

  return (
    <div ref={menuRef} className={`table-action-menu-wrap ${className} ${isOpen ? "is-open" : ""}`}>
      <button
        type="button"
        className={`btn-table-menu-trigger ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Opsi Tampilan & Tindakan Tabel"
        aria-label="Table Options Menu"
      >
        <IconSliders size={14} />
        <span className="btn-table-menu-label">Pengaturan Tabel</span>
      </button>

      {isOpen && (
        <div className="table-action-dropdown-popover">
          {/* Header */}
          <div className="table-action-header">
            <span className="table-action-header-title">Opsi Tabel</span>
          </div>

          {/* Action: Refresh */}
          {onRefresh && (
            <div className="table-action-section">
              <button
                type="button"
                className={`table-action-item ${isRefreshing ? "loading" : ""}`}
                onClick={handleRefreshClick}
                disabled={isRefreshing}
              >
                <div className="table-action-icon">
                  <IconRefresh size={14} className={isRefreshing ? "spin-animate" : ""} />
                </div>
                <div className="table-action-text-group">
                  <span className="table-action-name">Refresh Data</span>
                  <span className="table-action-desc">Muat ulang rincian data tabel</span>
                </div>
              </button>
            </div>
          )}

          {/* Section: Font Size Controls */}
          {onFontSizeChange && (
            <div className="table-action-section">
              <div className="table-action-section-title">
                <IconType size={13} />
                <span>Ukuran Teks Tabel</span>
              </div>
              <div className="table-action-font-grid">
                {FONT_OPTIONS.map((opt) => {
                  const isSelected = fontSize === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      className={`table-font-btn ${isSelected ? "selected" : ""}`}
                      onClick={() => handleSelectFont(opt.id)}
                    >
                      <span className="table-font-label">{opt.label}</span>
                      {isSelected && <IconCheck size={13} className="table-font-check" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
