import React, { useState } from "react";
import {
  IconWallet,
  IconTrendingUp,
  IconTrendingDown,
  IconLayers,
  IconPlusCircle,
  IconCheckCircle,
  IconRefresh,
  IconTrash
} from "../../Icons";
import { formatRupiah } from "../../utils/formatters";
import CustomDropdown from "../common/CustomDropdown";
import CustomDatePicker from "../common/CustomDatePicker";
import TableActionMenu from "../common/TableActionMenu";

export default function PosTransaksiKas({
  currentScopedPos,
  selectedPosScope,
  posTxSummary,
  debtsRecap,
  posTxMsg,
  posTxFormTgl,
  setPosTxFormTgl,
  posTxFormCatType,
  setPosTxFormCatType,
  posTxFormType,
  setPosTxFormType,
  posTxFormAmount,
  setPosTxFormAmount,
  posTxFormParty,
  setPosTxFormParty,
  posTxMatId,
  setPosTxMatId,
  posTxMatName,
  setPosTxMatName,
  posTxMatBrand,
  setPosTxMatBrand,
  posTxMatUnit,
  setPosTxMatUnit,
  posTxMatQty,
  setPosTxMatQty,
  posTxMatPrice,
  setPosTxMatPrice,
  posTxFormDesc,
  setPosTxFormDesc,
  materialsList,
  neracaPosData,
  handleSimpanPosTx,
  posTxList,
  handleHapusPosTx,
  fetchPosTransactions,
  fetchDebts
}) {
  const [tableFontSize, setTableFontSize] = useState("compact");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (fetchPosTransactions) await fetchPosTransactions(selectedPosScope);
    if (fetchDebts) await fetchDebts(selectedPosScope);
    setIsRefreshing(false);
  };
  // Ambil pos-pos dinamis dari neraca pos jika tersedia
  const neracaBiayaItems = neracaPosData?.aktiva?.biaya_operasional || [];
  const neracaHutangItems = neracaPosData?.passiva?.kewajiban || [];
  const neracaModalItems = neracaPosData?.passiva?.modal_dan_pendapatan || [];

  // Deteksi apakah kategori transaksi yang dipilih berkaitan dengan Material / Belanja Barang
  const selectedItem = neracaBiayaItems.find(
    b => (b.code && b.code === posTxFormCatType) || (b.name && b.name === posTxFormCatType)
  );
  const isMaterialCategory =
    posTxFormCatType === "belanja_material" ||
    posTxFormCatType?.toLowerCase() === "m" ||
    posTxFormCatType?.toLowerCase().includes("material") ||
    posTxFormCatType?.toLowerCase().includes("barang") ||
    posTxFormCatType?.toLowerCase().includes("logistik") ||
    selectedItem?.name?.toLowerCase().includes("material") ||
    selectedItem?.name?.toLowerCase().includes("barang") ||
    selectedItem?.code?.toLowerCase() === "m";

  return (
    <div className="pos-transaksi-blade-layout">
      {/* Ringkasan Kas & Arus Dana Pos + Rekap Hutang/Piutang */}
      <div className="blade-stats-grid" style={{ marginBottom: "20px" }}>
        <div className="blade-card emerald group">
          <div className="blade-card-top-bar emerald"></div>
          <div className="blade-card-inner">
            <div>
              <p className="blade-card-label">Sisa Kas Operasional Pos</p>
              <h3 className="blade-card-value" style={{ color: "#0284c7" }}>
                {formatRupiah(posTxSummary?.saldo_kas_pos)}
              </h3>
              <p className="blade-card-desc">Dana siap pakai untuk operasional pos {currentScopedPos?.code}</p>
            </div>
            <div className="blade-card-icon emerald"><IconWallet size={24} color="white" /></div>
          </div>
        </div>

        <div className="blade-card blue group">
          <div className="blade-card-top-bar blue"></div>
          <div className="blade-card-inner">
            <div>
              <p className="blade-card-label">Total Dana Masuk / Alokasi Pusat</p>
              <h3 className="blade-card-value" style={{ color: "#0284c7" }}>
                {formatRupiah(posTxSummary?.total_income)}
              </h3>
              <p className="blade-card-desc">Termasuk penerimaan kas & pinjaman dana</p>
            </div>
            <div className="blade-card-icon blue"><IconTrendingUp size={24} color="white" /></div>
          </div>
        </div>

        <div className="blade-card red group">
          <div className="blade-card-top-bar red"></div>
          <div className="blade-card-inner">
            <div>
              <p className="blade-card-label">Realisasi Belanja & Pengeluaran</p>
              <h3 className="blade-card-value" style={{ color: "#dc2626" }}>
                {formatRupiah(posTxSummary?.total_expense)}
              </h3>
              <p className="blade-card-desc">Material, upah, cicilan hutang & operasional</p>
            </div>
            <div className="blade-card-icon red"><IconTrendingDown size={24} color="white" /></div>
          </div>
        </div>

        <div className="blade-card amber group">
          <div className="blade-card-top-bar amber"></div>
          <div className="blade-card-inner">
            <div>
              <p className="blade-card-label">Sisa Kewajiban Hutang</p>
              <h3 className="blade-card-value" style={{ color: "#b45309" }}>
                {formatRupiah(debtsRecap?.total_sisa_hutang || 0)}
              </h3>
              <p className="blade-card-desc">Piutang Pos: {formatRupiah(debtsRecap?.total_sisa_piutang || 0)}</p>
            </div>
            <div className="blade-card-icon amber"><IconLayers size={24} color="white" /></div>
          </div>
        </div>
      </div>

      <div className="desktop-2col-grid">
        {/* FORM INPUT PENCATATAN TRANSAKSI POS TERPADU */}
        <div className="desktop-panel">
          <div className="panel-header">
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <IconPlusCircle size={18} color="var(--primary)" /> Catat Transaksi Kas Pos ({currentScopedPos?.code})
            </h3>
          </div>
          {posTxMsg && <div className={`alert-box alert-${posTxMsg.type}`}>{posTxMsg.text}</div>}

          <form onSubmit={handleSimpanPosTx}>
            <div className="form-grid-2col">
              <div className="form-group">
                <label className="form-label">Tanggal Transaksi</label>
                <CustomDatePicker
                  value={posTxFormTgl}
                  onChange={e => setPosTxFormTgl(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Kategori Aliran Transaksi Kas (Neraca Pos)</label>
                <CustomDropdown
                  value={posTxFormCatType}
                  onChange={e => {
                    const val = e.target.value;
                    setPosTxFormCatType(val);
                    if (
                      val === "hutang_pinjam" ||
                      val === "piutang_bayar" ||
                      val === "alokasi_pusat" ||
                      val === "pendapatan_pos_langsung" ||
                      val.startsWith("passiva_")
                    ) {
                      setPosTxFormType("income");
                    } else {
                      setPosTxFormType("expense");
                    }
                  }}
                  searchable={true}
                  searchPlaceholder="Cari kategori kas..."
                  options={[
                    { value: "hutang_bayar", label: "Hutang: Bayar Cicilan / Pelunasan (Kas Keluar)", badge: "Pengeluaran" },
                    { value: "piutang_pinjam", label: "Piutang: Memberi Pinjaman ke Pihak Lain (Kas Keluar)", badge: "Pengeluaran" },
                    ...neracaBiayaItems.map((b) => ({
                      value: b.code || b.name,
                      label: `[${b.code}] ${b.name}`,
                      badge: "Aktiva / Biaya"
                    })),
                    { value: "alokasi_pusat", label: "Alokasi Kas dari Donasi Pusat (DONASI)", badge: "Pemasukan" },
                    { value: "pendapatan_pos_langsung", label: "Penerimaan Langsung Pos / Donasi Pos", badge: "Pemasukan" },
                    { value: "hutang_pinjam", label: "Hutang: Terima Pinjaman Dana (Kas Masuk)", badge: "Pemasukan" },
                    { value: "piutang_bayar", label: "Piutang: Terima Pembayaran Piutang (Kas Masuk)", badge: "Pemasukan" },
                    ...neracaModalItems.map((m) => ({
                      value: m.code || m.name,
                      label: `[${m.code}] ${m.name}`,
                      badge: "Passiva / Modal"
                    }))
                  ]}
                />
              </div>
            </div>

            {/* Grid Jenis Arus Kas & Nominal (Hanya tampil jika BUKAN kategori Material) */}
            {!isMaterialCategory ? (
              <div className="form-grid-2col">
                <div className="form-group">
                  <label className="form-label">Jenis Arus Kas</label>
                  <CustomDropdown
                    value={posTxFormType}
                    onChange={e => setPosTxFormType(e.target.value)}
                    options={[
                      { value: "expense", label: "Kas Keluar (Pengeluaran / Bayar Hutang / Kasbon)" },
                      { value: "income", label: "Kas Masuk (Penerimaan / Pinjam Dana / Terima Piutang)" }
                    ]}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Nominal Transaksi (Rp)</label>
                  <input
                    className="form-control"
                    type="number"
                    placeholder="500000"
                    value={posTxFormAmount}
                    onChange={e => setPosTxFormAmount(e.target.value)}
                    required
                  />
                </div>
              </div>
            ) : null}

            <div className="form-group">
              <label className="form-label">
                {posTxFormCatType.startsWith("hutang") || posTxFormCatType.startsWith("piutang")
                  ? "Nama Pihak / Lembaga Terkait (Hutang / Piutang)"
                  : isMaterialCategory
                    ? "Toko / Supplier / Tempat Pembelian"
                    : posTxFormType === "expense"
                      ? "Penerima Dana / Toko / Pekerja"
                      : "Sumber Dana / Penyetor"}
              </label>
              <input
                className="form-control"
                type="text"
                placeholder={isMaterialCategory ? "Contoh: Toko Bangunan Berkah / TB Sumber Rejeki" : "Contoh: Toko Bangunan Berkah / Kak Affan / Tukang Pak Mat"}
                value={posTxFormParty}
                onChange={e => setPosTxFormParty(e.target.value)}
                required={posTxFormCatType.startsWith("hutang") || posTxFormCatType.startsWith("piutang")}
              />
            </div>

            {/* Input Material / Logistik Lapangan Otomatis (Tampil saat kategori Material) */}
            {isMaterialCategory && (
              <div
                style={{
                  background: "#f0f9ff",
                  padding: "16px",
                  borderRadius: "8px",
                  border: "1px solid #bae6fd",
                  marginBottom: "16px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <label className="form-label" style={{ color: "#0369a1", fontWeight: "700", marginBottom: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                    📦 Rincian Belanja Material (Otomatis Masuk Stok & Arus Kas)
                  </label>
                  {materialsList && materialsList.length > 0 && (
                    <span style={{ fontSize: "11px", color: "#0284c7" }}>
                      Tersedia {materialsList.length} jenis di katalog pos
                    </span>
                  )}
                </div>

                <div className="form-grid-2col" style={{ marginBottom: "12px" }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: "12px", color: "#0369a1", fontWeight: "600" }}>
                      Nama Material / Barang <span style={{ color: "#e11d48" }}>*</span>
                    </label>
                    <input
                      className="form-control"
                      type="text"
                      list="pos-material-datalist"
                      placeholder="Contoh: Semen / Pasir / Besi 10"
                      value={posTxMatName}
                      onChange={e => {
                        const val = e.target.value;
                        setPosTxMatName(val);
                        const matched = materialsList?.find(m => m.name.toLowerCase() === val.toLowerCase());
                        if (matched) {
                          setPosTxMatId(matched.id);
                          if (matched.unit) setPosTxMatUnit(matched.unit);
                          if (matched.unit_price) {
                            setPosTxMatPrice(matched.unit_price);
                            if (posTxMatQty) {
                              setPosTxFormAmount(String(parseFloat(posTxMatQty) * parseFloat(matched.unit_price)));
                            }
                          }
                        } else {
                          setPosTxMatId("");
                        }
                      }}
                      required
                    />
                    <datalist id="pos-material-datalist">
                      {materialsList?.map(m => (
                        <option key={m.id} value={m.name}>
                          [{m.code}] Sisa Stok: {m.current_stock} {m.unit} | Rp {Number(m.unit_price || 0).toLocaleString("id-ID")}
                        </option>
                      ))}
                    </datalist>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: "12px", color: "#0369a1", fontWeight: "600" }}>
                      Merek / Spesifikasi (Opsional)
                    </label>
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Contoh: Merah Putih / Gresik / Ulir"
                      value={posTxMatBrand}
                      onChange={e => setPosTxMatBrand(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-grid-3col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.3fr", gap: "10px" }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: "12px", color: "#0369a1", fontWeight: "600" }}>
                      Jumlah (Qty) <span style={{ color: "#e11d48" }}>*</span>
                    </label>
                    <input
                      className="form-control"
                      type="number"
                      step="any"
                      placeholder="Contoh: 10"
                      value={posTxMatQty}
                      onChange={e => {
                        const q = e.target.value;
                        setPosTxMatQty(q);
                        if (q && posTxFormAmount) {
                          const qtyNum = parseFloat(q);
                          const totNum = parseFloat(posTxFormAmount);
                          if (qtyNum > 0 && totNum > 0) {
                            setPosTxMatPrice(String(totNum / qtyNum));
                          }
                        }
                      }}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: "12px", color: "#0369a1", fontWeight: "600" }}>
                      Satuan
                    </label>
                    <CustomDropdown
                      value={posTxMatUnit}
                      onChange={e => setPosTxMatUnit(e.target.value)}
                      size="sm"
                      options={[
                        { value: "Sak", label: "Sak" },
                        { value: "Pcs", label: "Pcs / Batang" },
                        { value: "Dump", label: "Dump / Truk" },
                        { value: "Pick up", label: "Pick up / Kol" },
                        { value: "Kg", label: "Kg" },
                        { value: "Meter", label: "Meter" },
                        { value: "Kaleng", label: "Kaleng / Galon" },
                        { value: "Dos", label: "Dos / Kotak" },
                        { value: "Lembar", label: "Lembar" },
                        { value: "Unit", label: "Unit / Buah" },
                      ]}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: "12px", color: "#0369a1", fontWeight: "600" }}>
                      Total Belanja (Rp) <span style={{ color: "#e11d48" }}>*</span>
                    </label>
                    <input
                      className="form-control"
                      type="number"
                      placeholder="Contoh: 1000000"
                      value={posTxFormAmount}
                      onChange={e => {
                        const tot = e.target.value;
                        setPosTxFormAmount(tot);
                        if (tot && posTxMatQty) {
                          const qtyNum = parseFloat(posTxMatQty);
                          const totNum = parseFloat(tot);
                          if (qtyNum > 0 && totNum > 0) {
                            setPosTxMatPrice(String(totNum / qtyNum));
                          }
                        }
                      }}
                      required
                    />
                  </div>
                </div>

                {/* Ringkasan Harga Satuan yang Otomatis Terhitung */}
                {posTxMatQty && posTxFormAmount && parseFloat(posTxMatQty) > 0 && (
                  <div style={{ marginTop: "12px", padding: "10px 14px", background: "#e0f2fe", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "13px", color: "#0369a1", fontWeight: "600" }}>
                      Estimasi Harga per {posTxMatUnit || "Satuan"} ({formatRupiah(parseFloat(posTxFormAmount))} ÷ {posTxMatQty} {posTxMatUnit}):
                    </span>
                    <strong style={{ fontSize: "15px", color: "#0c4a6e" }}>
                      {formatRupiah(parseFloat(posTxFormAmount) / parseFloat(posTxMatQty))} / {posTxMatUnit || "Satuan"}
                    </strong>
                  </div>
                )}
              </div>
            )}

            {/* Uraian Transaksi (Hanya tampil jika BUKAN kategori Material) */}
            {!isMaterialCategory && (
              <div className="form-group">
                <label className="form-label">Uraian / Keterangan Transaksi</label>
                <input
                  className="form-control"
                  type="text"
                  placeholder="Contoh: Upah tukang 3 hari / Pinjaman talangan operasional"
                  value={posTxFormDesc}
                  onChange={e => setPosTxFormDesc(e.target.value)}
                  required
                />
              </div>
            )}

            <button type="submit" className="btn-primary-action">
              <IconCheckCircle size={18} color="white" />
              <span>Simpan ke Kas Pos ({currentScopedPos?.code})</span>
            </button>
          </form>
        </div>

        {/* TABEL MUTASI KAS POS */}
        <div className="desktop-panel">
          <div className="panel-header">
            <div>
              <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <IconWallet size={18} color="var(--primary)" /> Mutasi Kas Pos ({posTxList.length})
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                Seluruh arus kas pos termasuk alokasi donasi, belanja, hutang & piutang.
              </p>
            </div>
            <TableActionMenu
              onRefresh={handleRefresh}
              isRefreshing={isRefreshing}
              fontSize={tableFontSize}
              onFontSizeChange={setTableFontSize}
            />
          </div>

          <div className={`table-responsive-desktop table-font-${tableFontSize}`}>
            <table className={`portal-table table-font-${tableFontSize}`}>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Kategori</th>
                  <th>Uraian & Pihak</th>
                  <th style={{ textAlign: "right" }}>Nominal</th>
                  <th style={{ textAlign: "center" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {posTxList.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "24px", color: "var(--text-muted)" }}>
                      Belum ada transaksi tercatat untuk pos {currentScopedPos?.name}.
                    </td>
                  </tr>
                ) : (
                  posTxList.map(t => {
                    const isDebtOrPiutang = t.category_tx_type?.startsWith("hutang") || t.category_tx_type?.startsWith("piutang");
                    return (
                      <tr key={t.id}>
                        <td><code>{t.transaction_date}</code></td>
                        <td>
                          <span className={`badge-tag ${isDebtOrPiutang ? 'badge-pos' : t.type === 'income' ? 'badge-income' : 'badge-expense'}`}>
                            {t.category_tx_type.replace(/_/g, ' ').toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <strong style={{ display: "block" }}>{t.description}</strong>
                          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                            {t.recipient_or_sender ? `Pihak: ${t.recipient_or_sender}` : ""}
                          </span>
                        </td>
                        <td style={{ textAlign: "right", fontWeight: "700" }} className={t.type === "income" ? "color-income" : "color-expense"}>
                          {t.type === "income" ? `+ ${formatRupiah(t.amount)}` : `- ${formatRupiah(t.amount)}`}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <button
                            type="button"
                            title="Hapus Transaksi"
                            onClick={() => handleHapusPosTx(t)}
                            style={{ background: "#fee2e2", color: "#b91c1c", border: "none", padding: "4px 8px", borderRadius: "6px", cursor: "pointer" }}
                          >
                            <IconTrash size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
