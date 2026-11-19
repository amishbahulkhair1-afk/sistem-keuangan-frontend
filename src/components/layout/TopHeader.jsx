import { useState, useRef, useEffect } from "react";
import {
  IconMenu,
  IconRefresh,
  IconType,
  IconSun,
  IconMoon,
  IconSettings,
  IconChevronDown,
  IconPalette
} from "../../Icons";
import { formatPosNameShort } from "../../utils/formatters";

export default function TopHeader({
  activeMenu,
  currentScopedPos,
  onOpenSidebar,
  setIsSidebarOpen,
  onRefreshData,
  fetchAll,
  onOpenFontModal,
  theme = "light",
  onToggleTheme,
  onOpenThemeModal
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleOpenNav = () => {
    if (typeof onOpenSidebar === "function") {
      onOpenSidebar();
    } else if (typeof setIsSidebarOpen === "function") {
      setIsSidebarOpen(true);
    }
  };

  const handleRefresh = () => {
    setIsDropdownOpen(false);
    if (typeof onRefreshData === "function") {
      onRefreshData();
    } else if (typeof fetchAll === "function") {
      fetchAll();
    }
  };

  const handleToggleTheme = () => {
    setIsDropdownOpen(false);
    if (typeof onToggleTheme === "function") {
      onToggleTheme();
    }
  };

  const handleOpenFont = () => {
    setIsDropdownOpen(false);
    if (typeof onOpenFontModal === "function") {
      onOpenFontModal();
    }
  };

  const getTitle = () => {
    switch (activeMenu) {
      case "dashboard":
        return { full: "Dashboard Ringkasan Keuangan", compact: "Dashboard" };
      case "donatur_dashboard":
        return { full: "Dashboard & Transparansi Donasi", compact: "Transparansi" };
      case "donatur_pos_view":
        return { full: "Daftar Pos Program & Donatur", compact: "Daftar Pos" };
      case "transaksi_list":
        return { full: "Jurnal Transaksi Kas & Bank", compact: "Jurnal Kas" };
      case "transaksi_form":
        return { full: "Input Transaksi Kas & Bank", compact: "Input Kas" };
      case "pos_transaksi":
        return { full: `Kas & Pencatatan Transaksi Pos • ${currentScopedPos?.name || ""}`, compact: `Kas Pos ${currentScopedPos?.name ? formatPosNameShort(currentScopedPos.name) : ""}` };
      case "hutang_piutang":
        return { full: `Pencatatan Hutang & Piutang • Pos ${currentScopedPos?.name || ""}`, compact: `Hutang-Piutang Pos` };
      case "material_pemakaian":
        return { full: `Logistik & Pemakaian Material • Pos ${currentScopedPos?.name || ""}`, compact: `Material Pos` };
      case "neraca_pos":
        return { full: `Neraca Dinamis • Pos ${currentScopedPos?.name || ""}`, compact: `Neraca Pos` };
      case "barang":
        return { full: "Pencatatan Donasi Barang & Material", compact: "Donasi Barang" };
      case "import_qris":
        return { full: "Import Transaksi QRIS Excel", compact: "Import QRIS" };
      case "buku_bantu":
        return { full: "Buku Pembantu Rincian Saldo Program", compact: "Buku Pembantu" };
      case "neraca":
        return { full: "Neraca Konsolidasi PP Annuqayah Latee", compact: "Neraca Induk" };
      case "cetak_laporan":
        return { full: "Pusat Cetak & Unduh Dokumen Laporan", compact: "Cetak Dokumen" };
      case "master_donatur":
        return { full: "Database Donatur & Histori Donasi", compact: "Data Donatur" };
      case "master_pos":
        return { full: "Pengelolaan Master Pos Program", compact: "Master Pos" };
      case "master_rekening":
        return { full: "Pengelolaan Rekening Bank & Kas", compact: "Master Rekening" };
      case "master_users":
        return { full: "Pengelolaan Petugas & Penjab Pos", compact: "Master Petugas" };
      default:
        return { full: "Sistem Keuangan Donasi Latee", compact: "Donasi Latee" };
    }
  };

  const titleObj = getTitle();

  return (
    <header className="desktop-topbar">
      <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
        <button
          type="button"
          className="btn-hamburger-sidebar"
          onClick={handleOpenNav}
          aria-label="Buka Menu Navigasi"
          title="Buka Navigasi"
        >
          <IconMenu size={20} />
        </button>
        <div className="topbar-title" style={{ minWidth: 0 }}>
          <h2 style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            <span className="text-full">{titleObj.full}</span>
            <span className="text-compact">{titleObj.compact}</span>
          </h2>
          <p>Pondok Pesantren Annuqayah Latee • Guluk-Guluk Sumenep</p>
        </div>
      </div>

      <div className="topbar-actions" ref={dropdownRef} style={{ position: "relative" }}>
        <button
          type="button"
          className={`btn-topbar-menu-trigger ${isDropdownOpen ? "active" : ""}`}
          onClick={() => setIsDropdownOpen((prev) => !prev)}
          title="Opsi & Pengaturan Tampilan"
          aria-expanded={isDropdownOpen}
        >
          <div className="topbar-trigger-inner">
            <IconSettings size={17} />
            <span className="btn-label-text">Opsi & Pengaturan</span>
            <IconChevronDown
              size={15}
              style={{
                transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
              }}
            />
          </div>
        </button>

        {isDropdownOpen && (
          <div className="topbar-settings-dropdown-menu">
            <div className="topbar-dropdown-header">
              <span className="topbar-dropdown-header-title">Pusat Pengaturan</span>
              <span className="topbar-dropdown-header-subtitle">Tampilan & Data Sistem</span>
            </div>
            
            <div className="topbar-dropdown-divider" />

            {typeof onToggleTheme === "function" && (
              <button
                type="button"
                className="topbar-dropdown-item"
                onClick={handleToggleTheme}
                title={theme === "dark" ? "Ganti ke Mode Terang (Siang)" : "Ganti ke Mode Gelap (Malam)"}
              >
                <div className="topbar-dropdown-item-icon theme-icon">
                  {theme === "dark" ? <IconSun size={16} color="#fde047" /> : <IconMoon size={16} color="#0284c7" />}
                </div>
                <div className="topbar-dropdown-item-text">
                  <span className="item-title">
                    {theme === "dark" ? "Mode Terang (Siang)" : "Mode Gelap (Malam)"}
                  </span>
                  <span className="item-desc">
                    {theme === "dark" ? "Ubah ke nuansa putih & biru" : "Ubah ke nuansa gelap nyaman"}
                  </span>
                </div>
              </button>
            )}

            {typeof onOpenThemeModal === "function" && (
              <button
                type="button"
                className="topbar-dropdown-item"
                onClick={() => {
                  setIsDropdownOpen(false);
                  onOpenThemeModal();
                }}
                title="Pilih Tema Animasi Latar Belakang"
              >
                <div className="topbar-dropdown-item-icon" style={{ color: "#059669" }}>
                  <IconPalette size={16} />
                </div>
                <div className="topbar-dropdown-item-text">
                  <span className="item-title">Tema Animasi Latar</span>
                  <span className="item-desc">Islami, Sky Wave, Geometris & Bintang</span>
                </div>
              </button>
            )}

            {typeof onOpenFontModal === "function" && (
              <button
                type="button"
                className="topbar-dropdown-item"
                onClick={handleOpenFont}
                title="Atur Ukuran Font Tulisan"
              >
                <div className="topbar-dropdown-item-icon">
                  <IconType size={16} />
                </div>
                <div className="topbar-dropdown-item-text">
                  <span className="item-title">Ukuran Font</span>
                  <span className="item-desc">Compact, Medium, atau Default</span>
                </div>
              </button>
            )}

            <button
              type="button"
              className="topbar-dropdown-item"
              onClick={handleRefresh}
              title="Sinkron Data Terbaru"
            >
              <div className="topbar-dropdown-item-icon">
                <IconRefresh size={16} />
              </div>
              <div className="topbar-dropdown-item-text">
                <span className="item-title">Sinkron Data</span>
                <span className="item-desc">Perbarui data kas & transaksi</span>
              </div>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
