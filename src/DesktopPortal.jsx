import { useState, useEffect } from "react";
import "./DesktopPortal.css";
import LaporanCetak from "./LaporanCetak";
import { API_BASE, formatRupiah } from "./utils/formatters";

// Layout components
import Sidebar from "./components/layout/Sidebar";
import TopHeader from "./components/layout/TopHeader";

// Dashboard component
import DashboardOverview from "./components/dashboard/DashboardOverview";

// Transactions components
import JurnalTransaksi from "./components/transactions/JurnalTransaksi";
import FormKasBank from "./components/transactions/FormKasBank";
import FormBarangLogistik from "./components/transactions/FormBarangLogistik";
import ImportQris from "./components/transactions/ImportQris";

// Pos internal components
import PosTransaksiKas from "./components/pos/PosTransaksiKas";
import PosHutangPiutang from "./components/pos/PosHutangPiutang";
import PosMaterialLogistik from "./components/pos/PosMaterialLogistik";
import PosNeracaDinamis from "./components/pos/PosNeracaDinamis";

// Report components
import BukuPembantu from "./components/reports/BukuPembantu";
import LaporanNeracaUmum from "./components/reports/LaporanNeracaUmum";

// Master data components
import MasterPosProgram from "./components/master/MasterPosProgram";
import MasterRekening from "./components/master/MasterRekening";
import MasterUsers from "./components/master/MasterUsers";
import MasterDonatur from "./components/master/MasterDonatur";
import DonaturPosView from "./components/donatur/DonaturPosView";
import DonaturDashboard from "./components/dashboard/DonaturDashboard";
import DynamicBackgroundCanvas from "./components/common/DynamicBackgroundCanvas";
import ConfirmModal from "./components/common/ConfirmModal";
import ErrorBoundary from "./components/common/ErrorBoundary";

export default function DesktopPortal({
  user,
  onLogout,
  onSwitchMobile,
  onOpenFontModal,
  theme = "light",
  onToggleTheme,
  bgTheme = "islamic",
  onOpenThemeModal
}) {
  const isPimpinan = user?.role === "pimpinan";
  const isDonatur = user?.role === "donatur";
  const isPetugasLapangan = user?.role === "petugas_lapangan";
  const isPenjab = user?.role === "penjab_pos";
  const isAdmin = user?.role === "admin_keuangan" || (!isPimpinan && !isDonatur && !isPetugasLapangan && !isPenjab);
  const isReadOnly = isPimpinan || isDonatur;
  const canInputMoney = isAdmin || isPetugasLapangan;
  const canInputBarang = isAdmin || isPetugasLapangan;
  const canManageMaster = isAdmin;

  // Default menu: Penjab langsung ke pos_transaksi, Donatur ke donatur_dashboard, lainnya ke dashboard
  const [activeMenu, setActiveMenu] = useState(
    isDonatur ? "donatur_dashboard" : (isPenjab ? "pos_transaksi" : "dashboard")
  );
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Pos Scope Global (Bisa pilih pos tertentu atau semua pos)
  const defaultPosId = user?.assigned_category_id ? String(user.assigned_category_id) : "";
  const [selectedPosScope, setSelectedPosScope] = useState(defaultPosId);

  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [donorsList, setDonorsList] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [barangList, setBarangList] = useState([]);
  const [bukuBantuData, setBukuBantuData] = useState(null);
  const [neracaData, setNeracaData] = useState(null);
  const [usersList, setUsersList] = useState([]);

  // Kas & Transaksi Internal Pos State
  const [posTxList, setPosTxList] = useState([]);
  const [posTxSummary, setPosTxSummary] = useState(null);
  const [posTxFormTgl, setPosTxFormTgl] = useState(new Date().toISOString().split("T")[0]);
  const [posTxFormType, setPosTxFormType] = useState("expense"); // 'income' atau 'expense'
  const [posTxFormCatType, setPosTxFormCatType] = useState("hutang_bayar");
  const [posTxPaymentStatus, setPosTxPaymentStatus] = useState("lunas"); // 'lunas' atau 'hutang'
  const [posTxFormAmount, setPosTxFormAmount] = useState("");
  const [posTxFormParty, setPosTxFormParty] = useState("");
  const [posTxFormDesc, setPosTxFormDesc] = useState("");
  const [posTxMatId, setPosTxMatId] = useState("");
  const [posTxMatName, setPosTxMatName] = useState("");
  const [posTxMatBrand, setPosTxMatBrand] = useState("");
  const [posTxMatUnit, setPosTxMatUnit] = useState("Sak");
  const [posTxMatQty, setPosTxMatQty] = useState("");
  const [posTxMatPrice, setPosTxMatPrice] = useState("");
  const [posTxMsg, setPosTxMsg] = useState(null);

  // Hutang & Piutang State
  const [debtsList, setDebtsList] = useState([]);
  const [debtsRecap, setDebtsRecap] = useState(null);
  const [debtTypeFilter, setDebtTypeFilter] = useState("all"); // 'all' | 'hutang' | 'piutang'
  const [debtFormTgl, setDebtFormTgl] = useState(new Date().toISOString().split("T")[0]);
  const [debtFormCatId, setDebtFormCatId] = useState("");
  const [debtFormType, setDebtFormType] = useState("hutang_pinjam");
  const [debtFormParty, setDebtFormParty] = useState("");
  const [debtFormAmount, setDebtFormAmount] = useState("");
  const [debtFormDesc, setDebtFormDesc] = useState("");
  const [debtMsg, setDebtMsg] = useState(null);

  // Material & Pemakaian Lapangan State
  const [materialsList, setMaterialsList] = useState([]);
  const [materialTxList, setMaterialTxList] = useState([]);
  const [grandStockValue, setGrandStockValue] = useState(0);
  // Form Pemakaian
  const [usageMatId, setUsageMatId] = useState("");
  const [usageDate, setUsageDate] = useState(new Date().toISOString().split("T")[0]);
  const [usageQty, setUsageQty] = useState("");
  const [usagePurpose, setUsagePurpose] = useState("");
  const [usageMsg, setUsageMsg] = useState(null);
  // Form Tambah Katalog Material
  const [newMatCode, setNewMatCode] = useState("");
  const [newMatName, setNewMatName] = useState("");
  const [newMatUnit, setNewMatUnit] = useState("Sak");
  const [newMatPrice, setNewMatPrice] = useState("");
  const [newMatStock, setNewMatStock] = useState("");
  const [showAddMatModal, setShowAddMatModal] = useState(false);
  // Form Beli / Donasi Masuk Material
  const [buyMatId, setBuyMatId] = useState("");
  const [buyDate, setBuyDate] = useState(new Date().toISOString().split("T")[0]);
  const [buyQty, setBuyQty] = useState("");
  const [buySupplier, setBuySupplier] = useState("");
  const [showBuyMatModal, setShowBuyMatModal] = useState(false);

  // Neraca Dinamis Pos State
  const [neracaPosData, setNeracaPosData] = useState(null);
  const [showAddBalanceModal, setShowAddBalanceModal] = useState(false);
  const [editCustomItem, setEditCustomItem] = useState(null); // Item yang sedang diedit
  const [customItemSide, setCustomItemSide] = useState("aktiva");
  const [customItemSubCat, setCustomItemSubCat] = useState("harta_lancar");
  const [customItemCode, setCustomItemCode] = useState("");
  const [customItemName, setCustomItemName] = useState("");
  const [customItemAmountPrev, setCustomItemAmountPrev] = useState("");
  const [customItemAmountCurr, setCustomItemAmountCurr] = useState("");
  const [neracaPosMsg, setNeracaPosMsg] = useState(null);

  // Filters Jurnal
  const [searchFilter, setSearchFilter] = useState("");
  const [posFilter, setPosFilter] = useState("");
  const [jenisFilter, setJenisFilter] = useState("");

  // Form Transaksi Kas & Bank
  const [tglTx, setTglTx] = useState(new Date().toISOString().split("T")[0]);
  const [jenisTx, setJenisTx] = useState("income");
  const [metodeTx, setMetodeTx] = useState("");
  const [kategoriTx, setKategoriTx] = useState("");
  const [donaturTx, setDonaturTx] = useState("");
  const [nominalTx, setNominalTx] = useState("");
  const [ketTx, setKetTx] = useState("");
  const [fotoTx, setFotoTx] = useState(null);
  const [txMessage, setTxMessage] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);

  // Form Barang
  const [tglBarang, setTglBarang] = useState(new Date().toISOString().split("T")[0]);
  const [donaturBarang, setDonaturBarang] = useState("");
  const [posBarang, setPosBarang] = useState("");
  const [katBarang, setKatBarang] = useState("Material Bangunan");
  const [namaBarang, setNamaBarang] = useState("");
  const [jumlahBarang, setJumlahBarang] = useState("");
  const [satuanBarang, setSatuanBarang] = useState("Sak");
  const [ketBarang, setKetBarang] = useState("");
  const [fotoBarang, setFotoBarang] = useState(null);
  const [barangMessage, setBarangMessage] = useState(null);

  // Import QRIS
  const [fileQris, setFileQris] = useState(null);
  const [qrisMessage, setQrisMessage] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

  // CRUD Data Master
  const [newCatCode, setNewCatCode] = useState("");
  const [newCatName, setNewCatName] = useState("");
  const [newCatDigit, setNewCatDigit] = useState("");
  const [newCatType, setNewCatType] = useState("proyek_pembangunan");
  const [newCatPic, setNewCatPic] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");

  const [newAccCode, setNewAccCode] = useState("");
  const [newAccName, setNewAccName] = useState("");
  const [newAccBalance, setNewAccBalance] = useState("");

  const [newDonorName, setNewDonorName] = useState("");
  const [newDonorPhone, setNewDonorPhone] = useState("");
  const [newDonorAddress, setNewDonorAddress] = useState("");
  const [donorSearch, setDonorSearch] = useState("");
  const [donorPosFilter, setDonorPosFilter] = useState("");
  const [donorStartDate, setDonorStartDate] = useState("");
  const [donorEndDate, setDonorEndDate] = useState("");

  // Master Users State
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState("penjab_pos");
  const [newUserCatId, setNewUserCatId] = useState("");
  const [newUserCatIds, setNewUserCatIds] = useState([]); // Multiple category IDs
  const [newUserAccessLevel, setNewUserAccessLevel] = useState("full"); // full | view_edit | add_only | read_only
  const [editUserItem, setEditUserItem] = useState(null);

  // Modal Edit States
  const [editCatItem, setEditCatItem] = useState(null);
  const [editAccItem, setEditAccItem] = useState(null);
  const [editDonorItem, setEditDonorItem] = useState(null);
  const [editTxItem, setEditTxItem] = useState(null);
  const [masterMsg, setMasterMsg] = useState(null);
  const [neracaNotice, setNeracaNotice] = useState(null);
  const [recalculatingKas, setRecalculatingKas] = useState(false);

  // Line Chart State (monthly | yearly)
  const [chartTimeFrame, setChartTimeFrame] = useState("monthly");
  const [activeChartMetric, setActiveChartMetric] = useState("income"); // "income" | "expense" | "net"

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (selectedPosScope) {
      fetchPosTransactions(selectedPosScope);
      fetchDebts(selectedPosScope);
      fetchMaterials(selectedPosScope);
      fetchNeracaPos(selectedPosScope);
    }
  }, [selectedPosScope]);

  const fetchAll = () => {
    fetchStats();
    fetchCategories();
    fetchAccounts();
    fetchTransactions();
    fetchBarang();
    fetchDonors();
    fetchBukuBantu();
    fetchNeraca();
    fetchUsers();
    const activePos = selectedPosScope || (categories.length > 0 ? categories[0].id : null);
    if (activePos) {
      fetchPosTransactions(activePos);
      fetchDebts(activePos);
      fetchMaterials(activePos);
      fetchNeracaPos(activePos);
    }
  };

  const fetchStats = () => fetch(`${API_BASE}/dashboard/stats`).then(r => r.json()).then(setStats);
  const fetchCategories = () => fetch(`${API_BASE}/categories`).then(r => r.json()).then(data => {
    setCategories(data);
    const act = data.filter(c => c.is_active);
    if (act.length > 0) {
      if (!kategoriTx) setKategoriTx(act[0].id);
      if (!posBarang) setPosBarang(act[0].id);
      if (!selectedPosScope && !user?.assigned_category_id) setSelectedPosScope(String(act[0].id));
      if (!debtFormCatId) setDebtFormCatId(act[0].id);
    }
  });
  const fetchAccounts = () => fetch(`${API_BASE}/accounts`).then(r => r.json()).then(data => {
    setAccounts(data);
    if (data.length > 0 && !metodeTx) setMetodeTx(data[0].id);
  });
  const fetchTransactions = () => fetch(`${API_BASE}/transactions?limit=500`).then(r => r.json()).then(setAllTransactions);
  const fetchBarang = () => fetch(`${API_BASE}/donation-items`).then(r => r.json()).then(setBarangList);
  const fetchDonors = (search = donorSearch, start = donorStartDate, end = donorEndDate, pos = donorPosFilter) => {
    let url = `${API_BASE}/donors?`;
    const params = [];
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (start) params.push(`start_date=${encodeURIComponent(start)}`);
    if (end) params.push(`end_date=${encodeURIComponent(end)}`);
    if (pos) params.push(`pos=${encodeURIComponent(pos)}`);
    url += params.join("&");
    fetch(url).then(r => r.json()).then(setDonorsList);
  };
  const fetchBukuBantu = () => fetch(`${API_BASE}/reports/buku-bantu`).then(r => r.json()).then(setBukuBantuData);
  const fetchNeraca = () => {
    fetch(`${API_BASE}/reports/neraca`)
      .then(async (r) => {
        if (!r.ok) return null;
        try { return await r.json(); } catch { return null; }
      })
      .then((data) => {
        if (data) setNeracaData(data);
      })
      .catch((err) => console.error("fetchNeraca error:", err));
  };
  const fetchUsers = () => fetch(`${API_BASE}/users`).then(r => r.json()).then(setUsersList);

  // Fetch Debts
  const fetchDebts = (catId = selectedPosScope) => {
    let url = `${API_BASE}/debts?`;
    if (catId) url += `category_id=${catId}&`;
    fetch(url).then(r => r.json()).then(setDebtsList);

    let urlRecap = `${API_BASE}/debts/recap?`;
    if (catId) urlRecap += `category_id=${catId}`;
    fetch(urlRecap).then(r => r.json()).then(setDebtsRecap);
  };

  // Fetch Materials
  const fetchMaterials = (catId = selectedPosScope) => {
    let url = `${API_BASE}/materials?`;
    if (catId) url += `category_id=${catId}`;
    fetch(url).then(r => r.json()).then(data => {
      setMaterialsList(data.materials || []);
      setGrandStockValue(data.grand_total_value || 0);
      if (data.materials && data.materials.length > 0) {
        if (!usageMatId) setUsageMatId(data.materials[0].id);
        if (!buyMatId) setBuyMatId(data.materials[0].id);
      }
    });

    let urlTx = `${API_BASE}/materials/transactions?`;
    if (catId) urlTx += `category_id=${catId}`;
    fetch(urlTx).then(r => r.json()).then(setMaterialTxList);
  };

  // Fetch Kas & Transaksi Pos
  const fetchPosTransactions = (catId = selectedPosScope) => {
    if (!catId) return;
    fetch(`${API_BASE}/pos-transactions?category_id=${catId}`)
      .then(r => r.json())
      .then(data => {
        setPosTxList(data.transactions || []);
        setPosTxSummary(data.summary || null);
      });
  };

  // Fetch Neraca Pos
  const fetchNeracaPos = (catId = selectedPosScope) => {
    if (!catId) return;
    fetch(`${API_BASE}/reports/neraca-pos/${catId}`).then(r => r.json()).then(setNeracaPosData);
  };

  // ==========================================
  // HANDLERS TRANSAKSI INTERNAL POS
  // ==========================================
  const handleSimpanPosTx = (e) => {
    e.preventDefault();
    setPosTxMsg(null);
    if (!selectedPosScope) {
      setPosTxMsg({ type: "danger", text: "Pilih pos program terlebih dahulu" });
      return;
    }

    // Tentukan type arus kas berdasarkan kategori
    let calculatedType = posTxFormType;
    if (posTxFormCatType === "hutang_pinjam" || posTxFormCatType === "piutang_bayar" || posTxFormCatType === "alokasi_pusat" || posTxFormCatType === "pendapatan_pos_langsung") {
      calculatedType = "income";
    } else if (posTxFormCatType === "hutang_bayar" || posTxFormCatType === "piutang_pinjam" || posTxFormCatType === "belanja_material" || posTxFormCatType === "upah_tukang" || posTxFormCatType === "konsumsi_lapangan" || posTxFormCatType === "operasional_lapangan" || posTxMatName || posTxMatId) {
      calculatedType = "expense";
    }

    let finalDesc = posTxFormDesc;
    if (!finalDesc && (posTxMatName || posTxMatId)) {
      const brandStr = posTxMatBrand ? ` ${posTxMatBrand}` : "";
      const qtyStr = posTxMatQty ? ` ${posTxMatQty} ${posTxMatUnit || ""}` : "";
      finalDesc = `Beli ${posTxMatName || "Material"}${brandStr}${qtyStr}`.trim();
    }

    const finalAmount = parseFloat(posTxFormAmount || 0);

    fetch(`${API_BASE}/pos-transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category_id: parseInt(selectedPosScope),
        transaction_date: posTxFormTgl,
        type: calculatedType,
        category_tx_type: posTxFormCatType,
        payment_status: posTxPaymentStatus,
        amount: finalAmount,
        recipient_or_sender: posTxFormParty,
        description: finalDesc,
        material_id: posTxMatId ? parseInt(posTxMatId) : null,
        material_name: posTxMatName || null,
        material_brand: posTxMatBrand || null,
        material_quantity: (posTxMatId || posTxMatName) && posTxMatQty ? parseFloat(posTxMatQty) : null,
        material_unit: posTxMatUnit || null,
        material_price: posTxMatPrice ? parseFloat(posTxMatPrice) : null
      })
    })
      .then(r => r.json())
      .then(data => {
        if (data.id) {
          setPosTxMsg({ type: "success", text: data.message });
          setPosTxPaymentStatus("lunas");
          setPosTxFormAmount("");
          setPosTxFormParty("");
          setPosTxFormDesc("");
          setPosTxMatId("");
          setPosTxMatName("");
          setPosTxMatBrand("");
          setPosTxMatQty("");
          setPosTxMatPrice("");
          fetchPosTransactions(selectedPosScope);
          fetchDebts(selectedPosScope);
          fetchMaterials(selectedPosScope);
          fetchNeracaPos(selectedPosScope);
        } else {
          setPosTxMsg({ type: "danger", text: data.detail || "Gagal menyimpan transaksi pos" });
        }
      });
  };

  const handleHapusPosTx = (item) => {
    setConfirmDialog({
      title: "Hapus Transaksi Pos",
      message: "Apakah Anda yakin ingin menghapus pencatatan transaksi kas pos ini?",
      confirmText: "Hapus Transaksi",
      confirmType: "danger",
      details: [
        { label: "Keterangan", value: item.description },
        { label: "Nominal", value: formatRupiah(item.amount), isHighlight: true },
        { label: "Tanggal", value: item.transaction_date }
      ],
      onConfirm: async () => {
        try {
          await fetch(`${API_BASE}/pos-transactions/${item.id}`, { method: "DELETE" });
          fetchPosTransactions(selectedPosScope);
          fetchDebts(selectedPosScope);
          fetchMaterials(selectedPosScope);
          fetchNeracaPos(selectedPosScope);
        } finally {
          setConfirmDialog(null);
        }
      }
    });
  };

  const handleBulkDeletePosTransactions = async (ids) => {
    if (!ids || ids.length === 0) return false;
    try {
      const res = await fetch(`${API_BASE}/pos-transactions/bulk-delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (res.status === 404 || res.status === 405) {
        const results = await Promise.all(
          ids.map(id => fetch(`${API_BASE}/pos-transactions/${id}`, { method: "DELETE" }))
        );
        if (results.every(r => r.ok)) {
          fetchPosTransactions(selectedPosScope);
          fetchDebts(selectedPosScope);
          fetchMaterials(selectedPosScope);
          fetchNeracaPos(selectedPosScope);
          return true;
        }
      }
      const data = await res.json();
      if (res.ok) {
        fetchPosTransactions(selectedPosScope);
        fetchDebts(selectedPosScope);
        fetchMaterials(selectedPosScope);
        fetchNeracaPos(selectedPosScope);
        return true;
      } else {
        alert(data.message || data.detail || "Gagal menghapus transaksi pos");
        return false;
      }
    } catch (err) {
      alert("Terjadi kesalahan saat menghapus transaksi pos");
      return false;
    }
  };

  // ==========================================
  // HANDLERS TRANSAKSI & OPERASIONAL
  // ==========================================
  const handleSimpanTx = (e) => {
    e.preventDefault();
    setTxMessage(null);
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
          setTxMessage({ type: "success", text: "Transaksi kas & bank berhasil disimpan!" });
          setNominalTx("");
          setDonaturTx("");
          setKetTx("");
          setFotoTx(null);
          fetchAll();
        } else {
          setTxMessage({ type: "danger", text: data.detail || "Gagal menyimpan" });
        }
      });
  };

  const handleSimpanBarang = (e) => {
    e.preventDefault();
    setBarangMessage(null);
    const fd = new FormData();
    fd.append("tanggal", tglBarang);
    fd.append("nama_donatur", donaturBarang);
    if (posBarang) fd.append("category_id", posBarang);
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
          setBarangMessage({ type: "success", text: "Donasi barang berhasil dicatat!" });
          setDonaturBarang("");
          setNamaBarang("");
          setJumlahBarang("");
          setKetBarang("");
          setFotoBarang(null);
          fetchBarang();
          fetchStats();
        }
      });
  };

  const handleHapusBarang = (item) => {
    setConfirmDialog({
      title: "Hapus Donasi Barang",
      message: "Apakah Anda yakin ingin menghapus pencatatan donasi barang/natura ini?",
      confirmText: "Hapus Barang",
      confirmType: "danger",
      details: [
        { label: "Donatur", value: item.nama_donatur },
        { label: "Barang", value: `${item.nama_barang} (${item.jumlah} ${item.satuan})`, isHighlight: true },
        { label: "Tanggal", value: item.tanggal }
      ],
      onConfirm: async () => {
        try {
          await fetch(`${API_BASE}/donation-items/${item.id}`, { method: "DELETE" });
          fetchBarang();
        } finally {
          setConfirmDialog(null);
        }
      }
    });
  };

  const handleBulkDeleteBarang = async (ids) => {
    if (!ids || ids.length === 0) return false;
    try {
      const res = await fetch(`${API_BASE}/donation-items/bulk-delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (res.status === 404 || res.status === 405) {
        const results = await Promise.all(
          ids.map(id => fetch(`${API_BASE}/donation-items/${id}`, { method: "DELETE" }))
        );
        if (results.every(r => r.ok)) {
          fetchBarang();
          return true;
        }
      }
      const data = await res.json();
      if (res.ok) {
        fetchBarang();
        return true;
      } else {
        alert(data.message || data.detail || "Gagal menghapus donasi barang");
        return false;
      }
    } catch (err) {
      alert("Terjadi kesalahan saat menghapus donasi barang");
      return false;
    }
  };

  const handleUpdateTransaction = async (e, editData) => {
    e.preventDefault();
    if (!editData || !editData.id) return;
    const fd = new FormData();
    fd.append("tanggal", editData.tanggal);
    fd.append("jenis", editData.jenis);
    fd.append("metode", editData.metode || editData.account_id || "");
    fd.append("category_id", editData.category_id);
    fd.append("nominal", editData.nominal);
    fd.append("nama_donatur", editData.donatur || "");
    fd.append("keterangan", editData.keterangan || "");
    if (editData.bukti_foto_file) {
      fd.append("bukti_foto", editData.bukti_foto_file);
    }

    try {
      const res = await fetch(`${API_BASE}/transactions/${editData.id}`, {
        method: "PUT",
        body: fd
      });
      const data = await res.json();
      if (res.ok) {
        setEditTxItem(null);
        fetchTransactions();
        fetchStats();
        fetchAccounts();
        if (selectedPosScope) fetchPosTransactions(selectedPosScope);
      } else {
        alert(data.detail || "Gagal memperbarui transaksi");
      }
    } catch (err) {
      alert("Terjadi kesalahan saat memperbarui transaksi");
    }
  };

  const handleDeleteTransaction = async (tx) => {
    if (!tx || !tx.id) return;
    try {
      const res = await fetch(`${API_BASE}/transactions/${tx.id}`, {
        method: "DELETE",
        headers: { "Accept": "application/json" }
      });
      let data;
      try {
        data = await res.json();
      } catch {
        data = { message: `HTTP ${res.status}: ${res.statusText || "Gagal"}` };
      }
      if (res.ok) {
        fetchTransactions();
        fetchStats();
        fetchAccounts();
        if (selectedPosScope) fetchPosTransactions(selectedPosScope);
        return true;
      } else {
        alert(data.message || data.detail || `Gagal menghapus transaksi (Status ${res.status})`);
        return false;
      }
    } catch (err) {
      alert(`Terjadi kesalahan saat menghapus transaksi: ${err?.message || err}`);
      return false;
    }
  };

  const handleBulkDeleteTransactions = async (ids) => {
    if (!ids || ids.length === 0) return false;
    try {
      const res = await fetch(`${API_BASE}/transactions/bulk-delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ ids }),
      });

      if (res.ok) {
        fetchTransactions();
        fetchStats();
        fetchAccounts();
        if (selectedPosScope) fetchPosTransactions(selectedPosScope);
        return true;
      }

      // Fallback otomatis jika endpoint bulk-delete belum ter-deploy di server backend
      if (res.status === 404 || res.status === 405) {
        let anySuccess = false;
        const deleteErrors = [];
        for (const id of ids) {
          try {
            const delRes = await fetch(`${API_BASE}/transactions/${id}`, {
              method: "DELETE",
              headers: { "Accept": "application/json" }
            });
            if (delRes.ok) {
              anySuccess = true;
            } else {
              let errData;
              try { errData = await delRes.json(); } catch { errData = {}; }
              deleteErrors.push(`ID ${id}: ${errData.message || errData.detail || "HTTP " + delRes.status}`);
            }
          } catch (e) {
            deleteErrors.push(`ID ${id}: ${e.message}`);
          }
        }

        if (anySuccess) {
          fetchTransactions();
          fetchStats();
          fetchAccounts();
          if (selectedPosScope) fetchPosTransactions(selectedPosScope);
        }

        if (deleteErrors.length > 0) {
          alert(`Sebagian transaksi tidak dapat dihapus:\n${deleteErrors.slice(0, 3).join("\n")}`);
          return anySuccess;
        }
        return true;
      }

      let data;
      try {
        data = await res.json();
      } catch {
        data = { message: `HTTP ${res.status}: ${res.statusText || "Gagal"}` };
      }
      alert(data.message || data.detail || `Gagal menghapus transaksi (Status ${res.status})`);
      return false;
    } catch (err) {
      alert(`Terjadi kesalahan saat menghapus transaksi: ${err?.message || err}`);
      return false;
    }
  };

  const handleUploadQris = (e) => {
    e.preventDefault();
    if (!fileQris) return;
    setIsImporting(true);
    setQrisMessage(null);
    const fd = new FormData();
    fd.append("file", fileQris);

    fetch(`${API_BASE}/transactions/import-qris`, { method: "POST", body: fd })
      .then(r => r.json())
      .then(data => {
        setIsImporting(false);
        if (data.status === "success") {
          setQrisMessage({ type: "success", text: data.message });
          setFileQris(null);
          fetchAll();
        } else {
          setQrisMessage({ type: "danger", text: data.detail || "Gagal import" });
        }
      })
      .catch(() => {
        setIsImporting(false);
        setQrisMessage({ type: "danger", text: "Terjadi kesalahan upload" });
      });
  };

  // ==========================================
  // HANDLERS HUTANG & PIUTANG
  // ==========================================
  const handleSimpanDebt = (e) => {
    e.preventDefault();
    setDebtMsg(null);
    const catId = debtFormCatId || selectedPosScope;
    if (!catId) {
      setDebtMsg({ type: "danger", text: "Pilih pos program terlebih dahulu" });
      return;
    }
    fetch(`${API_BASE}/debts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category_id: parseInt(catId),
        transaction_date: debtFormTgl,
        type: debtFormType,
        party_name: debtFormParty,
        amount: parseFloat(debtFormAmount),
        description: debtFormDesc
      })
    })
      .then(r => r.json())
      .then(data => {
        if (data.id) {
          setDebtMsg({ type: "success", text: data.message });
          setDebtFormParty("");
          setDebtFormAmount("");
          setDebtFormDesc("");
          fetchDebts(catId);
          fetchNeracaPos(catId);
          fetchPosTransactions(catId);
        } else {
          setDebtMsg({ type: "danger", text: data.detail || "Gagal menyimpan" });
        }
      });
  };

  const handleHapusDebt = (item) => {
    setConfirmDialog({
      title: "Hapus Hutang / Piutang",
      message: "Apakah Anda yakin ingin menghapus pencatatan hutang/piutang ini?",
      confirmText: "Hapus Data",
      confirmType: "danger",
      details: [
        { label: "Pihak", value: item.party_name },
        { label: "Jenis", value: item.type === "hutang" ? "Hutang Pos" : "Piutang Pos" },
        { label: "Nominal", value: formatRupiah(item.amount), isHighlight: true }
      ],
      onConfirm: async () => {
        try {
          await fetch(`${API_BASE}/debts/${item.id}`, { method: "DELETE" });
          fetchDebts(selectedPosScope);
          fetchNeracaPos(selectedPosScope);
          fetchPosTransactions(selectedPosScope);
        } finally {
          setConfirmDialog(null);
        }
      }
    });
  };

  const handleBulkDeleteDebts = async (ids) => {
    if (!ids || ids.length === 0) return false;
    try {
      const res = await fetch(`${API_BASE}/debts/bulk-delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (res.status === 404 || res.status === 405) {
        const results = await Promise.all(
          ids.map(id => fetch(`${API_BASE}/debts/${id}`, { method: "DELETE" }))
        );
        if (results.every(r => r.ok)) {
          fetchDebts(selectedPosScope);
          fetchNeracaPos(selectedPosScope);
          fetchPosTransactions(selectedPosScope);
          return true;
        }
      }
      const data = await res.json();
      if (res.ok) {
        fetchDebts(selectedPosScope);
        fetchNeracaPos(selectedPosScope);
        fetchPosTransactions(selectedPosScope);
        return true;
      } else {
        alert(data.message || data.detail || "Gagal menghapus hutang/piutang");
        return false;
      }
    } catch (err) {
      alert("Terjadi kesalahan saat menghapus hutang/piutang");
      return false;
    }
  };

  // ==========================================
  // HANDLERS MATERIAL & PEMAKAIAN LAPANGAN
  // ==========================================
  const handleCatatPemakaianMaterial = (e) => {
    e.preventDefault();
    setUsageMsg(null);
    if (!usageMatId) {
      setUsageMsg({ type: "danger", text: "Pilih material terlebih dahulu" });
      return;
    }
    fetch(`${API_BASE}/materials/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        material_id: parseInt(usageMatId),
        category_id: parseInt(selectedPosScope),
        transaction_date: usageDate,
        type: "keluar",
        quantity: parseFloat(usageQty),
        usage_for: usagePurpose
      })
    })
      .then(r => r.json())
      .then(data => {
        if (data.id) {
          setUsageMsg({ type: "success", text: data.message });
          setUsageQty("");
          setUsagePurpose("");
          fetchMaterials(selectedPosScope);
          fetchNeracaPos(selectedPosScope);
        } else {
          setUsageMsg({ type: "danger", text: data.detail || "Gagal mencatat pemakaian" });
        }
      });
  };

  const handleTambahMaterialItem = (e) => {
    e.preventDefault();
    fetch(`${API_BASE}/materials`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category_id: parseInt(selectedPosScope),
        code: newMatCode,
        name: newMatName,
        unit: newMatUnit,
        unit_price: parseFloat(newMatPrice || 0),
        initial_stock: parseFloat(newMatStock || 0)
      })
    })
      .then(r => r.json())
      .then(data => {
        if (data.id) {
          setShowAddMatModal(false);
          setNewMatCode("");
          setNewMatName("");
          setNewMatPrice("");
          setNewMatStock("");
          fetchMaterials(selectedPosScope);
          fetchNeracaPos(selectedPosScope);
        } else {
          alert(data.detail || "Gagal menambah material");
        }
      });
  };

  const handleTambahBeliMaterial = (e) => {
    e.preventDefault();
    fetch(`${API_BASE}/materials/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        material_id: parseInt(buyMatId),
        category_id: parseInt(selectedPosScope),
        transaction_date: buyDate,
        type: "masuk",
        quantity: parseFloat(buyQty),
        supplier_or_source: buySupplier
      })
    })
      .then(r => r.json())
      .then(data => {
        if (data.id) {
          setShowBuyMatModal(false);
          setBuyQty("");
          setBuySupplier("");
          fetchMaterials(selectedPosScope);
          fetchNeracaPos(selectedPosScope);
        } else {
          alert(data.detail || "Gagal mencatat penerimaan");
        }
      });
  };

  const handleHapusMaterialTx = (item) => {
    setConfirmDialog({
      title: "Batalkan Log Material",
      message: "Apakah Anda yakin ingin membatalkan transaksi log keluar-masuk material ini?",
      confirmText: "Batalkan Log",
      confirmType: "danger",
      details: [
        { label: "Material", value: item.material_name },
        { label: "Jumlah", value: `${item.quantity} ${item.unit}`, isHighlight: true },
        { label: "Tipe", value: item.type === "keluar" ? "Pemakaian Lapangan" : "Penerimaan / Beli" }
      ],
      onConfirm: async () => {
        try {
          await fetch(`${API_BASE}/materials/transactions/${item.id}`, { method: "DELETE" });
          fetchMaterials(selectedPosScope);
          fetchNeracaPos(selectedPosScope);
        } finally {
          setConfirmDialog(null);
        }
      }
    });
  };

  const handleBulkDeleteMaterialTx = async (ids) => {
    if (!ids || ids.length === 0) return false;
    try {
      const res = await fetch(`${API_BASE}/materials/transactions/bulk-delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (res.status === 404 || res.status === 405) {
        const results = await Promise.all(
          ids.map(id => fetch(`${API_BASE}/materials/transactions/${id}`, { method: "DELETE" }))
        );
        if (results.every(r => r.ok)) {
          fetchMaterials(selectedPosScope);
          fetchNeracaPos(selectedPosScope);
          return true;
        }
      }
      const data = await res.json();
      if (res.ok) {
        fetchMaterials(selectedPosScope);
        fetchNeracaPos(selectedPosScope);
        return true;
      } else {
        alert(data.message || data.detail || "Gagal menghapus log material");
        return false;
      }
    } catch (err) {
      alert("Terjadi kesalahan saat menghapus log material");
      return false;
    }
  };

  // ==========================================
  // HANDLERS NERACA DINAMIS & MANUAL (CRUD)
  // ==========================================
  const handleOpenAddBalanceModal = () => {
    setEditCustomItem(null);
    setCustomItemSide("aktiva");
    setCustomItemSubCat("harta_lancar");
    setCustomItemCode("");
    setCustomItemName("");
    setCustomItemAmountPrev("");
    setCustomItemAmountCurr("");
    setShowAddBalanceModal(true);
  };

  const handleOpenEditBalanceModal = (item) => {
    setEditCustomItem(item);
    setCustomItemSide(item.side || "aktiva");
    setCustomItemSubCat(item.sub_category || "harta_lancar");
    setCustomItemCode(item.code || "");
    setCustomItemName(item.name || "");
    setCustomItemAmountPrev(item.amount_prev_month != null ? String(item.amount_prev_month) : "");
    setCustomItemAmountCurr(item.amount_current_month != null ? String(item.amount_current_month) : "");
    setShowAddBalanceModal(true);
  };

  const handleTambahCustomBalanceItem = (e) => {
    e.preventDefault();
    setNeracaPosMsg(null);
    const prev = parseFloat(customItemAmountPrev || 0);
    const curr = parseFloat(customItemAmountCurr || 0);
    const total = prev + curr;

    if (editCustomItem) {
      // UPDATE / EDIT
      fetch(`${API_BASE}/reports/neraca-pos/items/${editCustomItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category_id: parseInt(selectedPosScope),
          side: customItemSide,
          sub_category: customItemSubCat,
          code: customItemCode || "-",
          name: customItemName,
          amount_prev_month: prev,
          amount_current_month: curr,
          amount_total: total
        })
      })
        .then(r => r.json())
        .then(data => {
          if (data.id) {
            setShowAddBalanceModal(false);
            setEditCustomItem(null);
            fetchNeracaPos(selectedPosScope);
          } else {
            alert(data.detail || "Gagal mengubah baris neraca");
          }
        });
    } else {
      // CREATE / TAMBAH BARU
      fetch(`${API_BASE}/reports/neraca-pos/${selectedPosScope}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category_id: parseInt(selectedPosScope),
          side: customItemSide,
          sub_category: customItemSubCat,
          code: customItemCode || "-",
          name: customItemName,
          amount_prev_month: prev,
          amount_current_month: curr,
          amount_total: total
        })
      })
        .then(r => r.json())
        .then(data => {
          if (data.id) {
            setShowAddBalanceModal(false);
            setCustomItemCode("");
            setCustomItemName("");
            setCustomItemAmountPrev("");
            setCustomItemAmountCurr("");
            fetchNeracaPos(selectedPosScope);
          } else {
            alert(data.detail || "Gagal menambah baris");
          }
        });
    }
  };

  const handleHapusCustomBalanceItem = (item) => {
    setConfirmDialog({
      title: "Hapus Baris Neraca",
      message: "Apakah Anda yakin ingin menghapus baris penyesuaian neraca ini?",
      confirmText: "Hapus Baris",
      confirmType: "danger",
      details: [
        { label: "Nama Baris", value: item.name },
        { label: "Kategori", value: item.side === "aktiva" ? "Aktiva (Harta)" : "Pasiva (Kewajiban/Ekuitas)" },
        { label: "Total Saldo", value: formatRupiah(item.amount_total), isHighlight: true }
      ],
      onConfirm: async () => {
        try {
          await fetch(`${API_BASE}/reports/neraca-pos/items/${item.id}`, { method: "DELETE" });
          fetchNeracaPos(selectedPosScope);
        } finally {
          setConfirmDialog(null);
        }
      }
    });
  };

  // ==========================================
  // HANDLERS MASTER DATA (POS, REKENING, USER, DONATUR)
  // ==========================================
  const handleTambahPos = (e) => {
    e.preventDefault();
    setMasterMsg(null);
    fetch(`${API_BASE}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: newCatCode,
        name: newCatName,
        qris_unit_digit: newCatDigit,
        category_type: newCatType,
        pic_name: newCatPic,
        description: newCatDesc
      }),
    }).then(r => r.json()).then(data => {
      if (data.id) {
        setMasterMsg({ type: "success", text: data.message });
        setNewCatCode(""); setNewCatName(""); setNewCatDigit(""); setNewCatPic(""); setNewCatDesc("");
        fetchCategories(); fetchStats();
      } else {
        setMasterMsg({ type: "danger", text: data.detail || "Gagal" });
      }
    });
  };

  const handleUpdatePos = (e) => {
    e.preventDefault();
    if (!editCatItem) return;
    setMasterMsg(null);
    fetch(`${API_BASE}/categories/${editCatItem.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editCatItem.name,
        qris_unit_digit: editCatItem.qris_digit || null,
        category_type: editCatItem.category_type || "proyek_pembangunan",
        pic_name: editCatItem.pic_name,
        description: editCatItem.description,
        is_active: editCatItem.is_active
      }),
    }).then(r => r.json()).then(data => {
      setMasterMsg({ type: "success", text: data.message || "Pos program berhasil diperbarui" });
      setEditCatItem(null);
      fetchCategories(); fetchStats();
    });
  };

  const handleDeletePos = (cat) => {
    setConfirmDialog({
      title: "Nonaktifkan Pos Program",
      message: "Apakah Anda yakin ingin menonaktifkan pos program ini dari sistem?",
      confirmText: "Nonaktifkan Pos",
      confirmType: "warning",
      details: [
        { label: "Kode Pos", value: cat.code },
        { label: "Nama Pos", value: cat.name, isHighlight: true },
        { label: "Penanggung Jawab", value: cat.pic_name || "-" }
      ],
      onConfirm: async () => {
        try {
          setMasterMsg(null);
          const r = await fetch(`${API_BASE}/categories/${cat.id}`, { method: "DELETE" });
          const data = await r.json();
          setMasterMsg({ type: "success", text: data.message || "Pos dinonaktifkan" });
          fetchCategories();
          fetchStats();
        } finally {
          setConfirmDialog(null);
        }
      }
    });
  };

  const handleBulkDeletePos = async (ids) => {
    if (!ids || ids.length === 0) return false;
    try {
      const res = await fetch(`${API_BASE}/categories/bulk-delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (res.status === 404 || res.status === 405) {
        const results = await Promise.all(
          ids.map(id => fetch(`${API_BASE}/categories/${id}`, { method: "DELETE" }))
        );
        if (results.every(r => r.ok)) {
          setMasterMsg({ type: "success", text: "Pos program berhasil dihapus" });
          fetchCategories();
          fetchStats();
          return true;
        }
      }
      const data = await res.json();
      if (res.ok) {
        setMasterMsg({ type: "success", text: data.message || "Pos program berhasil dihapus" });
        fetchCategories();
        fetchStats();
        return true;
      } else {
        setMasterMsg({ type: "danger", text: data.message || data.detail || "Gagal menghapus pos program" });
        return false;
      }
    } catch (err) {
      alert("Terjadi kesalahan saat menghapus pos program");
      return false;
    }
  };

  const handleTambahRekening = (e) => {
    e.preventDefault();
    setMasterMsg(null);
    fetch(`${API_BASE}/accounts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: newAccCode, name: newAccName, initial_balance: parseFloat(newAccBalance || 0) }),
    }).then(r => r.json()).then(data => {
      if (data.id) {
        setMasterMsg({ type: "success", text: data.message });
        setNewAccCode(""); setNewAccName(""); setNewAccBalance("");
        fetchAccounts(); fetchStats();
      } else {
        setMasterMsg({ type: "danger", text: data.detail || "Gagal" });
      }
    });
  };

  const handleUpdateRekening = (e) => {
    e.preventDefault();
    if (!editAccItem) return;
    setMasterMsg(null);
    fetch(`${API_BASE}/accounts/${editAccItem.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editAccItem.name,
        initial_balance: parseFloat(editAccItem.initial_balance || 0),
        current_balance: editAccItem.current_balance !== undefined && editAccItem.current_balance !== "" && editAccItem.current_balance !== null
          ? parseFloat(editAccItem.current_balance)
          : null,
      }),
    }).then(r => r.json()).then(data => {
      setMasterMsg({ type: "success", text: data.message || "Rekening berhasil diperbarui" });
      setEditAccItem(null);
      fetchAccounts(); fetchStats(); fetchNeraca();
    });
  };

  const handleRecalculateAccounts = async () => {
    setConfirmDialog({
      title: "Sinkronkan / Hitung Ulang Saldo Kas",
      message: "Sistem akan menghitung ulang seluruh saldo akun kas dan bank agar cocok dengan riwayat jurnal transaksi yang ada. Jika jurnal transaksi telah dikosongkan/dihapus, saldo kas akan otomatis disesuaikan menjadi Rp 0.",
      confirmText: "Sinkronkan Sekarang",
      cancelText: "Batal",
      confirmType: "primary",
      details: [
        { label: "Target Akun", value: "Seluruh Rekening Kas & Bank" },
        { label: "Tujuan", value: "Sinkronisasi saldo dengan riwayat transaksi / kosongkan jika nol" }
      ],
      onConfirm: async () => {
        setConfirmDialog(null);
        setRecalculatingKas(true);
        setMasterMsg(null);
        setNeracaNotice(null);

        let success = false;
        let message = "";

        try {
          const res = await fetch(`${API_BASE}/accounts/recalculate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });

          if (res.ok) {
            let data = {};
            try { data = await res.json(); } catch (e) {}
            message = data.message || "Saldo seluruh rekening kas berhasil disinkronkan sesuai transaksi.";
            success = true;
          } else if (res.status === 404 || res.status === 405) {
            // Graceful fallback: hitung manual di sisi client jika backend belum update route /accounts/recalculate
            const [accRes, txRes] = await Promise.all([
              fetch(`${API_BASE}/accounts`),
              fetch(`${API_BASE}/transactions?limit=2000`)
            ]);
            const accs = await accRes.json();
            const txData = await txRes.json();
            const txList = Array.isArray(txData) ? txData : (txData.transactions || []);

            const accList = Array.isArray(accs) ? accs : [];
            for (const acc of accList) {
              const accTxs = txList.filter(t => String(t.account_id) === String(acc.id));
              const inc = accTxs.filter(t => t.type === "income").reduce((s, t) => s + parseFloat(t.amount || 0), 0);
              const exp = accTxs.filter(t => t.type === "expense").reduce((s, t) => s + parseFloat(t.amount || 0), 0);
              const initial = parseFloat(acc.initial_balance || 0);
              const calculatedBalance = initial + inc - exp;

              await fetch(`${API_BASE}/accounts/${acc.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name: acc.name,
                  initial_balance: initial,
                  current_balance: calculatedBalance,
                }),
              });
            }
            message = "Saldo seluruh rekening kas berhasil disinkronkan sesuai transaksi yang ada.";
            success = true;
          } else {
            let data = {};
            try { data = await res.json(); } catch (e) {}
            message = data.detail || data.message || `Gagal menyinkronkan saldo kas (Kode: ${res.status}).`;
          }
        } catch (err) {
          console.error("Recalculate error:", err);
          message = "Terjadi gangguan jaringan saat menyinkronkan saldo kas.";
        } finally {
          setRecalculatingKas(false);
          const notice = { type: success ? "success" : "danger", text: message };
          setMasterMsg(notice);
          setNeracaNotice(notice);
          if (success) {
            fetchAccounts();
            fetchStats();
            fetchNeraca();
          }
        }
      }
    });
  };

  const handleDeleteRekening = (acc) => {
    setConfirmDialog({
      title: "Hapus Rekening / Kas",
      message: "Apakah Anda yakin ingin menghapus akun rekening/kas ini?",
      confirmText: "Hapus Rekening",
      confirmType: "danger",
      details: [
        { label: "Kode Akun", value: acc.code },
        { label: "Nama Akun", value: acc.name, isHighlight: true },
        { label: "Saldo Awal", value: formatRupiah(acc.initial_balance) }
      ],
      onConfirm: async () => {
        try {
          setMasterMsg(null);
          const r = await fetch(`${API_BASE}/accounts/${acc.id}`, { method: "DELETE" });
          const resBody = await r.json();
          if (r.status === 200) {
            setMasterMsg({ type: "success", text: resBody.message || "Rekening berhasil dihapus" });
            fetchAccounts();
            fetchStats();
          } else {
            setMasterMsg({ type: "danger", text: resBody.detail || "Gagal menghapus rekening" });
          }
        } finally {
          setConfirmDialog(null);
        }
      }
    });
  };

  const handleBulkDeleteRekening = async (ids) => {
    if (!ids || ids.length === 0) return false;
    try {
      const res = await fetch(`${API_BASE}/accounts/bulk-delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (res.status === 404 || res.status === 405) {
        const results = await Promise.all(
          ids.map(id => fetch(`${API_BASE}/accounts/${id}`, { method: "DELETE" }))
        );
        if (results.every(r => r.ok)) {
          setMasterMsg({ type: "success", text: "Rekening berhasil dihapus" });
          fetchAccounts();
          fetchStats();
          return true;
        }
      }
      const data = await res.json();
      if (res.ok) {
        setMasterMsg({ type: "success", text: data.message || "Rekening berhasil dihapus" });
        fetchAccounts();
        fetchStats();
        return true;
      } else {
        setMasterMsg({ type: "danger", text: data.message || data.detail || "Gagal menghapus rekening" });
        return false;
      }
    } catch (err) {
      alert("Terjadi kesalahan saat menghapus rekening");
      return false;
    }
  };

  const handleTambahUser = (e) => {
    e.preventDefault();
    setMasterMsg(null);
    fetch(`${API_BASE}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole,
        assigned_category_id: newUserCatIds.length > 0 ? newUserCatIds[0] : (newUserCatId ? parseInt(newUserCatId) : null),
        assigned_categories: newUserCatIds.map(Number),
        access_level: newUserAccessLevel || "full"
      })
    })
      .then(r => r.json())
      .then(data => {
        if (data.id) {
          setMasterMsg({ type: "success", text: data.message });
          setNewUserName(""); setNewUserEmail(""); setNewUserPassword("");
          setNewUserCatIds([]); setNewUserAccessLevel("full");
          fetchUsers();
        } else {
          setMasterMsg({ type: "danger", text: data.detail || "Gagal menambah user" });
        }
      });
  };

  const handleUpdateUser = (e) => {
    e.preventDefault();
    if (!editUserItem) return;
    setMasterMsg(null);
    const catIds = Array.isArray(editUserItem.assigned_categories) ? editUserItem.assigned_categories.map(Number) : [];
    fetch(`${API_BASE}/users/${editUserItem.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editUserItem.name,
        email: editUserItem.email,
        password: editUserItem.password || null,
        role: editUserItem.role,
        assigned_category_id: catIds.length > 0 ? catIds[0] : (editUserItem.assigned_category_id ? parseInt(editUserItem.assigned_category_id) : null),
        assigned_categories: catIds,
        access_level: editUserItem.access_level || "full"
      })
    })
      .then(r => r.json())
      .then(data => {
        setMasterMsg({ type: "success", text: data.message || "User berhasil diperbarui" });
        setEditUserItem(null);
        fetchUsers();
      });
  };

  const handleDeleteUser = (u) => {
    setConfirmDialog({
      title: "Hapus Pengguna / Penjab",
      message: "Apakah Anda yakin ingin menghapus akun pengguna/penjab ini?",
      confirmText: "Hapus Pengguna",
      confirmType: "danger",
      details: [
        { label: "Nama", value: u.name, isHighlight: true },
        { label: "Email", value: u.email },
        { label: "Role", value: u.role }
      ],
      onConfirm: async () => {
        try {
          await fetch(`${API_BASE}/users/${u.id}`, { method: "DELETE" });
          fetchUsers();
        } finally {
          setConfirmDialog(null);
        }
      }
    });
  };

  const handleBulkDeleteUsers = async (ids) => {
    if (!ids || ids.length === 0) return false;
    try {
      const res = await fetch(`${API_BASE}/users/bulk-delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (res.status === 404 || res.status === 405) {
        const results = await Promise.all(
          ids.map(id => fetch(`${API_BASE}/users/${id}`, { method: "DELETE" }))
        );
        if (results.every(r => r.ok)) {
          setMasterMsg({ type: "success", text: "Pengguna berhasil dihapus" });
          fetchUsers();
          return true;
        }
      }
      const data = await res.json();
      if (res.ok) {
        setMasterMsg({ type: "success", text: data.message || "Pengguna berhasil dihapus" });
        fetchUsers();
        return true;
      } else {
        setMasterMsg({ type: "danger", text: data.message || data.detail || "Gagal menghapus pengguna" });
        return false;
      }
    } catch (err) {
      alert("Terjadi kesalahan saat menghapus pengguna");
      return false;
    }
  };

  const handleTambahDonatur = (e) => {
    e.preventDefault();
    setMasterMsg(null);
    fetch(`${API_BASE}/donors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newDonorName, phone: newDonorPhone, address: newDonorAddress }),
    }).then(r => r.json()).then(data => {
      if (data.id) {
        setMasterMsg({ type: "success", text: data.message });
        setNewDonorName(""); setNewDonorPhone(""); setNewDonorAddress("");
        fetchDonors();
      }
    });
  };

  const handleUpdateDonatur = (e) => {
    e.preventDefault();
    if (!editDonorItem) return;
    setMasterMsg(null);
    fetch(`${API_BASE}/donors/${editDonorItem.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editDonorItem.name,
        phone: editDonorItem.phone,
        address: editDonorItem.address
      }),
    }).then(r => r.json()).then(data => {
      setMasterMsg({ type: "success", text: data.message || "Donatur berhasil diperbarui" });
      setEditDonorItem(null);
      fetchDonors();
    });
  };

  const handleDeleteDonatur = (d) => {
    setConfirmDialog({
      title: "Hapus Database Donatur",
      message: "Apakah Anda yakin ingin menghapus profil donatur ini?",
      confirmText: "Hapus Donatur",
      confirmType: "danger",
      details: [
        { label: "Nama Donatur", value: d.name, isHighlight: true },
        { label: "Nomor HP", value: d.phone || "-" },
        { label: "Alamat", value: d.address || "-" }
      ],
      onConfirm: async () => {
        try {
          setMasterMsg(null);
          const r = await fetch(`${API_BASE}/donors/${d.id}`, { method: "DELETE" });
          const data = await r.json();
          setMasterMsg({ type: "success", text: data.message || "Donatur berhasil dihapus" });
          fetchDonors();
        } finally {
          setConfirmDialog(null);
        }
      }
    });
  };

  const handleBulkDeleteDonatur = async (ids) => {
    if (!ids || ids.length === 0) return false;
    try {
      const res = await fetch(`${API_BASE}/donors/bulk-delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (res.status === 404 || res.status === 405) {
        const results = await Promise.all(
          ids.map(id => fetch(`${API_BASE}/donors/${id}`, { method: "DELETE" }))
        );
        if (results.every(r => r.ok)) {
          setMasterMsg({ type: "success", text: "Donatur berhasil dihapus" });
          fetchDonors();
          return true;
        }
      }
      const data = await res.json();
      if (res.ok) {
        setMasterMsg({ type: "success", text: data.message || "Donatur berhasil dihapus" });
        fetchDonors();
        return true;
      } else {
        setMasterMsg({ type: "danger", text: data.message || data.detail || "Gagal menghapus donatur" });
        return false;
      }
    } catch (err) {
      alert("Terjadi kesalahan saat menghapus donatur");
      return false;
    }
  };

  const filteredTransactions = allTransactions.filter(tx => {
    const matchSearch = searchFilter === "" || 
      tx.donatur.toLowerCase().includes(searchFilter.toLowerCase()) || 
      (tx.keterangan && tx.keterangan.toLowerCase().includes(searchFilter.toLowerCase())) ||
      tx.pos_program.toLowerCase().includes(searchFilter.toLowerCase());
    const matchPos = posFilter === "" || tx.pos_program === posFilter;
    const matchJenis = jenisFilter === "" || tx.jenis === jenisFilter;
    return matchSearch && matchPos && matchJenis;
  });

  const currentScopedPos = categories.find(c => String(c.id) === String(selectedPosScope));

  return (
    <div className="desktop-layout">
      {/* Dynamic Interactive Living Lights Canvas (Islamic, Wave, Geometric, Galaxy) */}
      <div className="ambient-canvas-wrapper" aria-hidden="true">
        <DynamicBackgroundCanvas bgTheme={bgTheme} theme={theme} />
        <div className="ambient-orb orb-1"></div>
        <div className="ambient-orb orb-2"></div>
        <div className="ambient-orb orb-3"></div>
      </div>

      {/* Responsive Backdrop saat Sidebar Terbuka di Layar Tablet/Mobile */}
      {isSidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)} aria-hidden="true" />
      )}

      {/* Sidebar Desktop */}
      <Sidebar
        user={user}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        selectedPosScope={selectedPosScope}
        setSelectedPosScope={setSelectedPosScope}
        categories={categories}
        showProfileDropdown={showProfileDropdown}
        setShowProfileDropdown={setShowProfileDropdown}
        onSwitchMobile={onSwitchMobile}
        onLogout={onLogout}
        fetchDonors={fetchDonors}
        donorsCount={donorsList.length}
        onOpenFontModal={onOpenFontModal}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onOpenThemeModal={onOpenThemeModal}
      />

      {/* Main Content Area */}
      <main className="desktop-main">
        {/* Top Header Bar */}
        <TopHeader
          activeMenu={activeMenu}
          currentScopedPos={currentScopedPos}
          user={user}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onRefreshData={fetchAll}
          onOpenFontModal={onOpenFontModal}
          theme={theme}
          onToggleTheme={onToggleTheme}
          onOpenThemeModal={onOpenThemeModal}
        />

        {/* Content Views Routing */}
        <div className="desktop-content">
          {/* 1. DASHBOARD OVERVIEW */}
          {activeMenu === "dashboard" && (
            <DashboardOverview
              stats={stats}
              allTransactions={allTransactions}
              donorsList={donorsList}
              barangList={barangList}
              categories={categories}
              chartTimeFrame={chartTimeFrame}
              setChartTimeFrame={setChartTimeFrame}
              activeChartMetric={activeChartMetric}
              setActiveChartMetric={setActiveChartMetric}
              onNavigatePos={(catId) => {
                setSelectedPosScope(String(catId));
                setActiveMenu(isDonatur ? "donatur_pos_view" : "pos_transaksi");
              }}
            />
          )}

          {/* DASHBOARD KHUSUS DONATUR */}
          {activeMenu === "donatur_dashboard" && (
            <DonaturDashboard
              stats={stats}
              allTransactions={allTransactions}
              categories={categories}
              onNavigatePos={(catId) => {
                setSelectedPosScope(String(catId));
                setActiveMenu("donatur_pos_view");
              }}
            />
          )}

          {/* VIEW DAFTAR POS & DONATUR (TERSEDIA UNTUK ROLE DONATUR & UMUM) */}
          {activeMenu === "donatur_pos_view" && (
            <DonaturPosView
              stats={stats}
              allTransactions={allTransactions}
              categories={categories}
              initialPosId={selectedPosScope}
            />
          )}

          {/* 2. JURNAL TRANSAKSI KAS & BANK */}
          {activeMenu === "transaksi_list" && (
            <JurnalTransaksi
              allTransactions={allTransactions}
              filteredTransactions={filteredTransactions}
              searchFilter={searchFilter}
              setSearchFilter={setSearchFilter}
              posFilter={posFilter}
              setPosFilter={setPosFilter}
              jenisFilter={jenisFilter}
              setJenisFilter={setJenisFilter}
              categories={categories}
              accounts={accounts}
              fetchTransactions={fetchTransactions}
              isReadOnly={isReadOnly}
              isAdmin={isAdmin}
              canManageMaster={canManageMaster}
              editTxItem={editTxItem}
              setEditTxItem={setEditTxItem}
              handleUpdateTransaction={handleUpdateTransaction}
              handleDeleteTransaction={handleDeleteTransaction}
              handleBulkDeleteTransactions={handleBulkDeleteTransactions}
              setConfirmDialog={setConfirmDialog}
            />
          )}

          {/* 3. CATAT TRANSAKSI KAS / BANK POS */}
          {activeMenu === "pos_transaksi" && (
            <PosTransaksiKas
              selectedPosScope={selectedPosScope}
              currentScopedPos={currentScopedPos}
              posTxSummary={posTxSummary}
              debtsRecap={debtsRecap}
              posTxMsg={posTxMsg}
              posTxFormTgl={posTxFormTgl}
              setPosTxFormTgl={setPosTxFormTgl}
              posTxFormCatType={posTxFormCatType}
              setPosTxFormCatType={setPosTxFormCatType}
              posTxPaymentStatus={posTxPaymentStatus}
              setPosTxPaymentStatus={setPosTxPaymentStatus}
              posTxFormType={posTxFormType}
              setPosTxFormType={setPosTxFormType}
              posTxFormAmount={posTxFormAmount}
              setPosTxFormAmount={setPosTxFormAmount}
              posTxFormParty={posTxFormParty}
              setPosTxFormParty={setPosTxFormParty}
              posTxFormDesc={posTxFormDesc}
              setPosTxFormDesc={setPosTxFormDesc}
              posTxMatId={posTxMatId}
              setPosTxMatId={setPosTxMatId}
              posTxMatName={posTxMatName}
              setPosTxMatName={setPosTxMatName}
              posTxMatBrand={posTxMatBrand}
              setPosTxMatBrand={setPosTxMatBrand}
              posTxMatUnit={posTxMatUnit}
              setPosTxMatUnit={setPosTxMatUnit}
              posTxMatQty={posTxMatQty}
              setPosTxMatQty={setPosTxMatQty}
              posTxMatPrice={posTxMatPrice}
              setPosTxMatPrice={setPosTxMatPrice}
              materialsList={materialsList}
              neracaPosData={neracaPosData}
              posTxList={posTxList}
              isReadOnly={isReadOnly}
              handleSimpanPosTx={handleSimpanPosTx}
              handleHapusPosTx={handleHapusPosTx}
              handleBulkDeletePosTransactions={handleBulkDeletePosTransactions}
              setConfirmDialog={setConfirmDialog}
              fetchPosTransactions={fetchPosTransactions}
              fetchDebts={fetchDebts}
            />
          )}

          {/* 4. HUTANG & PIUTANG POS */}
          {activeMenu === "hutang_piutang" && (
            <PosHutangPiutang
              currentScopedPos={currentScopedPos}
              selectedPosScope={selectedPosScope}
              debtsRecap={debtsRecap}
              debtMsg={debtMsg}
              debtFormCatId={debtFormCatId}
              setDebtFormCatId={setDebtFormCatId}
              categories={categories}
              debtFormTgl={debtFormTgl}
              setDebtFormTgl={setDebtFormTgl}
              debtFormType={debtFormType}
              setDebtFormType={setDebtFormType}
              debtFormParty={debtFormParty}
              setDebtFormParty={setDebtFormParty}
              debtFormAmount={debtFormAmount}
              setDebtFormAmount={setDebtFormAmount}
              debtFormDesc={debtFormDesc}
              setDebtFormDesc={setDebtFormDesc}
              debtsList={debtsList}
              isReadOnly={isReadOnly}
              handleSimpanDebt={handleSimpanDebt}
              handleHapusDebt={handleHapusDebt}
              handleBulkDeleteDebts={handleBulkDeleteDebts}
              setConfirmDialog={setConfirmDialog}
              setActiveMenu={setActiveMenu}
              fetchDebts={fetchDebts}
            />
          )}

          {/* 5. MATERIAL & PEMAKAIAN LAPANGAN */}
          {activeMenu === "material_pemakaian" && (
            <PosMaterialLogistik
              currentScopedPos={currentScopedPos}
              grandStockValue={grandStockValue}
              materialsList={materialsList}
              materialTxList={materialTxList}
              usageMsg={usageMsg}
              usageMatId={usageMatId}
              setUsageMatId={setUsageMatId}
              usageDate={usageDate}
              setUsageDate={setUsageDate}
              usageQty={usageQty}
              setUsageQty={setUsageQty}
              usagePurpose={usagePurpose}
              setUsagePurpose={setUsagePurpose}
              isReadOnly={isReadOnly}
              handleCatatPemakaianMaterial={handleCatatPemakaianMaterial}
              handleHapusMaterialTx={handleHapusMaterialTx}
              handleBulkDeleteMaterialTx={handleBulkDeleteMaterialTx}
              setConfirmDialog={setConfirmDialog}
            />
          )}

          {/* 6. NERACA DINAMIS POS */}
          {activeMenu === "neraca_pos" && (
            <PosNeracaDinamis
              currentScopedPos={currentScopedPos}
              neracaPosData={neracaPosData}
              neracaPosMsg={neracaPosMsg}
              setActiveMenu={setActiveMenu}
              showAddBalanceModal={showAddBalanceModal}
              setShowAddBalanceModal={setShowAddBalanceModal}
              editCustomItem={editCustomItem}
              handleOpenAddBalanceModal={handleOpenAddBalanceModal}
              handleOpenEditBalanceModal={handleOpenEditBalanceModal}
              customItemSide={customItemSide}
              setCustomItemSide={setCustomItemSide}
              customItemSubCat={customItemSubCat}
              setCustomItemSubCat={setCustomItemSubCat}
              customItemCode={customItemCode}
              setCustomItemCode={setCustomItemCode}
              customItemName={customItemName}
              setCustomItemName={setCustomItemName}
              customItemAmountPrev={customItemAmountPrev}
              setCustomItemAmountPrev={setCustomItemAmountPrev}
              customItemAmountCurr={customItemAmountCurr}
              setCustomItemAmountCurr={setCustomItemAmountCurr}
              isReadOnly={isReadOnly}
              handleTambahCustomBalanceItem={handleTambahCustomBalanceItem}
              handleHapusCustomBalanceItem={handleHapusCustomBalanceItem}
            />
          )}

          {/* 7. INPUT FORM KAS & BANK */}
          {activeMenu === "transaksi_form" && canInputMoney && (
            <FormKasBank
              txMessage={txMessage}
              tglTx={tglTx}
              setTglTx={setTglTx}
              jenisTx={jenisTx}
              setJenisTx={setJenisTx}
              kategoriTx={kategoriTx}
              setKategoriTx={setKategoriTx}
              metodeTx={metodeTx}
              setMetodeTx={setMetodeTx}
              nominalTx={nominalTx}
              setNominalTx={setNominalTx}
              donaturTx={donaturTx}
              setDonaturTx={setDonaturTx}
              ketTx={ketTx}
              setKetTx={setKetTx}
              categories={categories}
              accounts={accounts}
              setFotoTx={setFotoTx}
              handleSimpanTx={handleSimpanTx}
            />
          )}

          {/* 8. INPUT DONASI BARANG & LOGISTIK */}
          {activeMenu === "barang" && canInputBarang && (
            <FormBarangLogistik
              barangMessage={barangMessage}
              tglBarang={tglBarang}
              setTglBarang={setTglBarang}
              donaturBarang={donaturBarang}
              setDonaturBarang={setDonaturBarang}
              katBarang={katBarang}
              setKatBarang={setKatBarang}
              namaBarang={namaBarang}
              setNamaBarang={setNamaBarang}
              jumlahBarang={jumlahBarang}
              setJumlahBarang={setJumlahBarang}
              satuanBarang={satuanBarang}
              setSatuanBarang={setSatuanBarang}
              ketBarang={ketBarang}
              setKetBarang={setKetBarang}
              categories={categories}
              posBarang={posBarang}
              setPosBarang={setPosBarang}
              barangList={barangList}
              setFotoBarang={setFotoBarang}
              handleSimpanBarang={handleSimpanBarang}
              handleHapusBarang={handleHapusBarang}
              handleBulkDeleteBarang={handleBulkDeleteBarang}
              setConfirmDialog={setConfirmDialog}
              fetchBarang={fetchBarang}
            />
          )}

          {/* 9. IMPORT TRANSAKSI QRIS */}
          {activeMenu === "import_qris" && isAdmin && (
            <ImportQris
              qrisMessage={qrisMessage}
              fileQris={fileQris}
              setFileQris={setFileQris}
              isImporting={isImporting}
              handleUploadQris={handleUploadQris}
            />
          )}

          {/* 10. BUKU PEMBANTU PER POS */}
          {activeMenu === "buku_bantu" && (
            <BukuPembantu bukuBantuData={bukuBantuData} fetchBukuBantu={fetchBukuBantu} categories={categories} />
          )}

          {/* 11. LAPORAN NERACA UMUM */}
          {activeMenu === "neraca" && (
            <ErrorBoundary onReset={fetchNeraca}>
              <LaporanNeracaUmum
                neracaData={neracaData}
                fetchNeraca={fetchNeraca}
                categories={categories}
                accounts={accounts}
                transactions={allTransactions}
                debtsRecap={debtsRecap}
                isReadOnly={isReadOnly}
                setActiveMenu={setActiveMenu}
                setConfirmDialog={setConfirmDialog}
                handleRecalculateAccounts={handleRecalculateAccounts}
                isRecalculating={recalculatingKas}
                neracaNotice={neracaNotice}
                setNeracaNotice={setNeracaNotice}
              />
            </ErrorBoundary>
          )}

          {/* 12. CETAK LAPORAN KEUANGAN */}
          {activeMenu === "cetak_laporan" && (
            <LaporanCetak
              categories={categories}
              accounts={accounts}
              isReadOnly={isReadOnly}
              isDonatur={isDonatur}
              user={user}
            />
          )}

          {/* 13. MASTER POS PROGRAM */}
          {activeMenu === "master_pos" && canManageMaster && (
            <MasterPosProgram
              masterMsg={masterMsg}
              newCatCode={newCatCode}
              setNewCatCode={setNewCatCode}
              newCatName={newCatName}
              setNewCatName={setNewCatName}
              newCatDigit={newCatDigit}
              setNewCatDigit={setNewCatDigit}
              newCatType={newCatType}
              setNewCatType={setNewCatType}
              newCatPic={newCatPic}
              setNewCatPic={setNewCatPic}
              newCatDesc={newCatDesc}
              setNewCatDesc={setNewCatDesc}
              categories={categories}
              editCatItem={editCatItem}
              setEditCatItem={setEditCatItem}
              handleTambahPos={handleTambahPos}
              handleUpdatePos={handleUpdatePos}
              handleDeletePos={handleDeletePos}
              handleBulkDeletePos={handleBulkDeletePos}
              setConfirmDialog={setConfirmDialog}
            />
          )}

          {/* 14. MASTER REKENING KAS / BANK */}
          {activeMenu === "master_rekening" && canManageMaster && (
            <MasterRekening
              masterMsg={masterMsg}
              newAccCode={newAccCode}
              setNewAccCode={setNewAccCode}
              newAccName={newAccName}
              setNewAccName={setNewAccName}
              newAccBalance={newAccBalance}
              setNewAccBalance={setNewAccBalance}
              accounts={accounts}
              editAccItem={editAccItem}
              setEditAccItem={setEditAccItem}
              handleTambahRekening={handleTambahRekening}
              handleUpdateRekening={handleUpdateRekening}
              handleDeleteRekening={handleDeleteRekening}
              handleBulkDeleteRekening={handleBulkDeleteRekening}
              handleRecalculateAccounts={handleRecalculateAccounts}
              isRecalculating={recalculatingKas}
              setConfirmDialog={setConfirmDialog}
            />
          )}

          {/* 15. MASTER PETUGAS & USER PENJAB */}
          {activeMenu === "master_users" && canManageMaster && (
            <MasterUsers
              masterMsg={masterMsg}
              newUserName={newUserName}
              setNewUserName={setNewUserName}
              newUserEmail={newUserEmail}
              setNewUserEmail={setNewUserEmail}
              newUserPassword={newUserPassword}
              setNewUserPassword={setNewUserPassword}
              newUserRole={newUserRole}
              setNewUserRole={setNewUserRole}
              newUserCatId={newUserCatId}
              setNewUserCatId={setNewUserCatId}
              newUserCatIds={newUserCatIds}
              setNewUserCatIds={setNewUserCatIds}
              newUserAccessLevel={newUserAccessLevel}
              setNewUserAccessLevel={setNewUserAccessLevel}
              usersList={usersList}
              categories={categories}
              editUserItem={editUserItem}
              setEditUserItem={setEditUserItem}
              handleTambahUser={handleTambahUser}
              handleUpdateUser={handleUpdateUser}
              handleDeleteUser={handleDeleteUser}
              handleBulkDeleteUsers={handleBulkDeleteUsers}
              setConfirmDialog={setConfirmDialog}
            />
          )}

          {/* 16. MASTER DATABASE DONATUR */}
          {activeMenu === "master_donatur" && canManageMaster && (
            <MasterDonatur
              masterMsg={masterMsg}
              newDonorName={newDonorName}
              setNewDonorName={setNewDonorName}
              newDonorPhone={newDonorPhone}
              setNewDonorPhone={setNewDonorPhone}
              newDonorAddress={newDonorAddress}
              setNewDonorAddress={setNewDonorAddress}
              donorSearch={donorSearch}
              setDonorSearch={setDonorSearch}
              donorPosFilter={donorPosFilter}
              setDonorPosFilter={setDonorPosFilter}
              donorStartDate={donorStartDate}
              setDonorStartDate={setDonorStartDate}
              donorEndDate={donorEndDate}
              setDonorEndDate={setDonorEndDate}
              donorsList={donorsList}
              categories={categories}
              editDonorItem={editDonorItem}
              setEditDonorItem={setEditDonorItem}
              fetchDonors={fetchDonors}
              handleTambahDonatur={handleTambahDonatur}
              handleUpdateDonatur={handleUpdateDonatur}
              handleDeleteDonatur={handleDeleteDonatur}
              handleBulkDeleteDonatur={handleBulkDeleteDonatur}
              setConfirmDialog={setConfirmDialog}
            />
          )}
        </div>
      </main>

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
