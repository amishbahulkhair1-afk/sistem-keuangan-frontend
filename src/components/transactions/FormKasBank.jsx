import { IconPlusCircle, IconCheckCircle } from "../../Icons";
import CustomDropdown from "../common/CustomDropdown";
import CustomDatePicker from "../common/CustomDatePicker";

export default function FormKasBank({
  txMessage,
  handleSimpanTx,
  tglTx,
  setTglTx,
  jenisTx,
  setJenisTx,
  metodeTx,
  setMetodeTx,
  accounts,
  kategoriTx,
  setKategoriTx,
  categories,
  donaturTx,
  setDonaturTx,
  nominalTx,
  setNominalTx,
  ketTx,
  setKetTx,
  setFotoTx
}) {
  return (
    <div className="desktop-panel">
      <div className="panel-header">
        <div>
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <IconPlusCircle size={18} color="var(--primary)" /> Catat Transaksi Kas & Bank
          </h3>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            Input penerimaan donasi atau realisasi pengeluaran pos program.
          </p>
        </div>
      </div>
      {txMessage && <div className={`alert-box alert-${txMessage.type}`}>{txMessage.text}</div>}

      <form onSubmit={handleSimpanTx}>
        <div className="form-grid-2col">
          <div className="form-group">
            <label className="form-label">Tanggal Transaksi</label>
            <CustomDatePicker value={tglTx} onChange={e => setTglTx(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Jenis Transaksi</label>
            <CustomDropdown
              value={jenisTx}
              onChange={e => setJenisTx(e.target.value)}
              options={[
                { value: "income", label: "Donasi Masuk (Penerimaan)" },
                { value: "expense", label: "Pengeluaran Pos (Realisasi)" }
              ]}
            />
          </div>
        </div>

        <div className="form-grid-2col">
          <div className="form-group">
            <label className="form-label">Metode Pembayaran / Rekening</label>
            <CustomDropdown
              value={metodeTx}
              onChange={e => setMetodeTx(e.target.value)}
              options={accounts.map(a => ({
                value: a.id,
                label: a.name
              }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Pos Program Tujuan</label>
            <CustomDropdown
              value={kategoriTx}
              onChange={e => setKategoriTx(e.target.value)}
              searchable={categories.filter(c => c.is_active).length > 5}
              searchPlaceholder="Cari pos..."
              options={categories.filter(c => c.is_active).map(c => ({
                value: c.id,
                label: `[${c.code}] ${c.name}`
              }))}
              required
            />
          </div>
        </div>

        <div className="form-grid-2col">
          <div className="form-group">
            <label className="form-label">{jenisTx === "income" ? "Nama Donatur / Penyumbang" : "Penerima Dana / Keperluan"}</label>
            <input className="form-control" type="text" placeholder="Contoh: H. Ahmad Mansur" value={donaturTx} onChange={e => setDonaturTx(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Nominal (Rp)</label>
            <input className="form-control" type="number" placeholder="500000" value={nominalTx} onChange={e => setNominalTx(e.target.value)} required />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Keterangan Tambahan</label>
          <input className="form-control" type="text" placeholder="Keperluan alokasi..." value={ketTx} onChange={e => setKetTx(e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">Foto Bukti Nota / Transfer (Opsional)</label>
          <input className="form-control" type="file" accept="image/*" onChange={e => setFotoTx(e.target.files[0])} />
        </div>

        <button type="submit" className="btn-primary-action">
          <IconCheckCircle size={18} color="white" />
          <span>Simpan ke Jurnal Transaksi</span>
        </button>
      </form>
    </div>
  );
}
