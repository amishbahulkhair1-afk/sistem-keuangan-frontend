import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { IconCheckCircle, IconScale, IconEdit, IconTrash, IconExternalLink, IconRefresh, IconPlusCircle } from "../../Icons";
import { formatRupiah, API_BASE } from "../../utils/formatters";
import CustomDropdown from "../common/CustomDropdown";

export default function LaporanNeracaUmum({
  neracaData,
  fetchNeraca,
  categories = [],
  accounts = [],
  transactions = [],
  debtsRecap,
  isReadOnly,
  setActiveMenu,
  setConfirmDialog,
  handleRecalculateAccounts,
  isRecalculating,
  neracaNotice,
  setNeracaNotice,
}) {
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [side, setSide] = useState("aktiva");
  const [subCat, setSubCat] = useState("harta_lancar");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [amountPrev, setAmountPrev] = useState("");
  const [amountCurr, setAmountCurr] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const handleOpenAddModal = () => {
    setEditItem(null);
    setSide("aktiva");
    setSubCat("harta_lancar");
    setCode("");
    setName("");
    setAmountPrev("");
    setAmountCurr("");
    setFormError(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (item) => {
    setEditItem(item);
    setSide(item.side || "aktiva");
    setSubCat(item.sub_category || (item.side === "passiva" ? "kewajiban" : "harta_lancar"));
    setCode(item.code && item.code !== "-" ? item.code : "");
    setName(item.name || "");
    setAmountPrev(item.amount_prev != null ? String(item.amount_prev) : "");
    setAmountCurr(item.amount_current != null ? String(item.amount_current) : "");
    setFormError(null);
    setShowModal(true);
  };

  const handleSubmitModal = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError("Nama uraian baris wajib diisi.");
      return;
    }

    const prev = parseFloat(amountPrev || 0);
    const curr = parseFloat(amountCurr || 0);
    const total = prev + curr;

    setIsSubmitting(true);
    try {
      if (editItem) {
        // Edit / Update
        const res = await fetch(`${API_BASE}/reports/neraca/items/${editItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            side,
            sub_category: subCat,
            code: code.trim() || "-",
            name: name.trim(),
            amount_prev_month: prev,
            amount_current_month: curr,
            amount_total: total,
          }),
        });
        const data = await res.json();
        if (res.ok && data.id) {
          setShowModal(false);
          if (fetchNeraca) fetchNeraca();
        } else {
          setFormError(data.detail || data.message || "Gagal memperbarui baris neraca.");
        }
      } else {
        // Tambah Baru
        const res = await fetch(`${API_BASE}/reports/neraca/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            side,
            sub_category: subCat,
            code: code.trim() || "-",
            name: name.trim(),
            amount_prev_month: prev,
            amount_current_month: curr,
            amount_total: total,
          }),
        });
        const data = await res.json();
        if (res.ok && data.id) {
          setShowModal(false);
          if (fetchNeraca) fetchNeraca();
        } else {
          setFormError(data.detail || data.message || "Gagal menambahkan baris neraca.");
        }
      }
    } catch (err) {
      setFormError("Terjadi gangguan jaringan atau sesi telah berakhir.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = (item) => {
    if (setConfirmDialog) {
      setConfirmDialog({
        title: "Hapus Baris Neraca Konsolidasi",
        message: "Apakah Anda yakin ingin menghapus baris penyesuaian neraca konsolidasi ini?",
        confirmLabel: "Hapus Baris",
        itemSummary: [
          { label: "Uraian", value: item.name },
          { label: "Sisi", value: item.side === "aktiva" ? "Aktiva" : "Passiva" },
          { label: "Total Saldo", value: formatRupiah(item.amount), isHighlight: true },
        ],
        onConfirm: async () => {
          try {
            await fetch(`${API_BASE}/reports/neraca/items/${item.id}`, { method: "DELETE" });
            if (fetchNeraca) fetchNeraca();
          } finally {
            setConfirmDialog(null);
          }
        },
      });
    } else if (window.confirm(`Hapus baris '${item.name}'?`)) {
      fetch(`${API_BASE}/reports/neraca/items/${item.id}`, { method: "DELETE" })
        .then(() => fetchNeraca && fetchNeraca());
    }
  };

  const handleShortcutNavigation = (item) => {
    if (!setActiveMenu) return;
    const sub = item.sub_category;
    if (sub === "harta_lancar") {
      if (item.code === "P.U") {
        setActiveMenu("hutang_piutang");
      } else {
        setActiveMenu("master_rekening");
      }
    } else if (sub === "biaya_biaya") {
      setActiveMenu("pos_transaksi");
    } else if (sub === "kewajiban") {
      setActiveMenu("hutang_piutang");
    } else if (sub === "sumber_dana") {
      setActiveMenu("buku_bantu");
    } else {
      setActiveMenu("transaksi");
    }
  };

  // Ambil data otomatis saat pertama kali dibuka jika belum tersedia
  useEffect(() => {
    if (!neracaData && fetchNeraca) {
      fetchNeraca();
    }
  }, [neracaData, fetchNeraca]);

  // Fallback adaptif dinamis: mengambil langsung dari master pos (categories), rekening kas, dan transaksi
  const aktivaGroups = useMemo(() => {
    const groups = [];

    // --- GRUP A: Harta Lancar (Kas Tunai, Kas Bank, & Piutang) ---
    let hartaItems = [];
    if (neracaData?.aktiva?.groups?.[0]?.items && neracaData.aktiva.groups[0].items.length > 0) {
      hartaItems = neracaData.aktiva.groups[0].items.map((it) => ({
        ...it,
        side: "aktiva",
        sub_category: "harta_lancar",
      }));
    } else {
      const rawHartaLancar = (neracaData?.aktiva?.harta_lancar && neracaData.aktiva.harta_lancar.length > 0)
        ? neracaData.aktiva.harta_lancar
        : (accounts || []);

      hartaItems = rawHartaLancar.map((item) => {
        let defaultCode = "KAS";
        const n = (item.nama || item.name || "").toLowerCase();
        if (n.includes("piutang")) defaultCode = "P.U";
        else if (n.includes("bank") || n.includes("bni")) defaultCode = "BANK";
        return {
          id: item.id || null,
          code: item.code && item.code !== "-" ? item.code : defaultCode,
          name: item.name || item.nama || "Kas / Bank",
          amount: parseFloat(item.amount ?? item.saldo ?? item.current_balance ?? 0),
          is_auto: item.is_auto !== undefined ? item.is_auto : true,
          side: "aktiva",
          sub_category: "harta_lancar",
        };
      });

      // Pastikan Piutang tercantum sebagai Harta Lancar
      const hasPiutang = hartaItems.some((it) => it.code === "P.U" || (it.name || "").toLowerCase().includes("piutang"));
      if (!hasPiutang) {
        let sisaPiutang = 0;
        if (debtsRecap && debtsRecap.total_sisa_piutang !== undefined) {
          sisaPiutang = parseFloat(debtsRecap.total_sisa_piutang || 0);
        } else {
          const piutangAcc = (accounts || []).find((a) => a.code === "piutang" || (a.name || "").toLowerCase().includes("piutang"));
          if (piutangAcc) sisaPiutang = parseFloat(piutangAcc.current_balance || 0);
        }
        hartaItems.push({
          id: null,
          code: "P.U",
          name: "Piutang ke Pihak Lain",
          amount: sisaPiutang,
          is_auto: true,
          side: "aktiva",
          sub_category: "harta_lancar",
        });
      }
    }

    const subtotalHarta = hartaItems.reduce((s, it) => s + (it.amount || 0), 0);
    groups.push({
      code: "A",
      sub_category: "harta_lancar",
      title: "A. Harta Lancar",
      items: hartaItems,
      subtotal: subtotalHarta,
    });

    // --- GRUP B: Pengeluaran / Realisasi Biaya Tiap Pos Program ---
    // DINAMIS: Menampung pengeluaran dari tiap-tiap pos yang mengambil langsung dari master pos (categories)
    const activeCategories = Array.isArray(categories) && categories.length > 0
      ? categories.filter((c) => c.is_active !== false)
      : [];

    const rawBiaya = neracaData?.aktiva?.groups?.[1]?.items || neracaData?.aktiva?.biaya_biaya || [];
    const txList = Array.isArray(transactions) ? transactions : (transactions?.transactions || []);

    const biayaItems = [];

    if (activeCategories.length > 0) {
      for (const cat of activeCategories) {
        // Cari dari data backend jika ada
        const found = rawBiaya.find(
          (b) => String(b.code).toLowerCase() === String(cat.code).toLowerCase() ||
                 String(b.name).toLowerCase().includes(String(cat.name).toLowerCase())
        );

        let amt = 0;
        if (found) {
          amt = parseFloat(found.amount ?? found.saldo ?? found.total_biaya ?? 0);
        } else if (txList.length > 0) {
          const catExpenses = txList.filter(
            (t) => String(t.category_id) === String(cat.id) && t.type === "expense"
          );
          amt = catExpenses.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
        }

        biayaItems.push({
          id: cat.id,
          code: cat.code || "-",
          name: `Realisasi Pengeluaran: ${cat.name}`,
          amount: amt,
          is_auto: true,
          side: "aktiva",
          sub_category: "biaya_biaya",
        });
      }
    } else if (rawBiaya.length > 0) {
      for (const item of rawBiaya) {
        biayaItems.push({
          id: item.id || null,
          code: item.code || item.pos_code || "-",
          name: item.name || item.nama || (item.pos_name ? `Realisasi Pengeluaran: ${item.pos_name}` : "Biaya Pos Program"),
          amount: parseFloat(item.amount ?? item.saldo ?? item.total_biaya ?? 0),
          is_auto: item.is_auto !== undefined ? item.is_auto : true,
          side: "aktiva",
          sub_category: "biaya_biaya",
        });
      }
    }

    // Realisasi Biaya Umum jika ada transaksi operasional tanpa pos kategori
    const generalExp = txList.filter((t) => !t.category_id && t.type === "expense").reduce((s, t) => s + parseFloat(t.amount || 0), 0);
    const foundGeneral = rawBiaya.find((b) => b.code === "UMUM");
    if (foundGeneral || generalExp > 0) {
      biayaItems.push({
        id: null,
        code: "UMUM",
        name: "Realisasi Biaya: Operasional Umum Lembaga",
        amount: parseFloat(foundGeneral ? (foundGeneral.amount || foundGeneral.saldo || 0) : generalExp),
        is_auto: true,
        side: "aktiva",
        sub_category: "biaya_biaya",
      });
    }

    // Tambahkan custom items manual di Aktiva B jika ada
    const manualBiaya = (rawBiaya || []).filter((it) => !it.is_auto && it.id);
    for (const m of manualBiaya) {
      if (!biayaItems.some((it) => it.id === m.id)) {
        biayaItems.push(m);
      }
    }

    const subtotalBiaya = biayaItems.reduce((s, it) => s + (it.amount || 0), 0);
    groups.push({
      code: "B",
      sub_category: "biaya_biaya",
      title: "B. Realisasi Pengeluaran Tiap Pos Program",
      items: biayaItems,
      subtotal: subtotalBiaya,
    });

    return groups;
  }, [neracaData, categories, accounts, transactions, debtsRecap]);

  const passivaGroups = useMemo(() => {
    const groups = [];

    // --- GRUP A: Kewajiban (Hutang ke Pihak Lain) ---
    const rawKewajiban = neracaData?.passiva?.groups?.[0]?.items || neracaData?.passiva?.kewajiban || [];

    // Saldo kewajiban hutang
    let hutangSaldo = 0;
    if (debtsRecap && debtsRecap.total_sisa_hutang !== undefined) {
      hutangSaldo = parseFloat(debtsRecap.total_sisa_hutang || 0);
    } else {
      const foundHU = rawKewajiban.find((it) => (it.name || "").toLowerCase().includes("hutang") || it.code === "H.U");
      if (foundHU) hutangSaldo = parseFloat(foundHU.amount ?? foundHU.saldo ?? 0);
    }

    const kewajibanItems = [
      {
        id: null,
        code: "H.U",
        name: "Kewajiban Hutang ke Pihak Lain",
        amount: hutangSaldo,
        is_auto: true,
        side: "passiva",
        sub_category: "kewajiban",
      },
    ];

    // Tambahkan custom items manual di Passiva A jika ada
    const manualKewajiban = (rawKewajiban || []).filter((it) => !it.is_auto && it.id);
    for (const m of manualKewajiban) {
      if (!kewajibanItems.some((it) => it.id === m.id)) {
        kewajibanItems.push(m);
      }
    }

    const subtotalKewajiban = kewajibanItems.reduce((s, it) => s + (it.amount || 0), 0);
    groups.push({
      code: "A",
      sub_category: "kewajiban",
      title: "A. Kewajiban",
      items: kewajibanItems,
      subtotal: subtotalKewajiban,
    });

    // --- GRUP B: Sumber Dana Tiap Pos Program ---
    // DINAMIS: Menampung penerimaan/sumber dana dari tiap-tiap pos yang mengambil langsung dari master pos (categories)
    const activeCategories = Array.isArray(categories) && categories.length > 0
      ? categories.filter((c) => c.is_active !== false)
      : [];

    const rawDana = neracaData?.passiva?.groups?.[1]?.items || neracaData?.passiva?.sumber_dana || neracaData?.passiva?.dana_program || [];
    const txList = Array.isArray(transactions) ? transactions : (transactions?.transactions || []);

    const danaItems = [];

    if (activeCategories.length > 0) {
      for (const cat of activeCategories) {
        // Cari dari data backend jika ada
        const found = rawDana.find(
          (d) => String(d.pos_code || d.code).toLowerCase() === String(cat.code).toLowerCase() ||
                 String(d.pos_name || d.name).toLowerCase().includes(String(cat.name).toLowerCase())
        );

        let amt = 0;
        if (found) {
          amt = parseFloat(found.amount ?? found.saldo_akhir ?? found.saldo ?? found.mutasi_masuk ?? 0);
        } else if (txList.length > 0) {
          const catIncomes = txList.filter(
            (t) => String(t.category_id) === String(cat.id) && t.type === "income"
          );
          amt = catIncomes.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
        }

        danaItems.push({
          id: cat.id,
          code: cat.code || "-",
          name: `Sumber Dana: ${cat.name}`,
          amount: amt,
          is_auto: true,
          side: "passiva",
          sub_category: "sumber_dana",
        });
      }
    } else if (rawDana.length > 0) {
      for (const item of rawDana) {
        danaItems.push({
          id: item.id || null,
          code: item.code || item.pos_code || "-",
          name: item.name || item.nama || (item.pos_name ? `Sumber Dana: ${item.pos_name}` : "Pos Program"),
          amount: parseFloat(item.amount ?? item.saldo_akhir ?? item.saldo ?? 0),
          is_auto: item.is_auto !== undefined ? item.is_auto : true,
          side: "passiva",
          sub_category: "sumber_dana",
        });
      }
    }

    // Sumber Dana Umum Lembaga jika ada
    const generalInc = txList.filter((t) => !t.category_id && t.type === "income").reduce((s, t) => s + parseFloat(t.amount || 0), 0);
    const foundGeneralInc = rawDana.find((d) => d.code === "UMUM");
    if (foundGeneralInc || generalInc > 0) {
      danaItems.push({
        id: null,
        code: "UMUM",
        name: "Sumber Dana: Umum Lembaga (Tidak Terikat)",
        amount: parseFloat(foundGeneralInc ? (foundGeneralInc.amount || foundGeneralInc.saldo || 0) : generalInc),
        is_auto: true,
        side: "passiva",
        sub_category: "sumber_dana",
      });
    }

    // Tambahkan custom items manual di Passiva B jika ada
    const manualDana = (rawDana || []).filter((it) => !it.is_auto && it.id);
    for (const m of manualDana) {
      if (!danaItems.some((it) => it.id === m.id)) {
        danaItems.push(m);
      }
    }

    const subtotalDana = danaItems.reduce((s, it) => s + (it.amount || 0), 0);
    groups.push({
      code: "B",
      sub_category: "sumber_dana",
      title: "B. Sumber Dana Tiap Pos",
      items: danaItems,
      subtotal: subtotalDana,
    });

    return groups;
  }, [neracaData, categories, accounts, transactions, debtsRecap]);

  const totalAktiva = parseFloat(neracaData?.aktiva?.total_aktiva ?? aktivaGroups.reduce((acc, g) => acc + (g.subtotal || 0), 0));
  const totalPassiva = parseFloat(neracaData?.passiva?.total_passiva ?? passivaGroups.reduce((acc, g) => acc + (g.subtotal || 0), 0));
  const selisih = Math.round((totalAktiva - totalPassiva) * 100) / 100;
  const isBalanced = neracaData?.reconciliation?.is_balanced !== undefined
    ? Boolean(neracaData.reconciliation.is_balanced)
    : selisih === 0;
  const statusLabel = neracaData?.reconciliation?.status || (isBalanced ? "SEIMBANG (KLOP)" : `SELISIH ${formatRupiah(Math.abs(selisih))}`);

  return (
    <div className="neraca-page-wrapper">
      {/* PEMBERITAHUAN STATUS / NOTIFIKASI */}
      {neracaNotice && (
        <div
          style={{
            padding: "12px 18px",
            marginBottom: "16px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: neracaNotice.type === "success" ? "#ecfdf5" : "#fef2f2",
            color: neracaNotice.type === "success" ? "#065f46" : "#b91c1c",
            border: `1px solid ${neracaNotice.type === "success" ? "#a7f3d0" : "#fecaca"}`,
            boxShadow: "0 2px 6px rgba(0,0,0,0.04)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span>{neracaNotice.type === "success" ? "✅" : "⚠️"}</span>
            <span>{neracaNotice.text}</span>
          </div>
          {setNeracaNotice && (
            <button
              type="button"
              onClick={() => setNeracaNotice(null)}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "inherit", opacity: 0.7 }}
              title="Tutup pesan"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* KARTU STATUS REKONSILIASI KONSOLIDASI */}
      <div className={`reconciliation-card ${isBalanced ? "balanced" : "unbalanced"}`}>
        <div className="rec-left">
          <div className="rec-badge-icon">
            {isBalanced ? <IconCheckCircle size={20} /> : <IconScale size={20} />}
          </div>
          <div className="rec-info">
            <span className="rec-label">Status Rekonsiliasi Otomatis Konsolidasi</span>
            <strong className="rec-status">{statusLabel}</strong>
          </div>
        </div>
        {!isReadOnly && (
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            {handleRecalculateAccounts && (
              <button
                type="button"
                className="btn-secondary-action"
                disabled={isRecalculating}
                onClick={handleRecalculateAccounts}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "9px 15px",
                  fontSize: "12.5px",
                  fontWeight: "600",
                  borderRadius: "10px",
                  background: "#ffffff",
                  color: "#0369a1",
                  border: "1.5px solid #bae6fd",
                  boxShadow: "0 2px 6px rgba(2, 132, 199, 0.08)",
                  cursor: isRecalculating ? "wait" : "pointer",
                  transition: "all 0.2s ease"
                }}
                title="Hitung ulang dan sinkronkan seluruh saldo kas sesuai riwayat transaksi saat ini atau kosongkan jika transaksi telah dihapus"
              >
                <IconRefresh size={15} className={isRecalculating ? "spin-animate" : ""} />
                <span>{isRecalculating ? "Menyinkronkan Kas..." : "Sinkronkan / Kosongkan Kas"}</span>
              </button>
            )}
            <button
              type="button"
              className="btn-primary-action"
              onClick={handleOpenAddModal}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                padding: "9px 16px",
                fontSize: "12.5px",
                borderRadius: "10px",
              }}
            >
              <IconPlusCircle size={15} />
              <span>Tambah Baris Manual</span>
            </button>
          </div>
        )}
      </div>

      <div className="desktop-panel neraca-panel">
        <div className="neraca-header-box">
          <div className="neraca-tag">Laporan Keuangan Resmi Konsolidasi (Aktiva &amp; Passiva)</div>
          <h2 className="neraca-kop-title">PENGEMBANGAN PEMBANGUNAN PP ANNUQAYAH LATEE</h2>
          <p className="neraca-kop-sub">
            Guluk-Guluk Sumenep Jawa Timur • Periode: {neracaData?.periode || "Tahun Berjalan"}
          </p>
        </div>

        <div className="desktop-2col-grid neraca-tables-grid">
          {/* I. SISI KIRI: AKTIVA */}
          <div className="neraca-sub-card">
            <h4 className="neraca-section-title">I. AKTIVA (HARTA LANCAR &amp; REALISASI PENGELUARAN)</h4>
            <div className="table-responsive-desktop">
              <table className="portal-table neraca-table">
                <thead>
                  <tr>
                    <th style={{ width: "60px" }}>Kode</th>
                    <th>Uraian Komponen</th>
                    <th style={{ textAlign: "right" }}>Jumlah (Rp)</th>
                    {!isReadOnly && <th style={{ textAlign: "center", width: "80px" }}>Aksi</th>}
                  </tr>
                </thead>
                <tbody>
                  {aktivaGroups.length === 0 ? (
                    <tr>
                      <td colSpan={!isReadOnly ? 4 : 3} style={{ textAlign: "center", padding: "28px 16px", color: "var(--text-muted)", fontSize: "13px" }}>
                        Belum ada data komponen aktiva untuk periode ini.
                      </td>
                    </tr>
                  ) : (
                    aktivaGroups.map((group, gIdx) => (
                      <React.Fragment key={gIdx}>
                        <tr className="neraca-group-header">
                          <td colSpan={!isReadOnly ? 4 : 3}>{group.title}</td>
                        </tr>
                        {group.items && group.items.length > 0 ? (
                          group.items.map((item, iIdx) => (
                            <tr key={iIdx}>
                              <td><code>{item.code || "-"}</code></td>
                              <td>
                                {item.name}
                                {item.is_auto && (
                                  <span style={{ fontSize: "10px", color: "#64748b", marginLeft: "6px" }}>(Otomatis)</span>
                                )}
                              </td>
                              <td style={{ textAlign: "right", fontWeight: "700" }}>{formatRupiah(item.amount)}</td>
                              {!isReadOnly && (
                                <td style={{ textAlign: "center" }}>
                                  {!item.is_auto ? (
                                    <div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
                                      <button
                                        type="button"
                                        onClick={() => handleOpenEditModal(item)}
                                        className="btn-edit-cell"
                                        title="Edit Baris"
                                      >
                                        <IconEdit size={13} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteItem(item)}
                                        className="btn-delete-cell"
                                        title="Hapus Baris"
                                      >
                                        <IconTrash size={13} />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      className="btn-goto-shortcut"
                                      onClick={() => handleShortcutNavigation(item)}
                                      title="Buka Modul Terkait"
                                    >
                                      <IconExternalLink size={12} />
                                      <span>Kelola</span>
                                    </button>
                                  )}
                                </td>
                              )}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={!isReadOnly ? 4 : 3} style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "12px", padding: "10px" }}>
                              (Tidak ada rincian)
                            </td>
                          </tr>
                        )}
                        <tr style={{ background: "var(--surface-subtle)", fontStyle: "italic", fontSize: "12px" }}>
                          <td colSpan={2} style={{ paddingLeft: "16px", fontWeight: "600" }}>
                            Subtotal {group.title}
                          </td>
                          <td style={{ textAlign: "right", fontWeight: "700" }}>
                            {formatRupiah(group.subtotal)}
                          </td>
                          {!isReadOnly && <td></td>}
                        </tr>
                      </React.Fragment>
                    ))
                  )}

                  <tr style={{ background: "var(--surface-subtle)", fontWeight: "800" }}>
                    <td colSpan={2}>TOTAL AKTIVA</td>
                    <td style={{ textAlign: "right", color: "var(--primary)", fontSize: "14px" }}>
                      {formatRupiah(totalAktiva)}
                    </td>
                    {!isReadOnly && <td></td>}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* II. SISI KANAN: PASSIVA */}
          <div className="neraca-sub-card">
            <h4 className="neraca-section-title">II. PASSIVA (KEWAJIBAN &amp; SUMBER DANA)</h4>
            <div className="table-responsive-desktop">
              <table className="portal-table neraca-table">
                <thead>
                  <tr>
                    <th style={{ width: "60px" }}>Kode</th>
                    <th>Uraian Komponen</th>
                    <th style={{ textAlign: "right" }}>Jumlah (Rp)</th>
                    {!isReadOnly && <th style={{ textAlign: "center", width: "80px" }}>Aksi</th>}
                  </tr>
                </thead>
                <tbody>
                  {passivaGroups.length === 0 ? (
                    <tr>
                      <td colSpan={!isReadOnly ? 4 : 3} style={{ textAlign: "center", padding: "28px 16px", color: "var(--text-muted)", fontSize: "13px" }}>
                        Belum ada data komponen passiva untuk periode ini.
                      </td>
                    </tr>
                  ) : (
                    passivaGroups.map((group, gIdx) => (
                      <React.Fragment key={gIdx}>
                        <tr className="neraca-group-header">
                          <td colSpan={!isReadOnly ? 4 : 3}>{group.title}</td>
                        </tr>
                        {group.items && group.items.length > 0 ? (
                          group.items.map((item, iIdx) => (
                            <tr key={iIdx}>
                              <td><code>{item.code || "-"}</code></td>
                              <td>
                                {item.name}
                                {item.is_auto && (
                                  <span style={{ fontSize: "10px", color: "#64748b", marginLeft: "6px" }}>(Otomatis)</span>
                                )}
                              </td>
                              <td style={{ textAlign: "right", fontWeight: "700" }}>{formatRupiah(item.amount)}</td>
                              {!isReadOnly && (
                                <td style={{ textAlign: "center" }}>
                                  {!item.is_auto ? (
                                    <div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
                                      <button
                                        type="button"
                                        onClick={() => handleOpenEditModal(item)}
                                        className="btn-edit-cell"
                                        title="Edit Baris"
                                      >
                                        <IconEdit size={13} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteItem(item)}
                                        className="btn-delete-cell"
                                        title="Hapus Baris"
                                      >
                                        <IconTrash size={13} />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      className="btn-goto-shortcut"
                                      onClick={() => handleShortcutNavigation(item)}
                                      title="Buka Modul Terkait"
                                    >
                                      <IconExternalLink size={12} />
                                      <span>Kelola</span>
                                    </button>
                                  )}
                                </td>
                              )}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={!isReadOnly ? 4 : 3} style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "12px", padding: "10px" }}>
                              (Tidak ada rincian)
                            </td>
                          </tr>
                        )}
                        <tr style={{ background: "var(--surface-subtle)", fontStyle: "italic", fontSize: "12px" }}>
                          <td colSpan={2} style={{ paddingLeft: "16px", fontWeight: "600" }}>
                            Subtotal {group.title}
                          </td>
                          <td style={{ textAlign: "right", fontWeight: "700" }}>
                            {formatRupiah(group.subtotal)}
                          </td>
                          {!isReadOnly && <td></td>}
                        </tr>
                      </React.Fragment>
                    ))
                  )}

                  <tr style={{ background: "var(--surface-subtle)", fontWeight: "800" }}>
                    <td colSpan={2}>TOTAL PASSIVA</td>
                    <td style={{ textAlign: "right", color: "var(--primary)", fontSize: "14px" }}>
                      {formatRupiah(totalPassiva)}
                    </td>
                    {!isReadOnly && <td></td>}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: TAMBAH / UBAH BARIS MANUAL NERACA KONSOLIDASI */}
      {showModal && createPortal(
        <div className="modal-backdrop-custom" onClick={() => setShowModal(false)}>
          <div className="modal-card-custom" style={{ maxWidth: "580px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-custom">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div className="modal-header-icon-circle">
                  <IconEdit size={18} color="currentColor" />
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>
                    {editItem ? "Ubah Baris Neraca Konsolidasi" : "Tambah Baris Neraca Konsolidasi"}
                  </h3>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "2px 0 0 0" }}>
                    {editItem ? editItem.name : "Format Rinci Hierarkis (A, B, C...)"}
                  </p>
                </div>
              </div>
              <button className="btn-close-modal" onClick={() => setShowModal(false)} title="Tutup">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitModal}>
              <div className="modal-body-custom">
                {formError && (
                  <div style={{ background: "#fef2f2", color: "#b91c1c", padding: "10px 14px", borderRadius: "6px", fontSize: "12px", marginBottom: "14px", border: "1px solid #fecaca" }}>
                    {formError}
                  </div>
                )}

                <div className="form-grid-2col">
                  <div className="form-group">
                    <label className="form-label">Sisi Neraca</label>
                    <CustomDropdown
                      value={side}
                      onChange={(e) => {
                        const s = e.target.value;
                        setSide(s);
                        setSubCat(s === "aktiva" ? "harta_lancar" : "kewajiban");
                      }}
                      options={[
                        { value: "aktiva", label: "Aktiva (Kekayaan / Aset / Biaya)" },
                        { value: "passiva", label: "Passiva (Kewajiban / Dana / Ekuitas)" },
                      ]}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Sub Kategori (Grup)</label>
                    <CustomDropdown
                      value={subCat}
                      onChange={(e) => setSubCat(e.target.value)}
                      options={
                        side === "aktiva"
                          ? [
                              { value: "harta_lancar", label: "A. Harta Lancar (Kas Tunai, Kas Bank, Piutang)" },
                              { value: "biaya_biaya", label: "B. Realisasi Pengeluaran Tiap Pos Program" },
                            ]
                          : [
                              { value: "kewajiban", label: "A. Kewajiban (Hutang ke Pihak Lain)" },
                              { value: "sumber_dana", label: "B. Sumber Dana Tiap Pos" },
                            ]
                      }
                    />
                  </div>
                </div>

                <div className="form-grid-2col">
                  <div className="form-group">
                    <label className="form-label">Kode Singkat (Opsional)</label>
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Contoh: INV / GDG / D.C"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nama Uraian Baris</label>
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Contoh: Gedung Asrama Santri Baru"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-grid-2col">
                  <div className="form-group">
                    <label className="form-label">Saldo Bulan Lalu (Rp)</label>
                    <input
                      className="form-control"
                      type="number"
                      placeholder="0"
                      value={amountPrev}
                      onChange={(e) => setAmountPrev(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mutasi Bulan Ini (Rp)</label>
                    <input
                      className="form-control"
                      type="number"
                      placeholder="0"
                      value={amountCurr}
                      onChange={(e) => setAmountCurr(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ background: "var(--surface-subtle)", padding: "10px 14px", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Total Saldo Akhir Komponen:</span>
                  <strong style={{ fontSize: "14px", color: "var(--primary)" }}>
                    {formatRupiah((parseFloat(amountPrev) || 0) + (parseFloat(amountCurr) || 0))}
                  </strong>
                </div>
              </div>

              <div className="modal-footer-custom">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)} disabled={isSubmitting}>
                  Batal
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? "Menyimpan..." : (editItem ? "Simpan Perubahan" : "Simpan ke Neraca Konsolidasi")}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
