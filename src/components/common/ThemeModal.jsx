import React from "react";
import { createPortal } from "react-dom";
import {
  IconPalette,
  IconX,
  IconMosque,
  IconSparkles,
  IconGrid,
  IconTrendingUp,
  IconSun,
  IconMoon,
  IconWind,
  IconCompass
} from "../../Icons";
import { BG_THEME_OPTIONS } from "./DynamicBackgroundCanvas";

export default function ThemeModal({
  isOpen,
  onClose,
  currentBgTheme,
  onSelectBgTheme,
  theme = "light",
  onToggleTheme
}) {
  if (!isOpen) return null;

  const getThemeIcon = (iconName) => {
    switch (iconName) {
      case "desert":
        return <IconWind size={22} color="#d97706" />;
      case "landscape":
        return <IconSun size={22} color="#f59e0b" />;
      case "mosque":
        return <IconMosque size={22} color="#059669" />;
      case "wave":
        return <IconTrendingUp size={22} color="#0284c7" />;
      case "cube":
        return <IconGrid size={22} color="#6366f1" />;
      case "sparkles":
        return <IconSparkles size={22} color="#f59e0b" />;
      default:
        return <IconPalette size={22} color="#0284c7" />;
    }
  };

  return createPortal(
    <div className="modal-backdrop-custom" onClick={onClose}>
      <div
        className="modal-card-custom theme-settings-modal font-settings-modal"
        style={{
          maxWidth: "560px",
          width: "100%",
          maxHeight: "88vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          padding: "22px 24px"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal - Fixed */}
        <div className="modal-header-custom" style={{ flexShrink: 0, marginBottom: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="font-settings-icon-circle" style={{ background: "#ecfdf5", color: "#059669" }}>
              <IconPalette size={20} color="#059669" />
            </div>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                Pengaturan Tema & Latar Belakang
              </h3>
              <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0 0" }}>
                Pilih tema animasi latar belakang dan mode tampilan sistem
              </p>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose} title="Tutup">
            <IconX size={20} />
          </button>
        </div>

        {/* Scrollable Modal Body Container */}
        <div
          className="theme-modal-scrollable-body custom-slim-scrollbar"
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            paddingRight: "6px",
            marginRight: "-6px"
          }}
        >
          {/* Mode Siang / Malam Toggle Card */}
          {typeof onToggleTheme === "function" && (
            <div
              style={{
                marginBottom: "16px",
                padding: "12px 16px",
                background: theme === "dark" ? "#1e293b" : "#f8fafc",
                border: "1.5px solid",
                borderColor: theme === "dark" ? "#334155" : "#e2e8f0",
                borderRadius: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: theme === "dark" ? "#0f172a" : "#e0f2fe",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  {theme === "dark" ? <IconMoon size={18} color="#fde047" /> : <IconSun size={18} color="#0284c7" />}
                </div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: theme === "dark" ? "#f8fafc" : "#0f172a" }}>
                    {theme === "dark" ? "Mode Gelap (Malam)" : "Mode Terang (Siang)"}
                  </div>
                  <div style={{ fontSize: "11.5px", color: "#64748b" }}>
                    {theme === "dark" ? "Nuansa malam nyaman di mata" : "Nuansa terang cerah bergradien"}
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="btn-blade-action"
                onClick={onToggleTheme}
                style={{ padding: "6px 14px", fontSize: "12px" }}
              >
                Ganti ke {theme === "dark" ? "Mode Terang" : "Mode Gelap"}
              </button>
            </div>
          )}

          <div style={{ fontSize: "12.5px", fontWeight: "700", color: "#475569", marginBottom: "8px" }}>
            Pilihan Tema Latar Animasi (Background Motion):
          </div>

          {/* List Opsi Tema Background */}
          <div className="font-options-list" style={{ gap: "10px", margin: "4px 0" }}>
            {BG_THEME_OPTIONS.map((opt) => {
              const isSelected = currentBgTheme === opt.id;
              return (
                <div
                  key={opt.id}
                  className={`font-option-card ${isSelected ? "selected" : ""}`}
                  style={{
                    padding: "14px 16px",
                    borderColor: isSelected ? "#059669" : undefined,
                    background: isSelected ? (theme === "dark" ? "rgba(6, 78, 59, 0.3)" : "#f0fdf4") : undefined
                  }}
                  onClick={() => {
                    onSelectBgTheme(opt.id);
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%" }}>
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "12px",
                        background: isSelected ? "#dcfce7" : "#f1f5f9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0
                      }}
                    >
                      {getThemeIcon(opt.icon)}
                    </div>

                    <div className="font-option-text" style={{ flex: 1 }}>
                      <div className="font-option-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontWeight: 700, fontSize: "13.5px" }}>{opt.label}</span>
                        {opt.tag && (
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: "800",
                              padding: "2px 6px",
                              borderRadius: "6px",
                              background: opt.id === "islamic" ? "#10b981" : "#0284c7",
                              color: "white",
                              letterSpacing: "0.4px"
                            }}
                          >
                            {opt.tag}
                          </span>
                        )}
                        {isSelected && (
                          <span className="font-active-badge" style={{ background: "#059669", color: "white", marginLeft: "auto" }}>
                            Aktif
                          </span>
                        )}
                      </div>
                      <div className="font-option-desc" style={{ fontSize: "11.5px", marginTop: "2px" }}>
                        {opt.desc}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Tombol Selesai - Fixed */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "16px",
            paddingTop: "14px",
            borderTop: theme === "dark" ? "1px solid #334155" : "1px solid #e2e8f0",
            flexShrink: 0
          }}
        >
          <button
            className="btn-primary-action"
            style={{
              padding: "9px 26px",
              background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
              boxShadow: "0 4px 14px rgba(5, 150, 105, 0.25)"
            }}
            onClick={onClose}
          >
            Terapkan & Tutup
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
