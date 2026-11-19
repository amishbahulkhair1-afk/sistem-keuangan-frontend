import React from "react";
import { createPortal } from "react-dom";
import { IconTrash, IconX } from "../../Icons";

/**
 * Universal ConfirmModal Component
 * Popup modal dialog yang selalu tampil full screen paling depan (Portal to document.body)
 * Digunakan untuk seluruh aksi konfirmasi (hapus, nonaktifkan, batalkan log, dll.)
 */
export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Konfirmasi Tindakan",
  message = "Apakah Anda yakin ingin melanjutkan tindakan ini?",
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  confirmType = "danger", // "danger" | "primary" | "warning"
  isLoading = false,
  details = [] // Array of { label: string, value: any, isHighlight?: boolean }
}) {
  if (!isOpen) return null;

  const getConfirmStyle = () => {
    switch (confirmType) {
      case "danger":
        return {
          background: "#dc2626",
          borderColor: "#b91c1c",
          color: "#ffffff",
          boxShadow: "0 4px 14px rgba(220, 38, 38, 0.3)"
        };
      case "warning":
        return {
          background: "#d97706",
          borderColor: "#b45309",
          color: "#ffffff",
          boxShadow: "0 4px 14px rgba(217, 119, 6, 0.3)"
        };
      case "primary":
      default:
        return {
          background: "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)",
          borderColor: "#0284c7",
          color: "#ffffff",
          boxShadow: "0 4px 14px rgba(2, 132, 199, 0.3)"
        };
    }
  };

  const getHeaderStyle = () => {
    if (confirmType === "danger") {
      return { borderBottomColor: "#fee2e2", background: "#fef2f2", color: "#dc2626" };
    }
    if (confirmType === "warning") {
      return { borderBottomColor: "#fef3c7", background: "#fffbeb", color: "#b45309" };
    }
    return { borderBottomColor: "#e0f2fe", background: "#f0f9ff", color: "#0284c7" };
  };

  return createPortal(
    <div className="modal-backdrop-custom" onClick={() => !isLoading && onClose()}>
      <div
        className="modal-box-custom"
        style={{ maxWidth: "460px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header-custom" style={getHeaderStyle()}>
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px", color: "inherit" }}>
            <IconTrash size={20} color="currentColor" /> {title}
          </h3>
          <button
            type="button"
            className="btn-close-modal"
            onClick={() => !isLoading && onClose()}
            disabled={isLoading}
            title="Tutup"
          >
            <IconX size={18} />
          </button>
        </div>

        <div className="modal-body-custom" style={{ padding: "20px" }}>
          <p style={{ fontSize: "14px", color: "var(--text-main)", marginBottom: details.length > 0 ? "14px" : "0", lineHeight: "1.5" }}>
            {message}
          </p>

          {details.length > 0 && (
            <div style={{ background: "rgba(0,0,0,0.03)", padding: "12px 14px", borderRadius: "12px", border: "1px solid var(--border-color)", fontSize: "13px" }}>
              {details.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: idx === details.length - 1 ? 0 : "8px",
                    borderTop: item.isHighlight ? "1px dashed var(--border-color)" : "none",
                    paddingTop: item.isHighlight ? "8px" : 0,
                    marginTop: item.isHighlight ? "6px" : 0
                  }}
                >
                  <span style={{ color: "var(--text-muted)", fontSize: "12.5px" }}>{item.label}</span>
                  <strong style={{ fontSize: item.isHighlight ? "14.5px" : "13px", color: item.isHighlight ? "var(--primary)" : "var(--text-main)" }}>
                    {item.value}
                  </strong>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer-custom">
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className="btn-primary"
            style={getConfirmStyle()}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Memproses..." : confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
