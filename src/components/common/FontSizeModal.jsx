import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { IconType, IconX } from "../../Icons";

export const FONT_SIZE_OPTIONS = [
  { id: "compact", label: "Ringkas (Kompak & Padat)", desc: "Ukuran proporsional hemat ruang dan rapi", scale: "90%" },
  { id: "medium", label: "Sedang (Proporsional)", desc: "Ukuran seimbang, nyaman dibaca di tablet & HP", scale: "95%" },
  { id: "normal", label: "Standar (100% / Normal)", desc: "Ukuran bawaan standar antarmuka sistem", scale: "100%" },
  { id: "large", label: "Besar (115% / Jelas)", desc: "Teks lebih besar dan sangat jelas dibaca", scale: "115%" }
];

export function applySystemFontSize(sizeId) {
  const selected = FONT_SIZE_OPTIONS.find(o => o.id === sizeId) || FONT_SIZE_OPTIONS[2];
  document.documentElement.setAttribute("data-font-size", selected.id);
  document.documentElement.style.setProperty("--app-font-scale", selected.scale);
  localStorage.setItem("app_font_size", selected.id);
}

export function getSavedSystemFontSize() {
  const saved = localStorage.getItem("app_font_size");
  if (saved) return saved;
  return "normal";
}

export default function FontSizeModal({ isOpen, onClose, currentSize, onSelectSize }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-backdrop-custom" onClick={onClose}>
      <div
        className="modal-card-custom font-settings-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="font-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header-custom">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="font-settings-icon-circle">
              <IconType size={20} color="#0284c7" />
            </div>
            <div>
              <h3 id="font-modal-title" style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", margin: 0 }}>Pengaturan Ukuran Font</h3>
              <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0 0" }}>Sesuaikan ukuran tulisan antarmuka sistem</p>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose} title="Tutup" aria-label="Tutup pengaturan font">
            <IconX size={20} />
          </button>
        </div>

        <div className="font-options-list" role="radiogroup" aria-labelledby="font-modal-title">
          {FONT_SIZE_OPTIONS.map((opt) => {
            const isSelected = currentSize === opt.id;
            return (
              <div
                key={opt.id}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                className={`font-option-card ${isSelected ? "selected" : ""}`}
                onClick={() => {
                  onSelectSize(opt.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectSize(opt.id);
                  }
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
