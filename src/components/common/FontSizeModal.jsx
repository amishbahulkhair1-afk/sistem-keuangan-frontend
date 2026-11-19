import React from "react";
import { createPortal } from "react-dom";
import { IconType, IconX } from "../../Icons";

export const FONT_SIZE_OPTIONS = [
  { id: "compact", label: "Ringkas (50% / 2x Kecil)", desc: "Optimal untuk layar Android & HP kecil", scale: "52%" },
  { id: "medium", label: "Sedang (75% / Proporsional)", desc: "Ukuran seimbang, nyaman dibaca di tablet/HP", scale: "75%" },
  { id: "normal", label: "Standar (100% / Normal)", desc: "Ukuran asli bawaan web desktop komputer", scale: "100%" },
  { id: "large", label: "Besar (115% / Jelas)", desc: "Teks lebih besar dan sangat jelas", scale: "115%" }
];

export function applySystemFontSize(sizeId) {
  const selected = FONT_SIZE_OPTIONS.find(o => o.id === sizeId) || FONT_SIZE_OPTIONS[0];
  document.documentElement.setAttribute("data-font-size", selected.id);
  document.documentElement.style.setProperty("--app-font-scale", selected.scale);
  localStorage.setItem("app_font_size", selected.id);
}

export function getSavedSystemFontSize() {
  const saved = localStorage.getItem("app_font_size");
  if (saved) return saved;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
  return isMobile ? "compact" : "normal";
}

export default function FontSizeModal({ isOpen, onClose, currentSize, onSelectSize }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="modal-backdrop-custom" onClick={onClose}>
      <div className="modal-card-custom font-settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-custom">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="font-settings-icon-circle">
              <IconType size={20} color="#0284c7" />
            </div>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", margin: 0 }}>Pengaturan Ukuran Font</h3>
              <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0 0" }}>Sesuaikan ukuran tulisan antarmuka sistem</p>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose} title="Tutup">
            <IconX size={20} />
          </button>
        </div>

        <div className="font-options-list">
          {FONT_SIZE_OPTIONS.map((opt) => {
            const isSelected = currentSize === opt.id;
            return (
              <div
                key={opt.id}
                className={`font-option-card ${isSelected ? "selected" : ""}`}
                onClick={() => {
                  onSelectSize(opt.id);
                }}
              >
                <div className="font-option-radio">
                  <div className={`radio-dot ${isSelected ? "checked" : ""}`} />
                </div>
                <div className="font-option-text">
                  <div className="font-option-title">
                    <span>{opt.label}</span>
                    {isSelected && <span className="font-active-badge">Aktif</span>}
                  </div>
                  <div className="font-option-desc">{opt.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="font-preview-box">
          <div className="font-preview-label">Pratinjau Teks Langsung:</div>
          <div className="font-preview-sample">
            <strong>PP Annuqayah Latee</strong> — Sistem Transparansi Pembukuan & Donasi Real-Time.
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
          <button className="btn-primary-action" style={{ padding: "8px 24px" }} onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
