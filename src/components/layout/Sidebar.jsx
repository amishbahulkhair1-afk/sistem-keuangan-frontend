import logoImg from "../../assets/logo.jpg";
import CustomDropdown from "../common/CustomDropdown";
import {
  IconDashboard,
  IconTable,
  IconPlusCircle,
  IconPackage,
  IconDownload,
  IconBook,
  IconScale,
  IconSettings,
  IconUsers,
  IconPrinter,
  IconSmartphone,
  IconBank,
  IconLogOut,
  IconChevronDown,
  IconChevronUp,
  IconX,
  IconBriefcase,
  IconTruck,
  IconLayers,
  IconFolderPos,
  IconWallet,
  IconShield,
  IconType,
  IconSun,
  IconMoon,
  IconPalette
} from "../../Icons";

export default function Sidebar({
  user,
  activeMenu,
  setActiveMenu,
  isSidebarOpen,
  setIsSidebarOpen,
  categories,
  selectedPosScope,
  setSelectedPosScope,
  showProfileDropdown,
  setShowProfileDropdown,
  onSwitchMobile,
  onLogout,
  fetchDonors,
  donorsCount,
  onOpenFontModal,
  theme = "light",
  onToggleTheme,
  onOpenThemeModal
}) {
  const isPenjab = user?.role === "penjab_pos";
  const isPimpinan = user?.role === "pimpinan";
  const isDonatur = user?.role === "donatur";
  const isPetugasLapangan = user?.role === "petugas_lapangan";
  const isAdmin = user?.role === "admin_keuangan" || (!isPimpinan && !isDonatur && !isPetugasLapangan && !isPenjab);
  const canInputMoney = isAdmin || isPetugasLapangan;
  const canManageMaster = isAdmin;

  return (
    <aside className={`desktop-sidebar ${isSidebarOpen ? "sidebar-open" : ""}`}>
      <div className="sidebar-brand">
        <div className="brand-icon">
          <img src={logoImg} alt="Logo Donasi Latee" className="desktop-brand-logo-img" />
          <span className="live-radar-dot"></span>
        </div>
        <div style={{ flex: 1 }}>
          <div className="brand-name">Donasi Latee</div>
          <div className="brand-sub">PP Annuqayah Latee</div>
        </div>
        <button
          type="button"
          className="btn-close-sidebar-mobile"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Tutup Menu"
        >
          <IconX size={18} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {/* JIKA ROLE DONATUR: TAMPILKAN MENU DASHBOARD & DAFTAR POS */}
        {isDonatur ? (
          <>
            <div className="nav-group-title">Menu Donatur</div>
            <button
              className={`nav-link ${activeMenu === "donatur_dashboard" ? "active" : ""}`}
              onClick={() => {
                setActiveMenu("donatur_dashboard");
                setIsSidebarOpen(false);
              }}
            >
              <IconDashboard size={17} />
              <span>Dashboard Donatur</span>
            </button>
            <button
              className={`nav-link ${activeMenu === "donatur_pos_view" ? "active" : ""}`}
              onClick={() => {
                setActiveMenu("donatur_pos_view");
                setIsSidebarOpen(false);
              }}
            >
              <IconFolderPos size={17} />
              <span>Daftar Pos & Donatur</span>
            </button>
          </>
        ) : (
          <>
            {/* JIKA BUKAN PENJAB (ADMIN / PIMPINAN / PETUGAS LAPANGAN) */}
            {!isPenjab && (
              <>
                <div className="nav-group-title">Menu Utama</div>
                <button className={`nav-link ${activeMenu === "dashboard" ? "active" : ""}`} onClick={() => { setActiveMenu("dashboard"); setIsSidebarOpen(false); }}>
                  <IconDashboard size={17} />
                  <span>Dashboard Ringkasan</span>
                </button>
                <button className={`nav-link ${activeMenu === "donatur_pos_view" ? "active" : ""}`} onClick={() => { setActiveMenu("donatur_pos_view"); setIsSidebarOpen(false); }}>
                  <IconFolderPos size={17} />
                  <span>Katalog Pos & Donatur</span>
                </button>
                <button className={`nav-link ${activeMenu === "transaksi_list" ? "active" : ""}`} onClick={() => { setActiveMenu("transaksi_list"); setIsSidebarOpen(false); }}>
                  <IconTable size={17} />
                  <span>Jurnal Transaksi</span>
                </button>

                <div className="nav-group-title">Laporan & Pembukuan Konsolidasi</div>
                <button className={`nav-link ${activeMenu === "buku_bantu" ? "active" : ""}`} onClick={() => { setActiveMenu("buku_bantu"); setIsSidebarOpen(false); }}>
                  <IconBook size={17} />
                  <span>Buku Pembantu Saldo</span>
                </button>
                <button className={`nav-link ${activeMenu === "neraca" ? "active" : ""}`} onClick={() => { setActiveMenu("neraca"); setIsSidebarOpen(false); }}>
                  <IconScale size={17} />
                  <span>Neraca Konsolidasi</span>
                </button>
                <button className={`nav-link ${activeMenu === "cetak_laporan" ? "active" : ""}`} onClick={() => { setActiveMenu("cetak_laporan"); setIsSidebarOpen(false); }}>
                  <IconPrinter size={17} />
                  <span>Pusat Cetak Dokumen</span>
                </button>
              </>
            )}

            {/* FORM INPUT UMUM (NON-PENJAB) */}
            {!isPenjab && canInputMoney && (
              <>
                <div className="nav-group-title">Entri Data</div>
                <button className={`nav-link ${activeMenu === "transaksi_form" ? "active" : ""}`} onClick={() => { setActiveMenu("transaksi_form"); setIsSidebarOpen(false); }}>
                  <IconPlusCircle size={17} />
                  <span>Input Kas & Bank</span>
                </button>
                <button className={`nav-link ${activeMenu === "barang" ? "active" : ""}`} onClick={() => { setActiveMenu("barang"); setIsSidebarOpen(false); }}>
                  <IconPackage size={17} />
                  <span>Donasi Barang Fisik</span>
                </button>
                {isAdmin && (
                  <button className={`nav-link ${activeMenu === "import_qris" ? "active" : ""}`} onClick={() => { setActiveMenu("import_qris"); setIsSidebarOpen(false); }}>
                    <IconDownload size={17} />
                    <span>Import QRIS Excel</span>
                  </button>
                )}
              </>
            )}

            {/* OPERASIONAL & LAPANGAN POS (DILETAKKAN DI ATAS BAGIAN MASTER) */}
            <div className="nav-group-title">{isPenjab ? "Fitur Khusus Penjab Pos" : "Operasional & Lapangan Pos"}</div>

            {/* Global Pos Scope Selector di bawah header Operasional & Lapangan Pos */}
            <div className="pos-scope-box-container">
              <div className="pos-scope-card">
                <div className="pos-scope-header">
                  <div className="pos-scope-title-wrap">
                    <IconFolderPos size={13} color="#059669" />
                    <span className="pos-scope-label">Lingkup Pos Aktif</span>
                  </div>
                  {isPenjab && (
                    <span className="pos-scope-badge-locked">
                      <IconShield size={10} /> Terkunci
                    </span>
                  )}
                </div>
                <div className="pos-scope-select-wrap" style={{ marginTop: "6px" }}>
                  <CustomDropdown
                    value={selectedPosScope}
                    disabled={isPenjab}
                    onChange={(e) => setSelectedPosScope(e.target.value)}
                    title="Pilih Lingkup Pos Program"
                    size="sm"
                    searchable={categories.filter(c => c.is_active).length > 5}
                    searchPlaceholder="Cari pos..."
                    options={categories.filter(c => c.is_active).map(c => ({
                      value: c.id,
                      label: `[${c.code}] ${c.name}`
                    }))}
                  />
                </div>
              </div>
            </div>

            <button className={`nav-link ${activeMenu === "pos_transaksi" ? "active" : ""}`} onClick={() => { setActiveMenu("pos_transaksi"); setIsSidebarOpen(false); }}>
              <IconWallet size={17} />
              <span>Kas & Belanja Pos</span>
            </button>
            <button className={`nav-link ${activeMenu === "hutang_piutang" ? "active" : ""}`} onClick={() => { setActiveMenu("hutang_piutang"); setIsSidebarOpen(false); }}>
              <IconLayers size={17} />
              <span>Hutang & Piutang Pos</span>
            </button>
            <button className={`nav-link ${activeMenu === "material_pemakaian" ? "active" : ""}`} onClick={() => { setActiveMenu("material_pemakaian"); setIsSidebarOpen(false); }}>
              <IconTruck size={17} />
              <span>Material & Pemakaian</span>
            </button>
            <button className={`nav-link ${activeMenu === "neraca_pos" ? "active" : ""}`} onClick={() => { setActiveMenu("neraca_pos"); setIsSidebarOpen(false); }}>
              <IconScale size={17} />
              <span>Neraca Dinamis Pos</span>
            </button>

            {/* MASTER & DATABASE (HANYA ADMIN) */}
            {!isPenjab && canManageMaster && (
              <>
                <div className="nav-group-title">Master & Database</div>
                <button className={`nav-link ${activeMenu === "master_donatur" ? "active" : ""}`} onClick={() => { setActiveMenu("master_donatur"); if (typeof fetchDonors === "function") fetchDonors(); setIsSidebarOpen(false); }}>
                  <IconUsers size={17} />
                  <span>Database Donatur ({donorsCount || 0})</span>
                </button>
                <button className={`nav-link ${activeMenu === "master_pos" ? "active" : ""}`} onClick={() => { setActiveMenu("master_pos"); setIsSidebarOpen(false); }}>
                  <IconSettings size={17} />
                  <span>Pos Program ({categories.length})</span>
                </button>
                <button className={`nav-link ${activeMenu === "master_rekening" ? "active" : ""}`} onClick={() => { setActiveMenu("master_rekening"); setIsSidebarOpen(false); }}>
                  <IconBank size={17} />
                  <span>Rekening Kas & Bank</span>
                </button>
                <button className={`nav-link ${activeMenu === "master_users" ? "active" : ""}`} onClick={() => { setActiveMenu("master_users"); setIsSidebarOpen(false); }}>
                  <IconBriefcase size={17} />
                  <span>Petugas & Penjab Pos</span>
                </button>
              </>
            )}
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        {showProfileDropdown && (
          <div className="profile-dropdown-menu">
            <div className="dropdown-user-detail">
              <div className="dropdown-user-name">{user?.name || "Admin Bendahara"}</div>
              <div className="dropdown-user-email">{user?.email || "admin@annuqayah.test"}</div>
            </div>
            <div className="dropdown-divider"></div>
            {typeof onToggleTheme === "function" && (
              <button
                className="dropdown-menu-item"
                onClick={() => {
                  setShowProfileDropdown(false);
                  onToggleTheme();
                }}
              >
                {theme === "dark" ? <IconSun size={16} color="#fde047" /> : <IconMoon size={16} color="#0284c7" />}
                <span>{theme === "dark" ? "Mode Terang (Siang)" : "Mode Gelap (Malam)"}</span>
              </button>
            )}
            {typeof onOpenThemeModal === "function" && (
              <button
                className="dropdown-menu-item"
                onClick={() => {
                  setShowProfileDropdown(false);
                  onOpenThemeModal();
                }}
              >
                <IconPalette size={16} />
                <span>Pilih Tema & Latar Belakang</span>
              </button>
            )}
            {typeof onOpenFontModal === "function" && (
              <button
                className="dropdown-menu-item"
                onClick={() => {
                  setShowProfileDropdown(false);
                  onOpenFontModal();
                }}
              >
                <IconType size={16} />
                <span>Pengaturan Ukuran Font</span>
              </button>
            )}
            <button className="dropdown-menu-item" onClick={onSwitchMobile}>
              <IconSmartphone size={16} />
              <span>Beralih ke Mode HP (Mobile)</span>
            </button>
            <button className="dropdown-menu-item logout" onClick={onLogout}>
              <IconLogOut size={16} />
              <span>Keluar dari Sistem</span>
            </button>
          </div>
        )}

        <div
          className={`user-profile-row ${showProfileDropdown ? "active" : ""}`}
          onClick={() => setShowProfileDropdown(!showProfileDropdown)}
          title="Klik untuk menu akun"
        >
          <div className="user-avatar-circle">
            {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
          </div>
          <div className="user-info-box">
            <div className="user-name">{user?.name || "Admin Bendahara"}</div>
            <div className="user-role">
              {user?.role === "pimpinan" ? "Pimpinan" : (user?.role === "penjab_pos" ? `Penjab ${user?.assigned_category_code || "Pos"}` : "Bendahara / Admin")}
            </div>
          </div>
          <div className="user-chevron">
            {showProfileDropdown ? <IconChevronDown size={16} /> : <IconChevronUp size={16} />}
          </div>
        </div>
      </div>
    </aside>
  );
}
