import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import "./MobileApp.css";
import LaporanCetak from "./LaporanCetak";
import logoImg from "./assets/logo.jpg";
import CustomDropdown from "./components/common/CustomDropdown";
import CustomDatePicker from "./components/common/CustomDatePicker";
import ConfirmModal from "./components/common/ConfirmModal";
import {
  IconDashboard,
  IconPlusCircle,
  IconPackage,
  IconTable,
  IconMosque,
  IconCheckCircle,
  IconTrendingUp,
  IconTrendingDown,
  IconMonitor,
  IconEdit,
  IconLogOut,
  IconChevronDown,
  IconChevronUp,
  IconFileText,
  IconPrinter,
  IconSend,
  IconQrCode,
  IconCreditCard,
  IconGrid,
  IconHistory,
  IconRefresh,
  IconUsers,
  IconScale,
  IconCamera,
  IconImage,
  IconPieChart,
  IconFolderPos,
  IconWallet,
  IconSearch,
  IconArrowLeft,
  IconType,
  IconSun,
  IconMoon,
  IconPalette,
  IconTrash,
  IconX,
  IconCalendar,
  IconBank,
  IconArrowRight
} from "./Icons";
import { formatPosNameShort, POS_ABBREVIATIONS, compressImage } from "./utils/formatters";
import DynamicBackgroundCanvas from "./components/common/DynamicBackgroundCanvas";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

export default function MobileApp({
  user,
  onLogout,
  onSwitchPortal,
  onOpenFontModal,
  theme = "light",
  onToggleTheme,
  bgTheme = "islamic",
  onOpenThemeModal
}) {
  const isPimpinan = user?.role === "pimpinan";
  const isDonatur = user?.role === "donatur";
  const isPetugasLapangan = user?.role === "petugas_lapangan";
  const isAdmin = user?.role === "admin_keuangan" || (!isPimpinan && !isDonatur && !isPetugasLapangan);
  const isReadOnly = isPimpinan || isDonatur;
  const canInputMoney = isAdmin || isPetugasLapangan;
  const canInputBarang = isAdmin || isPetugasLapangan;
  const VALID_TABS = ["home", "transaksi", "barang", "riwayat", "laporan"];
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const saved = sessionStorage.getItem("mobile_active_tab");
      if (saved && VALID_TABS.includes(saved)) return saved;
    } catch (e) {}
    return isPetugasLapangan ? "transaksi" : "home";
  }); // home, transaksi, barang, riwayat, laporan
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [recentTx, setRecentTx] = useState([]);
  const [barangList, setBarangList] = useState([]);
  const [filterKategori, setFilterKategori] = useState("all");
  const [isScrolled, setIsScrolled] = useState(false);
  const [showBars, setShowBars] = useState(true); // Auto-hide seperti taskbar Windows
  const [chartMetric, setChartMetric] = useState("income"); // "income" | "expense"
  const [chartTimeFrame, setChartTimeFrame] = useState("monthly"); // "monthly" | "yearly"
  const [hoveredPos, setHoveredPos] = useState(null);
  const [selectedPosDetail, setSelectedPosDetail] = useState(null); // Detail donatur per pos program
  const [selectedTxDetail, setSelectedTxDetail] = useState(null); // Transaksi yang dipilih untuk melihat detail & kelola
  const [editMobileTx, setEditMobileTx] = useState(null); // Transaksi yang sedang diedit di mobile
  const [confirmDialog, setConfirmDialog] = useState(null); // Modal konfirmasi tindakan
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [posTransactions, setPosTransactions] = useState([]);
  const [loadingPosTx, setLoadingPosTx] = useState(false);
  const [posDonorSearch, setPosDonorSearch] = useState("");
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Form Transaksi Cepat
  const [tglTx, setTglTx] = useState(new Date().toISOString().split("T")[0]);
  const [jenisTx, setJenisTx] = useState("income");
  const [metodeTx, setMetodeTx] = useState("");
  const [kategoriTx, setKategoriTx] = useState("");
  const [donaturTx, setDonaturTx] = useState("");
  const [nominalTx, setNominalTx] = useState("");
  const [ketTx, setKetTx] = useState("");
  const [fotoTx, setFotoTx] = useState(null);
  const [txMsg, setTxMsg] = useState(null);

  // Form Barang Cepat
  const [tglBarang, setTglBarang] = useState(new Date().toISOString().split("T")[0]);
  const [donaturBarang, setDonaturBarang] = useState("");
  const [katBarang, setKatBarang] = useState("Material Bangunan");
  const [namaBarang, setNamaBarang] = useState("");
  const [jumlahBarang, setJumlahBarang] = useState("");
  const [satuanBarang, setSatuanBarang] = useState("Sak");
  const [ketBarang, setKetBarang] = useState("");
  const [fotoBarang, setFotoBarang] = useState(null);
  const [barangMsg, setBarangMsg] = useState(null);

  useEffect(() => {
    fetchStats();
    fetchCategories();
    fetchAccounts();
    fetchRecentTx();
    fetchBarangList();

    let lastScrollPosition = window.pageYOffset || document.documentElement.scrollTop || 0;
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop || 0;
          
          const scrolled = currentScrollPosition > 20;
          setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));

          // Selalu tampilkan jika berada di area atas halaman
          if (currentScrollPosition < 60) {
            setShowBars(true);
            lastScrollPosition = currentScrollPosition;
            ticking = false;
            return;
          }

          // Deteksi Arah Scroll:
          const diff = currentScrollPosition - lastScrollPosition;

          // Scroll ke BAWAH (diff > 10px) -> Sembunyikan Navbar & Bottombar
          if (diff > 10) {
            setShowBars(false);
            setShowProfileDropdown(false);
          } 
          // Scroll ke ATAS (diff < -10px) -> Tampilkan kembali Navbar & Bottombar
          else if (diff < -10) {
            setShowBars(true);
          }

          lastScrollPosition = currentScrollPosition <= 0 ? 0 : currentScrollPosition;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Handler untuk Tombol Hardware / Gesture Back HP (Android / Mobile)
  useEffect(() => {
    // Inisialisasi state awal di history browser/webview jika belum ada
    try {
      if (!window.history.state || !window.history.state.tab) {
        window.history.replaceState({ tab: activeTab, posDetailId: null, isRoot: activeTab === "home" }, "");
      }
    } catch (e) {}

    const onPopState = (event) => {
      const state = event.state;
      setShowProfileDropdown(false);
      if (state && state.tab) {
        if (state.posDetailId && categories.length > 0) {
          const found = categories.find(c => String(c.id) === String(state.posDetailId));
          if (found) {
            setSelectedPosDetail(found);
          } else {
            setSelectedPosDetail(null);
          }
        } else {
          setSelectedPosDetail(null);
        }

        setActiveTab(state.tab);
        try {
          sessionStorage.setItem("mobile_active_tab", state.tab);
        } catch (e) {}
      }
      // Note: Jika state null / tidak ada tab (misal saat kembali dari intent Kamera Android), JANGAN paksa reset ke home!
    };

    window.addEventListener("popstate", onPopState);

    const handleAppBack = () => {
      if (showProfileDropdown) {
        setShowProfileDropdown(false);
        return true;
      }
      if (selectedPosDetail) {
        setSelectedPosDetail(null);
        try {
          if (window.history.length > 1) {
            window.history.back();
          }
        } catch (e) {}
        return true;
      }
      if (activeTab !== "home") {
        setActiveTab("home");
        try {
          sessionStorage.setItem("mobile_active_tab", "home");
          if (window.history.length > 1) {
            window.history.back();
          }
        } catch (e) {}
        return true;
      }
      return false;
    };

    window.__handleAppBack = handleAppBack;

    const handleWebMessage = (event) => {
      try {
        let msg = event.data;
        if (typeof msg === "string") {
          msg = JSON.parse(msg);
        }
        if (msg && msg.type === "HARDWARE_BACK_PRESS") {
          handleAppBack();
        }
      } catch (e) {
        // ignore
      }
    };

    window.addEventListener("message", handleWebMessage);
    document.addEventListener("message", handleWebMessage); // Android WebView support

    return () => {
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("message", handleWebMessage);
      document.removeEventListener("message", handleWebMessage);
      if (window.__handleAppBack === handleAppBack) {
        delete window.__handleAppBack;
      }
    };
  }, [showProfileDropdown, selectedPosDetail, activeTab, categories]);

  const changeTab = (newTab) => {
    if (newTab === activeTab && !selectedPosDetail) return;
    setSelectedPosDetail(null);
    setShowProfileDropdown(false);
    setActiveTab(newTab);
    try {
      sessionStorage.setItem("mobile_active_tab", newTab);
      window.history.pushState({ tab: newTab, posDetailId: null }, "");
    } catch (e) {}
  };

  const handlePhotoSelect = async (e, setter) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      setter(compressed);
    } catch (err) {
      setter(file);
    }
  };

  const fetchStats = () => {
    fetch(`${API_BASE}/dashboard/stats`).then(r => r.json()).then(setStats).catch(() => {});
  };
  const fetchCategories = () => {
    fetch(`${API_BASE}/categories`).then(r => r.json()).then(data => {
      const active = data.filter(c => c.is_active);
      setCategories(active);
      if (active.length > 0 && !kategoriTx) setKategoriTx(active[0].id);
    }).catch(() => {});
  };
  const fetchAccounts = () => {
    fetch(`${API_BASE}/accounts`).then(r => r.json()).then(data => {
      setAccounts(data);
      if (data.length > 0 && !metodeTx) setMetodeTx(data[0].id);
    }).catch(() => {});
  };
  const fetchRecentTx = () => {
    const endpoint = isDonatur ? `${API_BASE}/transactions?tx_type=income&limit=50` : `${API_BASE}/transactions?limit=50`;
    fetch(endpoint).then(r => r.json()).then(data => {
      if (Array.isArray(data)) {
        setRecentTx(isDonatur ? data.filter(t => t.jenis === "income") : data);
      } else {
        setRecentTx([]);
      }
    }).catch(() => {});
  };
  const fetchBarangList = () => {
    fetch(`${API_BASE}/donation-items`).then(r => r.json()).then(setBarangList).catch(() => {});
  };

  const handleOpenPosDetail = (category) => {
    setSelectedPosDetail(category);
    try {
      window.history.pushState({ tab: activeTab, posDetailId: category.id }, "");
    } catch (e) {}
    setLoadingPosTx(true);
    fetch(`${API_BASE}/transactions?category_id=${category.id}&tx_type=income&limit=200`)
      .then(r => r.json())
      .then(data => {
        setPosTransactions(data);
        setLoadingPosTx(false);
      })
      .catch(() => {
        setLoadingPosTx(false);
      });
  };

  const handleSimpanTx = (e) => {
    e.preventDefault();
    setTxMsg(null);
    const fd = new FormData();
    fd.append("tanggal", tglTx);
    fd.append("jenis", jenisTx);
    fd.append("metode", metodeTx);
    fd.append("category_id", kategoriTx);
    fd.append("nominal", nominalTx);
    fd.append("nama_donatur", donaturTx);
    fd.append("keterangan", ketTx);
    if (fotoTx) fd.append("bukti_foto", fotoTx);

    fetch(`${API_BASE}/transactions`, { method: "POST", body: fd })
      .then(r => r.json())
      .then(data => {
        if (data.id) {
          setTxMsg({ type: "success", text: "Transaksi berhasil dicatat ke pembukuan!" });
          setNominalTx("");
          setDonaturTx("");
          setKetTx("");
          setFotoTx(null);
          fetchRecentTx();
          fetchStats();
        } else {
          setTxMsg({ type: "danger", text: data.detail || "Gagal menyimpan" });
        }
      });
  };

  const handleDeleteMobileTx = (tx) => {
    setConfirmDialog({
      title: "Hapus Transaksi",
      message: "Apakah Anda yakin ingin menghapus transaksi ini? Saldo kas/bank akan otomatis disesuaikan secara real-time.",
      confirmText: "Hapus Transaksi",
      confirmType: "danger",
      details: [
        { label: "Pihak / Donatur", value: tx.donatur || tx.keterangan || "-" },
        { label: "Nominal", value: formatRupiah(tx.nominal), isHighlight: true },
        { label: "Pos Program", value: tx.pos_program },
        { label: "Rekening", value: tx.metode }
      ],
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_BASE}/transactions/${tx.id}`, { method: "DELETE" });
          if (res.ok) {
            setSelectedTxDetail(null);
            fetchRecentTx();
            fetchStats();
            fetchAccounts();
          } else {
            const data = await res.json();
            alert(data.detail || "Gagal menghapus transaksi");
          }
        } catch (e) {
          alert("Terjadi kesalahan saat menghapus transaksi");
        } finally {
          setConfirmDialog(null);
        }
      }
    });
  };

  const openEditMobileTx = (tx) => {
    const foundCat = categories.find((c) => c.name === tx.pos_program || c.nama_kategori === tx.pos_program);
    const foundAcc = accounts.find((a) => a.name === tx.metode);
    setEditMobileTx({
      id: tx.id,
      tanggal: tx.tanggal,
      jenis: tx.jenis || "income",
      category_id: tx.category_id || (foundCat ? foundCat.id : (categories[0]?.id || 1)),
      metode: tx.account_id || (foundAcc ? foundAcc.id : (accounts[0]?.id || 1)),
      donatur: tx.donatur || "",
      nominal: tx.nominal || 0,
      keterangan: tx.keterangan || "",
      bukti_foto_current: tx.bukti_foto || null,
      bukti_foto_file: null,
      bukti_foto_preview: null
    });
    setSelectedTxDetail(null);
  };

  const handleMobilePhotoEditChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      setEditMobileTx(prev => ({
        ...prev,
        bukti_foto_file: compressed,
        bukti_foto_preview: URL.createObjectURL(compressed)
      }));
    } catch (err) {
      setEditMobileTx(prev => ({
        ...prev,
        bukti_foto_file: file,
        bukti_foto_preview: URL.createObjectURL(file)
      }));
    }
  };

  const handleSaveMobileEdit = async (e) => {
    e.preventDefault();
    if (!editMobileTx || !editMobileTx.id) return;
    setIsSavingEdit(true);
    const fd = new FormData();
    fd.append("tanggal", editMobileTx.tanggal);
    fd.append("jenis", editMobileTx.jenis);
    fd.append("metode", editMobileTx.metode);
    fd.append("category_id", editMobileTx.category_id);
    fd.append("nominal", editMobileTx.nominal);
    fd.append("nama_donatur", editMobileTx.donatur || "");
    fd.append("keterangan", editMobileTx.keterangan || "");
    if (editMobileTx.bukti_foto_file) {
      fd.append("bukti_foto", editMobileTx.bukti_foto_file);
    }

    try {
      const res = await fetch(`${API_BASE}/transactions/${editMobileTx.id}`, {
        method: "PUT",
        body: fd
      });
      const data = await res.json();
      if (res.ok) {
        setEditMobileTx(null);
        fetchRecentTx();
        fetchStats();
        fetchAccounts();
      } else {
        alert(data.detail || "Gagal memperbarui transaksi");
      }
    } catch (err) {
      alert("Terjadi kesalahan saat memperbarui transaksi");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleSimpanBarang = (e) => {
    e.preventDefault();
    setBarangMsg(null);
    const fd = new FormData();
    fd.append("tanggal", tglBarang);
    fd.append("nama_donatur", donaturBarang);
    fd.append("kategori_barang", katBarang);
    fd.append("nama_barang", namaBarang);
    fd.append("jumlah", jumlahBarang);
    fd.append("satuan", satuanBarang);
    fd.append("keterangan", ketBarang);
    if (fotoBarang) fd.append("bukti_foto", fotoBarang);

    fetch(`${API_BASE}/donation-items`, { method: "POST", body: fd })
      .then(r => r.json())
      .then(data => {
        if (data.id) {
          setBarangMsg({ type: "success", text: "Donasi logistik berhasil dicatat!" });
          setDonaturBarang("");
          setNamaBarang("");
          setJumlahBarang("");
          setKetBarang("");
          setFotoBarang(null);
          fetchBarangList();
          fetchStats();
        }
      });
  };

  const formatRupiah = (val) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val || 0);

  const kasAccount = stats?.accounts?.find(a => a.name.toLowerCase().includes("kas"))?.balance || 0;
  const bankAccount = stats?.accounts?.find(a => a.name.toLowerCase().includes("bni") || a.name.toLowerCase().includes("bank"))?.balance || 0;

  // Data Tren Keuangan & Distribusi Pos
  const trendData = chartTimeFrame === "monthly" ? stats?.monthly_trends || [] : stats?.yearly_trends || [];
  const maxTrendVal = Math.max(...trendData.map(d => chartMetric === "income" ? (d.income || 0) : (d.expense || 0)), 1000000);
  
  const posSummaryList = (stats?.category_summary || []).length > 0
    ? stats.category_summary
    : categories.map(c => ({
        id: c.id,
        name: c.nama_kategori || c.name,
        code: c.code || "POS",
        income: 0,
        expense: 0
      }));

  const totalPosMetric = posSummaryList.reduce((acc, pos) => {
    const val = chartMetric === "expense" ? pos.expense : pos.income;
    return acc + (val > 0 ? val : 0);
  }, 0) || 1;

  const palette = [
    { main: "#ef4444", light: "#fee2e2", border: "#dc2626", name: "Merah" }, // Red
    { main: "#0ea5e9", light: "#e0f2fe", border: "#0284c7", name: "Biru Langit" }, // Sky Blue
    { main: "#10b981", light: "#ecfdf5", border: "#059669", name: "Hijau Emerald" }, // Emerald
    { main: "#f59e0b", light: "#fef3c7", border: "#d97706", name: "Amber Kuning" }, // Amber
    { main: "#8b5cf6", light: "#f3e8ff", border: "#7c3aed", name: "Ungu Violet" }, // Purple
    { main: "#ec4899", light: "#fce7f3", border: "#db2777", name: "Pink Magenta" }, // Pink
    { main: "#14b8a6", light: "#ccfbf1", border: "#0d9488", name: "Toska Teal" }, // Teal
    { main: "#f97316", light: "#ffedd5", border: "#ea580c", name: "Oranye" }, // Orange
    { main: "#6366f1", light: "#e0e7ff", border: "#4f46e5", name: "Indigo" } // Indigo
  ];

  // Algoritma Penataan Persegi Berwarna (Treemap Layout) yang mengisi penuh ruang kotak
  const validPosList = posSummaryList.map((pos, idx) => {
    const val = (chartMetric === "expense" ? pos.expense : pos.income) || 0;
    const pct = totalPosMetric > 0 ? (val / totalPosMetric) * 100 : 0;
    const color = palette[idx % palette.length];
    return { ...pos, val, pct, color };
  });

  const packedRectangles = (() => {
    const activeItems = validPosList.filter(p => p.pct > 0);
    if (activeItems.length === 0) return [];

    const sorted = [...activeItems].sort((a, b) => b.pct - a.pct);
    const totalW = 340;
    const totalH = 140;

    function layoutTreemap(list, rx, ry, rw, rh) {
      if (list.length === 0) return [];
      if (list.length === 1) {
        return [{ ...list[0], x: rx, y: ry, w: rw, h: rh }];
      }

      const sumTotal = list.reduce((s, it) => s + it.pct, 0) || 1;
      const half = sumTotal / 2;
      let acc = 0;
      let splitIdx = 1;
      for (let i = 0; i < list.length - 1; i++) {
        acc += list[i].pct;
        if (acc >= half || i === list.length - 2) {
          splitIdx = i + 1;
          break;
        }
      }

      const part1 = list.slice(0, splitIdx);
      const part2 = list.slice(splitIdx);
      const sum1 = part1.reduce((s, it) => s + it.pct, 0);
      const ratio = Math.max(0.1, Math.min(0.9, sum1 / sumTotal));

      if (rw >= rh) {
        const w1 = rw * ratio;
        const w2 = rw - w1;
        return [
          ...layoutTreemap(part1, rx, ry, w1, rh),
          ...layoutTreemap(part2, rx + w1, ry, w2, rh)
        ];
      } else {
        const h1 = rh * ratio;
        const h2 = rh - h1;
        return [
          ...layoutTreemap(part1, rx, ry, rw, h1),
          ...layoutTreemap(part2, rx, ry + h1, rw, h2)
        ];
      }
    }

    return layoutTreemap(sorted, 0, 0, totalW, totalH);
  })();

  return (
    <div className="mobile-app-shell">
      {/* Background Canvas */}
      <div className="mobile-parallax-bg-wrapper" aria-hidden="true">
        <DynamicBackgroundCanvas bgTheme={bgTheme} theme={theme} />
      </div>

      {/* GoPay-style Top Navbar (Auto-Hide saat scroll ke bawah, Muncul saat scroll ke atas) */}
      <header className={`gopay-header ${isScrolled ? "scrolled" : ""} ${showBars ? "bar-visible" : "bar-hidden"}`}>
        <div className="gopay-header-top">
          <div className="gopay-brand-wrapper">
            <img src={logoImg} alt="Logo Donasi Latee" className="gopay-brand-avatar" />
            <div className="gopay-brand-info">
              <div className="gopay-app-title">Donasi Latee</div>
              <div className="gopay-app-subtitle">PP Annuqayah Latee</div>
            </div>
          </div>
          <div className="gopay-header-actions">
            <button
              className={`gopay-user-badge ${showProfileDropdown ? "active" : ""}`}
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            >
              <div className="gopay-badge-avatar">
                {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
              </div>
              <span className="gopay-badge-name">{user?.name ? user.name.split(" ")[0] : "Admin"}</span>
              {showProfileDropdown ? <IconChevronUp size={13} /> : <IconChevronDown size={13} />}
            </button>

            {showProfileDropdown && (
              <div className="gopay-dropdown-menu">
                <div className="gopay-drop-profile">
                  <div className="gopay-drop-user-name">{user?.name || "Admin Lapangan"}</div>
                  <div className="gopay-drop-user-role">
                    {user?.role === "pimpinan" ? "Pimpinan (Read-Only)" : "Petugas / Bendahara"}
                  </div>
                </div>
                <div className="gopay-drop-divider"></div>
                {typeof onToggleTheme === "function" && (
                  <button
                    className="gopay-drop-item"
                    onClick={() => {
                      onToggleTheme();
                    }}
                  >
                    {theme === "dark" ? <IconSun size={16} /> : <IconMoon size={16} />}
                    <span>{theme === "dark" ? "Mode Terang (Siang)" : "Mode Gelap (Malam)"}</span>
                  </button>
                )}
                {typeof onOpenThemeModal === "function" && (
                  <button
                    className="gopay-drop-item"
                    onClick={() => {
                      setShowProfileDropdown(false);
                      onOpenThemeModal();
                    }}
                  >
                    <IconPalette size={16} />
                    <span>Tema & Animasi Latar</span>
                  </button>
                )}
                {typeof onOpenFontModal === "function" && (
                  <button
                    className="gopay-drop-item"
                    onClick={() => {
                      setShowProfileDropdown(false);
                      onOpenFontModal();
                    }}
                  >
                    <IconType size={16} />
                    <span>Ukuran Font</span>
                  </button>
                )}
                {!isPetugasLapangan && (
                  <button className="gopay-drop-item" onClick={onSwitchPortal}>
                    <IconMonitor size={16} />
                    <span>Mode Web Portal</span>
                  </button>
                )}
                <button className="gopay-drop-item logout" onClick={onLogout}>
                  <IconLogOut size={16} />
                  <span>Keluar</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mobile-body">
        {/* TAB 1: GOPAY HOME DASHBOARD */}
        {activeTab === "home" && !selectedPosDetail && (
          <div className="gopay-home-container">
            {/* GOPAY WALLET HERO CARD */}
            <div className="gopay-wallet-card">
              {/* Wallet Header & Balance */}
              <div className="gopay-wallet-header">
                <div className="gopay-wallet-title-row">
                  <span className="gopay-wallet-badge">Saldo Amanah Donasi</span>
                  <button className="gopay-wallet-refresh-btn" onClick={() => { fetchStats(); fetchRecentTx(); }} title="Perbarui Saldo">
                    <IconRefresh size={14} color="#a7f3d0" />
                  </button>
                </div>
                <div className="gopay-wallet-balance-num">
                  {formatRupiah(stats?.total_assets)}
                </div>
                <div className="gopay-wallet-pockets">
                  <div className="gopay-pocket-chip">
                    <span className="pocket-dot kas"></span>
                    <span className="pocket-label">Kas Tunai:</span>
                    <span className="pocket-val">{formatRupiah(kasAccount)}</span>
                  </div>
                  <div className="gopay-pocket-chip">
                    <span className="pocket-dot bank"></span>
                    <span className="pocket-label">Rekening Bank:</span>
                    <span className="pocket-val">{formatRupiah(bankAccount)}</span>
                  </div>
                </div>
              </div>

              {/* 4 Iconic Syariah Action Buttons */}
              <div className="gopay-action-row">
                <button
                  className="gopay-action-btn"
                  onClick={() => !isReadOnly && changeTab("transaksi")}
                  disabled={isReadOnly}
                >
                  <div className="gopay-action-icon blue">
                    <IconSend size={22} color="#ffffff" />
                  </div>
                  <span className="gopay-action-text">{isReadOnly ? "Penerimaan" : "Catat Infaq"}</span>
                </button>

                <button
                  className="gopay-action-btn"
                  onClick={() => !isReadOnly && changeTab("barang")}
                  disabled={isReadOnly}
                >
                  <div className="gopay-action-icon emerald">
                    <IconPackage size={22} color="#ffffff" />
                  </div>
                  <span className="gopay-action-text">Infaq Barang</span>
                </button>

                <button
                  className="gopay-action-btn"
                  onClick={() => changeTab("riwayat")}
                >
                  <div className="gopay-action-icon purple">
                    <IconHistory size={22} color="#ffffff" />
                  </div>
                  <span className="gopay-action-text">Mutasi Kas</span>
                </button>

                <button
                  className="gopay-action-btn"
                  onClick={() => changeTab("laporan")}
                >
                  <div className="gopay-action-icon amber">
                    <IconFileText size={22} color="#ffffff" />
                  </div>
                  <span className="gopay-action-text">Laporan</span>
                </button>
              </div>
            </div>

            {/* QUICK STATS CASHFLOW PILLARS DENGAN BAHASA SYARIAH */}
            <div className="gopay-cashflow-grid">
              <div className="gopay-cashflow-card income">
                <div className="cashflow-icon-circle in">
                  <IconTrendingUp size={16} color="#059669" />
                </div>
                <div className="cashflow-info">
                  <span className="cashflow-title">Penerimaan Donasi</span>
                  <span className="cashflow-nominal in">+{formatRupiah(stats?.total_income)}</span>
                </div>
              </div>
              <div className="gopay-cashflow-card expense">
                <div className="cashflow-icon-circle out">
                  <IconTrendingDown size={16} color="#dc2626" />
                </div>
                <div className="cashflow-info">
                  <span className="cashflow-title">Penyaluran / Beban</span>
                  <span className="cashflow-nominal out">-{formatRupiah(stats?.total_expense)}</span>
                </div>
              </div>
            </div>

            {/* DIAGRAM DISTRIBUSI POS & KAS MOBILE */}
            {/* DIAGRAM DISTRIBUSI POS PROGRAM (FULL COLOR-FILLED BUBBLE PIE CHART) */}
            <div className="gopay-section-block">
              <div className="gopay-section-header">
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <IconPieChart size={16} color="#059669" />
                  <h3 className="gopay-section-title">Distribusi Pos Program</h3>
                </div>
                <div className="mobile-chart-metric-toggle">
                  <button
                    type="button"
                    className={`mobile-chart-toggle-btn ${chartMetric === "income" ? "active" : ""}`}
                    onClick={() => {
                      setChartMetric("income");
                      setHoveredPos(null);
                    }}
                  >
                    Masuk
                  </button>
                  <button
                    type="button"
                    className={`mobile-chart-toggle-btn ${chartMetric === "expense" ? "active" : ""}`}
                    onClick={() => {
                      setChartMetric("expense");
                      setHoveredPos(null);
                    }}
                  >
                    Keluar
                  </button>
                </div>
              </div>

              {/* Interactive Colorful Rectangle Treemap Card */}
              <div className="mobile-bubble-chart-card">
                {/* Visual Section: Full Width Rectangular Treemap Boxes */}
                <div className="mobile-treemap-container">
                  <svg width="100%" height="150" viewBox="0 0 340 140" preserveAspectRatio="none" className="treemap-svg">
                    {packedRectangles.map((b, idx) => {
                      const isSelected = hoveredPos?.id === b.id;
                      const pad = 2.5;
                      const rx = b.x + pad;
                      const ry = b.y + pad;
                      const rw = Math.max(b.w - pad * 2, 4);
                      const rh = Math.max(b.h - pad * 2, 4);
                      const showLabel = rw >= 42 && rh >= 28;
                      const showCode = rw >= 56 && rh >= 46;

                      return (
                        <g
                          key={idx}
                          className={`treemap-node-group ${isSelected ? "selected" : ""}`}
                          style={{ cursor: "pointer" }}
                          onClick={() => setHoveredPos(hoveredPos?.id === b.id ? null : b)}
                        >
                          {/* Colorful Rounded Rectangle */}
                          <rect
                            x={rx}
                            y={ry}
                            width={rw}
                            height={rh}
                            rx="10"
                            ry="10"
                            fill={b.color.main}
                            stroke={isSelected ? "#ffffff" : "rgba(255,255,255,0.2)"}
                            strokeWidth={isSelected ? "3" : "1.5"}
                            style={{
                              transition: "all 0.25s ease",
                              filter: isSelected
                                ? `drop-shadow(0 0 8px ${b.color.main})`
                                : "drop-shadow(0 2px 4px rgba(0,0,0,0.08))",
                              opacity: hoveredPos ? (isSelected ? 1 : 0.38) : 0.95
                            }}
                          />
                          
                          {/* Subtle Gloss Overlay on Rectangle */}
                          <rect
                            x={rx + 2}
                            y={ry + 2}
                            width={Math.max(rw - 4, 2)}
                            height={Math.min(rh * 0.35, 14)}
                            rx="6"
                            ry="6"
                            fill="rgba(255,255,255,0.22)"
                            pointerEvents="none"
                          />

                          {/* Percentage Text inside Rectangle */}
                          {showLabel && (
                            <text
                              x={rx + rw / 2}
                              y={ry + rh / 2 + (showCode ? -4 : 4)}
                              textAnchor="middle"
                              fontSize={rw >= 80 ? "15" : (rw >= 55 ? "12.5" : "11")}
                              fontWeight="900"
                              fill="#ffffff"
                              pointerEvents="none"
                              filter="drop-shadow(0 1px 2px rgba(0,0,0,0.5))"
                            >
                              {b.pct.toFixed(0)}%
                            </text>
                          )}

                          {/* Pos Code inside Rectangle */}
                          {showCode && (
                            <text
                              x={rx + rw / 2}
                              y={ry + rh / 2 + 12}
                              textAnchor="middle"
                              fontSize="9.5"
                              fontWeight="800"
                              fill="rgba(255,255,255,0.9)"
                              pointerEvents="none"
                              style={{ textTransform: "uppercase" }}
                            >
                              {String(b.code || "POS").toUpperCase()}
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Dynamic Pos Reveal Banner (Keterangan Nama & Rincian Muncul saat Diklik) */}
                {hoveredPos ? (
                  <div className="mobile-bubble-info-banner" style={{ borderLeftColor: hoveredPos.color.main }}>
                    <div className="bubble-info-left">
                      <div className="bubble-info-badge" style={{ background: hoveredPos.color.light, color: hoveredPos.color.main }}>
                        <span className="badge-color-dot" style={{ background: hoveredPos.color.main }} />
                        <span>[{hoveredPos.code || "POS"}] {hoveredPos.pct.toFixed(1)}% dari Total</span>
                      </div>
                      <div className="bubble-info-title" title={hoveredPos.name}>
                        {hoveredPos.name || hoveredPos.nama_kategori}
                      </div>
                      <div className="bubble-info-nominal">
                        {chartMetric === "income" ? "Total Donasi Masuk: " : "Total Penyaluran: "}
                        <strong>{formatRupiah(hoveredPos.val)}</strong>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="bubble-info-action-btn"
                      style={{ background: hoveredPos.color.main }}
                      onClick={() => handleOpenPosDetail(hoveredPos)}
                    >
                      <span>Lihat Donatur</span>
                      <IconArrowRight size={13} color="#ffffff" />
                    </button>
                  </div>
                ) : (
                  <div className="mobile-bubble-hint-box" style={{ justifyContent: "center" }}>
                    <span className="hint-pulse-dot" />
                    <span>Ketuk bulatan warna di atas untuk melihat nama pos & rincian nominal</span>
                  </div>
                )}
              </div>
            </div>

            {/* PROGRAM POS GRID TILES */}
            <div className="gopay-section-block">
              <div className="gopay-section-header">
                <h3 className="gopay-section-title">Daftar Pos Program</h3>
                {categories.length > 4 && (
                  <button
                    type="button"
                    className="gopay-toggle-more-btn"
                    onClick={() => setShowAllCategories(!showAllCategories)}
                  >
                    <span>{showAllCategories ? "Sembunyikan" : "Lainnya"}</span>
                    {showAllCategories ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
                  </button>
                )}
              </div>
              <div className="gopay-program-grid">
                {(showAllCategories ? categories : categories.slice(0, 4)).map((cat, idx) => (
                  <div
                    key={cat.id}
                    className="gopay-program-tile"
                    onClick={() => handleOpenPosDetail(cat)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className={`gopay-tile-icon theme-${(idx % 4) + 1}`}>
                      <IconMosque size={20} color="currentColor" />
                    </div>
                    <span className="gopay-tile-name" title={cat.nama_kategori}>
                      {formatPosNameShort(cat.nama_kategori)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Indikator Singkatan Kecil Mobile */}
              <div style={{ marginTop: "10px", padding: "6px 8px", background: "#f8fafc", borderRadius: "8px", fontSize: "10px", color: "#64748b", display: "flex", gap: "6px", flexWrap: "wrap", border: "1px dashed #e2e8f0" }}>
                <span style={{ fontWeight: 700, color: "#475569" }}>Ket:</span>
                {POS_ABBREVIATIONS.slice(0, 3).map((abbr, i) => (
                  <span key={i}><strong>{abbr.short}</strong>={abbr.full}</span>
                ))}
              </div>
            </div>

            {/* FEED AKTIVITAS / TRANSAKSI TERKINI */}
            <div className="gopay-section-block">
              <div className="gopay-section-header">
                <h3 className="gopay-section-title">Aktivitas Donasi Terkini</h3>
                <span className="gopay-link-btn" onClick={() => changeTab("riwayat")}>
                  Lihat Semua
                </span>
              </div>
              <div className="gopay-feed-card">
                {recentTx.length === 0 ? (
                  <div className="gopay-empty-state">Belum ada donasi tercatat.</div>
                ) : (
                  recentTx.slice(0, 6).map((tx) => (
                    <div key={tx.id} className="gopay-feed-row">
                      <div className={`gopay-feed-avatar ${tx.jenis}`}>
                        {tx.jenis === "income" ? (
                          <IconTrendingUp size={18} color="#059669" />
                        ) : (
                          <IconTrendingDown size={18} color="#dc2626" />
                        )}
                      </div>
                      <div className="gopay-feed-main">
                        <div className="gopay-feed-title">{tx.donatur || (tx.jenis === "income" ? "Hamba Allah" : "Operasional Pesantren")}</div>
                        <div className="gopay-feed-meta">
                          {tx.pos_program} • {tx.tanggal}
                        </div>
                      </div>
                      <div className={`gopay-feed-value ${tx.jenis}`}>
                        {formatRupiah(tx.nominal)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* DETAIL DAFTAR DONATUR PER POS PROGRAM */}
        {selectedPosDetail && (
          <div className="gopay-pos-detail-container">
            {/* Header Pos Detail dengan Back Button */}
            <div className="gopay-pos-detail-header">
              <button
                type="button"
                className="gopay-back-btn"
                onClick={() => {
                  setSelectedPosDetail(null);
                  try {
                    if (window.history.length > 1) {
                      window.history.back();
                    }
                  } catch (e) {}
                }}
              >
                <IconArrowLeft size={18} />
                <span>Kembali ke Beranda</span>
              </button>
              <div className="gopay-pos-detail-title-card">
                <div className="pos-badge-code">
                  [{selectedPosDetail.code || "POS"}]
                </div>
                <h2 className="pos-detail-name">
                  {selectedPosDetail.nama_kategori || selectedPosDetail.name}
                </h2>
                <div className="pos-detail-stats-row">
                  <div className="pos-stat-box">
                    <span className="pos-stat-label">Total Donatur</span>
                    <span className="pos-stat-value">{posTransactions.length} Orang</span>
                  </div>
                  <div className="pos-stat-box">
                    <span className="pos-stat-label">Akumulasi Donasi</span>
                    <span className="pos-stat-value text-emerald">
                      {formatRupiah(posTransactions.reduce((s, t) => s + (t.nominal || 0), 0))}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Kotak Pencarian Donatur Pos */}
            <div className="pos-search-box">
              <IconSearch size={16} color="#94a3b8" />
              <input
                type="text"
                className="pos-search-input"
                placeholder="Cari nama donatur / tanggal..."
                value={posDonorSearch}
                onChange={(e) => setPosDonorSearch(e.target.value)}
              />
              {posDonorSearch && (
                <button
                  type="button"
                  className="pos-search-clear"
                  onClick={() => setPosDonorSearch("")}
                >
                  ✕
                </button>
              )}
            </div>

            {/* List Daftar Donatur Pos */}
            <div className="pos-donors-list">
              {loadingPosTx ? (
                <div className="gopay-empty-state">
                  <span>Memuat daftar donatur pos...</span>
                </div>
              ) : posTransactions.filter((tx) => {
                  if (!posDonorSearch) return true;
                  const query = posDonorSearch.toLowerCase();
                  return (
                    (tx.donatur || "").toLowerCase().includes(query) ||
                    (tx.tanggal || "").includes(query) ||
                    (tx.keterangan || "").toLowerCase().includes(query)
                  );
                }).length === 0 ? (
                <div className="gopay-empty-state">
                  <IconUsers size={28} color="#94a3b8" />
                  <p style={{ marginTop: "8px", fontWeight: "700" }}>Belum ada donatur tercatat</p>
                  <span style={{ fontSize: "11.5px", color: "#64748b" }}>
                    {posDonorSearch ? "Tidak ada donatur yang cocok dengan pencarian." : "Belum ada transaksi donasi masuk untuk pos program ini."}
                  </span>
                </div>
              ) : (
                posTransactions
                  .filter((tx) => {
                    if (!posDonorSearch) return true;
                    const query = posDonorSearch.toLowerCase();
                    return (
                      (tx.donatur || "").toLowerCase().includes(query) ||
                      (tx.tanggal || "").includes(query) ||
                      (tx.keterangan || "").toLowerCase().includes(query)
                    );
                  })
                  .map((tx, idx) => (
                    <div key={tx.id || idx} className="pos-donor-card">
                      <div className="pos-donor-avatar">
                        {(tx.donatur || "H").charAt(0).toUpperCase()}
                      </div>
                      <div className="pos-donor-info">
                        <div className="pos-donor-name-row">
                          <span className="pos-donor-name">{tx.donatur || "Hamba Allah"}</span>
                          <span className="pos-donor-amount">{formatRupiah(tx.nominal)}</span>
                        </div>
                        <div className="pos-donor-meta">
                          <span>{tx.tanggal}</span>
                          <span>•</span>
                          <span>{tx.metode || "Kas / Bank"}</span>
                        </div>
                        {tx.keterangan && (
                          <div className="pos-donor-note">"{tx.keterangan}"</div>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2: FORM TRANSAKSI CEPAT (CATAT INFAQ) */}
        {activeTab === "transaksi" && (
          <div className="gopay-form-container">
            <div className="gopay-form-card">
              <div className="gopay-form-header">
                <h2 className="gopay-form-title">Pencatatan Donasi & Penyaluran</h2>
                <p className="gopay-form-subtitle">Pencatatan amanah donasi masuk dan penyaluran dana pesantren.</p>
              </div>

              {txMsg && <div className={`gopay-alert ${txMsg.type}`}>{txMsg.text}</div>}

              <form onSubmit={handleSimpanTx} className="gopay-form">
                <div className="gopay-field">
                  <label className="gopay-label">Jenis Transaksi</label>
                  <div className="gopay-segmented-ctrl">
                    <button
                      type="button"
                      className={`gopay-segment-btn ${jenisTx === "income" ? "active-in" : ""}`}
                      onClick={() => setJenisTx("income")}
                    >
                      <IconTrendingUp size={15} />
                      <span>Donasi Masuk</span>
                    </button>
                    <button
                      type="button"
                      className={`gopay-segment-btn ${jenisTx === "expense" ? "active-out" : ""}`}
                      onClick={() => setJenisTx("expense")}
                    >
                      <IconTrendingDown size={15} />
                      <span>Penyaluran / Beban</span>
                    </button>
                  </div>
                </div>

                <div className="gopay-field">
                  <label className="gopay-label">Tanggal Transaksi</label>
                  <CustomDatePicker
                    value={tglTx}
                    onChange={(e) => setTglTx(e.target.value)}
                    required
                  />
                </div>

                <div className="gopay-field">
                  <label className="gopay-label">Rekening / Kas Penyimpanan</label>
                  <CustomDropdown
                    value={metodeTx}
                    onChange={(e) => setMetodeTx(e.target.value)}
                    options={accounts.map((a) => ({
                      value: a.id,
                      label: a.name
                    }))}
                  />
                </div>

                <div className="gopay-field">
                  <label className="gopay-label">Pos Program / Alokasi Amanah</label>
                  <CustomDropdown
                    value={kategoriTx}
                    onChange={(e) => setKategoriTx(e.target.value)}
                    searchable={categories.length > 5}
                    searchPlaceholder="Cari pos..."
                    options={categories.map((c) => ({
                      value: c.id,
                      label: c.nama_kategori
                    }))}
                    required
                  />
                </div>

                <div className="gopay-field">
                  <label className="gopay-label">
                    {jenisTx === "income" ? "Nama Donatur / Penyumbang" : "Penerima Dana / Keperluan"}
                  </label>
                  <input
                    type="text"
                    className="gopay-input"
                    placeholder="Contoh: H. Ahmad Mansur / Pembelian Semen"
                    value={donaturTx}
                    onChange={(e) => setDonaturTx(e.target.value)}
                  />
                </div>

                <div className="gopay-field">
                  <label className="gopay-label">Nominal (Rp)</label>
                  <div className="gopay-input-prefix-wrapper">
                    <span className="gopay-input-prefix">Rp</span>
                    <input
                      type="number"
                      className="gopay-input with-prefix"
                      placeholder="500000"
                      value={nominalTx}
                      onChange={(e) => setNominalTx(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="gopay-field">
                  <label className="gopay-label">Keterangan / Catatan Tambahan</label>
                  <input
                    type="text"
                    className="gopay-input"
                    placeholder="Catatan donatur / rincian material..."
                    value={ketTx}
                    onChange={(e) => setKetTx(e.target.value)}
                  />
                </div>

                <div className="gopay-field">
                  <label className="gopay-label">Foto Bukti / Nota / Kwitansi</label>
                  <div className="gopay-camera-upload-box">
                    {fotoTx ? (
                      <div className="gopay-camera-preview-wrap">
                        <img
                          src={URL.createObjectURL(fotoTx)}
                          alt="Preview Bukti"
                          className="gopay-camera-preview-img"
                        />
                        <button
                          type="button"
                          className="gopay-camera-remove-btn"
                          onClick={() => setFotoTx(null)}
                        >
                          ✕ Hapus Foto
                        </button>
                      </div>
                    ) : (
                      <div className="gopay-camera-btn-group">
                        <label className="gopay-camera-action-btn camera">
                          <IconCamera size={19} />
                          <span>Ambil Foto Kamera</span>
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={(e) => handlePhotoSelect(e, setFotoTx)}
                            style={{ display: "none" }}
                          />
                        </label>
                        <label className="gopay-camera-action-btn gallery">
                          <IconImage size={19} />
                          <span>Pilih dari Galeri</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handlePhotoSelect(e, setFotoTx)}
                            style={{ display: "none" }}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <button type="submit" className="gopay-submit-btn">
                  <IconCheckCircle size={18} color="#ffffff" />
                  <span>Simpan Transaksi</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: DONASI BARANG CEPAT */}
        {activeTab === "barang" && (
          <div className="gopay-form-container">
            <div className="gopay-form-card">
              <div className="gopay-form-header">
                <h2 className="gopay-form-title">Donasi Logistik & Material Fisik</h2>
                <p className="gopay-form-subtitle">Pencatatan sumbangan fisik untuk konsumsi dan bahan bangunan.</p>
              </div>

              {barangMsg && <div className={`gopay-alert ${barangMsg.type}`}>{barangMsg.text}</div>}

              <form onSubmit={handleSimpanBarang} className="gopay-form">
                <div className="gopay-field">
                  <label className="gopay-label">Tanggal Penerimaan</label>
                  <CustomDatePicker
                    value={tglBarang}
                    onChange={(e) => setTglBarang(e.target.value)}
                    required
                  />
                </div>

                <div className="gopay-field">
                  <label className="gopay-label">Nama Donatur</label>
                  <input
                    type="text"
                    className="gopay-input"
                    placeholder="Contoh: Alumni Angkatan 2015"
                    value={donaturBarang}
                    onChange={(e) => setDonaturBarang(e.target.value)}
                    required
                  />
                </div>

                <div className="gopay-field">
                  <label className="gopay-label">Kategori Logistik</label>
                  <CustomDropdown
                    value={katBarang}
                    onChange={(e) => setKatBarang(e.target.value)}
                    options={[
                      { value: "Material Bangunan", label: "Material Bangunan (Semen, Pasir, Bata, Besi)" },
                      { value: "Konsumsi Tukang", label: "Konsumsi Tukang (Beras, Kopi, Gula, Air Mineral)" },
                      { value: "Perlengkapan Lainnya", label: "Perlengkapan & Sound / Lainnya" }
                    ]}
                  />
                </div>

                <div className="gopay-field">
                  <label className="gopay-label">Nama & Deskripsi Barang</label>
                  <input
                    type="text"
                    className="gopay-input"
                    placeholder="Contoh: Semen Gresik 40kg"
                    value={namaBarang}
                    onChange={(e) => setNamaBarang(e.target.value)}
                    required
                  />
                </div>

                <div className="gopay-grid-2">
                  <div className="gopay-field">
                    <label className="gopay-label">Jumlah / Volume</label>
                    <input
                      type="number"
                      step="0.1"
                      className="gopay-input"
                      placeholder="10"
                      value={jumlahBarang}
                      onChange={(e) => setJumlahBarang(e.target.value)}
                      required
                    />
                  </div>
                  <div className="gopay-field">
                    <label className="gopay-label">Satuan</label>
                    <input
                      type="text"
                      className="gopay-input"
                      placeholder="Sak / Dus / Truk"
                      value={satuanBarang}
                      onChange={(e) => setSatuanBarang(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="gopay-field">
                  <label className="gopay-label">Catatan / Alokasi Penempatan</label>
                  <input
                    type="text"
                    className="gopay-input"
                    placeholder="Ditaruh di gudang Latee II..."
                    value={ketBarang}
                    onChange={(e) => setKetBarang(e.target.value)}
                  />
                </div>

                <div className="gopay-field">
                  <label className="gopay-label">Foto Bukti / Fisik Barang (Opsional)</label>
                  <div className="gopay-camera-upload-box">
                    {fotoBarang ? (
                      <div className="gopay-camera-preview-wrap">
                        <img
                          src={URL.createObjectURL(fotoBarang)}
                          alt="Preview Barang"
                          className="gopay-camera-preview-img"
                        />
                        <button
                          type="button"
                          className="gopay-camera-remove-btn"
                          onClick={() => setFotoBarang(null)}
                        >
                          ✕ Hapus Foto
                        </button>
                      </div>
                    ) : (
                      <div className="gopay-camera-btn-group">
                        <label className="gopay-camera-action-btn camera">
                          <IconCamera size={19} />
                          <span>Ambil Foto Kamera</span>
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={(e) => handlePhotoSelect(e, setFotoBarang)}
                            style={{ display: "none" }}
                          />
                        </label>
                        <label className="gopay-camera-action-btn gallery">
                          <IconImage size={19} />
                          <span>Pilih dari Galeri</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handlePhotoSelect(e, setFotoBarang)}
                            style={{ display: "none" }}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <button type="submit" className="gopay-submit-btn">
                  <IconCheckCircle size={18} color="#ffffff" />
                  <span>Simpan Infaq Barang</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 4: RIWAYAT TRANSAKSI LENGKAP (MUTASI) */}
        {activeTab === "riwayat" && (
          <div className="gopay-history-container">
            <div className="gopay-section-header">
              <h3 className="gopay-section-title">
                {isDonatur ? "Riwayat Penerimaan Donasi" : "Riwayat Mutasi Donasi"}
              </h3>
              <span className="gopay-count-badge">
                {isDonatur ? recentTx.filter(t => t.jenis === "income").length : recentTx.length} Catatan
              </span>
            </div>

            <div className="gopay-feed-card">
              {(isDonatur ? recentTx.filter(t => t.jenis === "income") : recentTx).length === 0 ? (
                <div className="gopay-empty-state">Belum ada riwayat penerimaan donasi tercatat.</div>
              ) : (
                (isDonatur ? recentTx.filter(t => t.jenis === "income") : recentTx).map((tx) => (
                  <div
                    key={tx.id}
                    className="gopay-feed-row"
                    onClick={() => setSelectedTxDetail(tx)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className={`gopay-feed-avatar ${tx.jenis}`}>
                      {tx.jenis === "income" ? (
                        <IconTrendingUp size={18} color="#059669" />
                      ) : (
                        <IconTrendingDown size={18} color="#dc2626" />
                      )}
                    </div>
                    <div className="gopay-feed-main">
                      <div className="gopay-feed-title">{tx.donatur || (tx.jenis === "income" ? "Hamba Allah" : "Operasional Pesantren")}</div>
                      <div className="gopay-feed-meta">
                        {tx.pos_program} • {tx.metode}
                      </div>
                      <div className="gopay-feed-date">{tx.tanggal}</div>
                    </div>
                    <div className={`gopay-feed-value ${tx.jenis}`}>
                      {formatRupiah(tx.nominal)}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* MODAL DETAIL & HAPUS TRANSAKSI MOBILE (Rendered via React Portal directly on document.body) */}
            {selectedTxDetail && createPortal(
              <div className="modal-backdrop-custom" onClick={() => setSelectedTxDetail(null)}>
                <div className="modal-card-custom mobile-tx-detail-modal" style={{ maxWidth: "440px", margin: "auto 16px" }} onClick={(e) => e.stopPropagation()}>
                  {/* Modern Colored Header */}
                  <div className={`mobile-modal-banner ${selectedTxDetail.jenis === "income" ? "income-banner" : "expense-banner"}`}>
                    <div className="mobile-modal-banner-top">
                      <span className={`mobile-badge-pill ${selectedTxDetail.jenis === "income" ? "badge-income" : "badge-expense"}`}>
                        {selectedTxDetail.jenis === "income" ? (
                          <>
                            <IconTrendingUp size={13} /> Donasi Masuk
                          </>
                        ) : (
                          <>
                            <IconTrendingDown size={13} /> Penyaluran / Beban
                          </>
                        )}
                      </span>
                      <button type="button" className="mobile-modal-close-btn" onClick={() => setSelectedTxDetail(null)} title="Tutup">
                        ✕
                      </button>
                    </div>

                    <div className="mobile-banner-amount">
                      {selectedTxDetail.jenis === "income" ? `+ ${formatRupiah(selectedTxDetail.nominal)}` : `- ${formatRupiah(selectedTxDetail.nominal)}`}
                    </div>
                    <div className="mobile-banner-title">
                      {selectedTxDetail.donatur || (selectedTxDetail.jenis === "income" ? "Hamba Allah" : "Operasional Pesantren")}
                    </div>
                  </div>

                  <div className="modal-body-custom" style={{ padding: "18px 20px" }}>
                    {/* Information Grid Cards */}
                    <div className="mobile-detail-grid">
                      <div className="mobile-detail-card">
                        <div className="detail-card-icon">
                          <IconCalendar size={16} />
                        </div>
                        <div className="detail-card-content">
                          <span className="detail-card-label">Tanggal Transaksi</span>
                          <span className="detail-card-val">{selectedTxDetail.tanggal}</span>
                        </div>
                      </div>

                      <div className="mobile-detail-card">
                        <div className="detail-card-icon">
                          <IconFolderPos size={16} />
                        </div>
                        <div className="detail-card-content">
                          <span className="detail-card-label">Pos Program</span>
                          <span className="detail-card-val pos-highlight">{selectedTxDetail.pos_program}</span>
                        </div>
                      </div>

                      <div className="mobile-detail-card">
                        <div className="detail-card-icon">
                          <IconBank size={16} />
                        </div>
                        <div className="detail-card-content">
                          <span className="detail-card-label">Metode / Rekening</span>
                          <span className="detail-card-val">{selectedTxDetail.metode}</span>
                        </div>
                      </div>

                      {selectedTxDetail.keterangan && (
                        <div className="mobile-detail-card full-width">
                          <div className="detail-card-icon">
                            <IconFileText size={16} />
                          </div>
                          <div className="detail-card-content">
                            <span className="detail-card-label">Catatan & Keterangan</span>
                            <span className="detail-card-val note-val">"{selectedTxDetail.keterangan}"</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Foto Bukti / Nota Preview */}
                    {selectedTxDetail.bukti_foto && (
                      <div className="mobile-detail-photo-box">
                        <div className="photo-box-header">
                          <IconCamera size={14} />
                          <span>Foto Bukti / Nota Pembayaran</span>
                        </div>
                        <a href={selectedTxDetail.bukti_foto} target="_blank" rel="noopener noreferrer" className="photo-preview-link">
                          <img
                            src={selectedTxDetail.bukti_foto}
                            alt="Bukti Nota"
                            className="photo-preview-img"
                          />
                          <span className="photo-preview-hint">Ketuk untuk memperbesar foto</span>
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="modal-footer-custom mobile-modal-footer">
                    {!isReadOnly ? (
                      <div className="mobile-footer-actions-left">
                        <button
                          type="button"
                          className="btn-primary mobile-act-btn"
                          onClick={() => openEditMobileTx(selectedTxDetail)}
                        >
                          <IconEdit size={15} /> Edit
                        </button>
                        <button
                          type="button"
                          className="btn-danger-sm mobile-act-btn"
                          onClick={() => handleDeleteMobileTx(selectedTxDetail)}
                        >
                          <IconTrash size={15} /> Hapus
                        </button>
                      </div>
                    ) : (
                      <div />
                    )}
                    <button type="button" className="btn-secondary mobile-close-btn" onClick={() => setSelectedTxDetail(null)}>
                      Tutup
                    </button>
                  </div>
                </div>
              </div>,
              document.body
            )}

            {/* MODAL EDIT TRANSAKSI MOBILE (Rendered via React Portal directly on document.body) */}
            {editMobileTx && createPortal(
              <div className="modal-backdrop-custom" onClick={() => setEditMobileTx(null)}>
                <div className="modal-card-custom mobile-edit-modal-box" style={{ maxWidth: "460px", margin: "auto 16px" }} onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header-custom" style={{ padding: "16px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div className="modal-header-icon-circle" style={{ background: "rgba(2, 132, 199, 0.1)", color: "#0284c7" }}>
                        <IconEdit size={20} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: "16.5px", fontWeight: "800", margin: 0, color: "var(--text-main)" }}>
                          Edit Transaksi #{editMobileTx.id}
                        </h3>
                        <p style={{ fontSize: "11.5px", color: "var(--text-muted)", margin: "3px 0 0 0" }}>
                          Sesuaikan rincian donasi, nominal, pos, atau bukti nota
                        </p>
                      </div>
                    </div>
                    <button type="button" className="btn-close-modal" onClick={() => setEditMobileTx(null)} title="Tutup">✕</button>
                  </div>

                  <form onSubmit={handleSaveMobileEdit} style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
                    <div className="modal-body-custom" style={{ padding: "18px 20px", maxHeight: "68vh", overflowY: "auto" }}>
                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 700, fontSize: "12.5px" }}>Tanggal Transaksi</label>
                        <CustomDatePicker
                          value={editMobileTx.tanggal}
                          onChange={(e) => setEditMobileTx({ ...editMobileTx, tanggal: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 700, fontSize: "12.5px" }}>Jenis Transaksi</label>
                        <CustomDropdown
                          value={editMobileTx.jenis}
                          onChange={(e) => setEditMobileTx({ ...editMobileTx, jenis: e.target.value })}
                          options={[
                            { value: "income", label: "Donasi Masuk (Income)" },
                            { value: "expense", label: "Penyaluran / Beban (Expense)" }
                          ]}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 700, fontSize: "12.5px" }}>Pos Program / Alokasi</label>
                        <CustomDropdown
                          value={editMobileTx.category_id}
                          onChange={(e) => setEditMobileTx({ ...editMobileTx, category_id: e.target.value })}
                          options={categories.map((c) => ({
                            value: c.id,
                            label: `[${c.code || "POS"}] ${c.nama_kategori || c.name}`
                          }))}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 700, fontSize: "12.5px" }}>Rekening Kas / Bank</label>
                        <CustomDropdown
                          value={editMobileTx.metode}
                          onChange={(e) => setEditMobileTx({ ...editMobileTx, metode: e.target.value })}
                          options={accounts.map((a) => ({
                            value: a.name,
                            label: a.name
                          }))}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 700, fontSize: "12.5px" }}>
                          {editMobileTx.jenis === "income" ? "Nama Donatur" : "Penerima Dana / Keperluan"}
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Nama donatur atau keperluan..."
                          value={editMobileTx.donatur}
                          onChange={(e) => setEditMobileTx({ ...editMobileTx, donatur: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 700, fontSize: "12.5px" }}>Nominal (Rp)</label>
                        <div className="input-prefix-wrapper">
                          <span className="input-prefix">Rp</span>
                          <input
                            type="number"
                            className="form-control with-prefix"
                            placeholder="500000"
                            value={editMobileTx.nominal}
                            onChange={(e) => setEditMobileTx({ ...editMobileTx, nominal: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 700, fontSize: "12.5px" }}>Keterangan / Catatan</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Catatan transaksi..."
                          value={editMobileTx.keterangan}
                          onChange={(e) => setEditMobileTx({ ...editMobileTx, keterangan: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 700, fontSize: "12.5px" }}>Foto Bukti / Nota</label>
                        <div style={{ background: "rgba(0,0,0,0.02)", border: "1.5px dashed var(--border-color)", padding: "12px", borderRadius: "12px" }}>
                          {editMobileTx.bukti_foto_preview || editMobileTx.bukti_foto_current ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <img
                                src={editMobileTx.bukti_foto_preview || editMobileTx.bukti_foto_current}
                                alt="Preview"
                                style={{ width: "68px", height: "68px", objectFit: "cover", borderRadius: "10px", border: "1px solid var(--border-color)" }}
                              />
                              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <label className="btn-secondary" style={{ cursor: "pointer", fontSize: "12px", padding: "6px 12px", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                                  <IconCamera size={14} /> Ganti Foto
                                  <input type="file" accept="image/*" onChange={handleMobilePhotoEditChange} style={{ display: "none" }} />
                                </label>
                                <span style={{ fontSize: "10.5px", color: "var(--text-muted)" }}>Ukuran file otomatis dioptimasi</span>
                              </div>
                            </div>
                          ) : (
                            <label className="btn-secondary" style={{ cursor: "pointer", fontSize: "12.5px", padding: "8px 14px", display: "inline-flex", alignItems: "center", gap: "6px", width: "100%", justifyContent: "center" }}>
                              <IconCamera size={16} /> Unggah Foto Nota Baru
                              <input type="file" accept="image/*" onChange={handleMobilePhotoEditChange} style={{ display: "none" }} />
                            </label>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="modal-footer-custom" style={{ padding: "14px 20px" }}>
                      <button type="button" className="btn-secondary" onClick={() => setEditMobileTx(null)} disabled={isSavingEdit}>
                        Batal
                      </button>
                      <button type="submit" className="btn-primary" disabled={isSavingEdit} style={{ minWidth: "140px" }}>
                        {isSavingEdit ? "Menyimpan..." : "Simpan Perubahan"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>,
              document.body
            )}
          </div>
        )}

        {/* TAB 5: PUSAT LAPORAN */}
        {activeTab === "laporan" && (
          <div className="gopay-report-container">
            <LaporanCetak
              categories={categories}
              accounts={accounts}
              isReadOnly={isReadOnly}
              isDonatur={isDonatur}
              user={user}
            />
          </div>
        )}
      </main>

      {/* MODERN FLOATING CURVED DOCK BOTTOM BAR (Auto-Hide saat scroll ke bawah, Muncul saat scroll ke atas) */}
      <nav className={`gopay-bottom-dock ${showBars ? "bar-visible" : "bar-hidden"}`}>
        <button
          className={`gopay-dock-item ${activeTab === "home" && !selectedPosDetail ? "active" : ""}`}
          onClick={() => changeTab("home")}
        >
          <div className="dock-icon-wrapper">
            <IconDashboard size={21} />
            <span className="dock-active-pill"></span>
          </div>
          <span className="dock-label">Beranda</span>
        </button>

        <button
          className={`gopay-dock-item ${activeTab === "riwayat" ? "active" : ""}`}
          onClick={() => changeTab("riwayat")}
        >
          <div className="dock-icon-wrapper">
            <IconHistory size={21} />
            <span className="dock-active-pill"></span>
          </div>
          <span className="dock-label">Mutasi</span>
        </button>

        {/* CENTER POP-OUT HERO BUTTON (INFAQ CEPAT) */}
        {canInputMoney ? (
          <button
            className={`gopay-dock-center-btn ${activeTab === "transaksi" ? "active" : ""}`}
            onClick={() => changeTab("transaksi")}
            title="Catat Infaq Uang Cepat"
          >
            <div className="center-btn-inner">
              <IconPlusCircle size={28} color="#ffffff" />
            </div>
            <span className="center-btn-glow"></span>
            <span className="dock-center-label">Infaq Uang</span>
          </button>
        ) : null}

        {canInputBarang && (
          <button
            className={`gopay-dock-item ${activeTab === "barang" ? "active" : ""}`}
            onClick={() => changeTab("barang")}
          >
            <div className="dock-icon-wrapper">
              <IconPackage size={21} />
              <span className="dock-active-pill"></span>
            </div>
            <span className="dock-label">Barang</span>
          </button>
        )}

        <button
          className={`gopay-dock-item ${activeTab === "laporan" ? "active" : ""}`}
          onClick={() => changeTab("laporan")}
        >
          <div className="dock-icon-wrapper">
            <IconFileText size={21} />
            <span className="dock-active-pill"></span>
          </div>
          <span className="dock-label">Laporan</span>
        </button>
      </nav>

      {/* UNIVERSAL CONFIRM MODAL POPUP */}
      <ConfirmModal
        isOpen={Boolean(confirmDialog)}
        onClose={() => setConfirmDialog(null)}
        title={confirmDialog?.title}
        message={confirmDialog?.message}
        confirmText={confirmDialog?.confirmText}
        cancelText={confirmDialog?.cancelText || "Batal"}
        confirmType={confirmDialog?.confirmType || "danger"}
        details={confirmDialog?.details || []}
        onConfirm={confirmDialog?.onConfirm}
      />
    </div>
  );
}
