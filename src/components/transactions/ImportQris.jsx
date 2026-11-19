import { IconDownload, IconZap } from "../../Icons";

export default function ImportQris({
  qrisMessage,
  handleUploadQris,
  setFileQris,
  isImporting
}) {
  return (
    <div className="desktop-panel" style={{ maxWidth: "700px", margin: "0 auto" }}>
      <div className="panel-header">
        <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <IconDownload size={18} color="var(--primary)" /> Import Transaksi QRIS Excel
        </h3>
      </div>
      {qrisMessage && <div className={`alert-box alert-${qrisMessage.type}`}>{qrisMessage.text}</div>}
      <form onSubmit={handleUploadQris}>
        <div className="form-group">
          <label className="form-label">Pilih File Spreadsheet (.xlsx / .xls)</label>
          <input className="form-control" type="file" accept=".xlsx,.xls" onChange={e => setFileQris(e.target.files[0])} required />
        </div>
        <button type="submit" className="btn-primary-action" disabled={isImporting}>
          <IconZap size={18} color="white" />
          <span>{isImporting ? "Memproses Data Transaksi..." : "Proses & Ekstrak Transaksi QRIS"}</span>
        </button>
      </form>
    </div>
  );
}
