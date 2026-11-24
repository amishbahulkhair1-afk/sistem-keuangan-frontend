import React, { useRef } from "react";
import { IconDownload, IconZap, IconRefresh } from "../../Icons";

export default function ImportQris({
  qrisMessage,
  handleUploadQris,
  setFileQris,
  isImporting,
  handleReallocateQris,
  isReallocating,
}) {
  const fileInputRef = useRef(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    await handleUploadQris(e);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>
      <div className="desktop-panel">
        <div className="panel-header">
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <IconDownload size={18} color="var(--primary)" /> Import Transaksi QRIS Excel
          </h3>
        </div>
        {qrisMessage && <div className={`alert-box alert-${qrisMessage.type}`}>{qrisMessage.text}</div>}
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label className="form-label">Pilih File Spreadsheet (.xlsx / .xls)</label>
            <input
              ref={fileInputRef}
              className="form-control"
              type="file"
              accept=".xlsx,.xls"
              onChange={e => setFileQris(e.target.files[0])}
              required
            />
          </div>
          <button type="submit" className="btn-primary-action" disabled={isImporting}>
            <IconZap size={18} color="white" />
            <span>{isImporting ? "Memproses Data Transaksi..." : "Proses & Ekstrak Transaksi QRIS"}</span>
          </button>
        </form>
      </div>

      {handleReallocateQris && (
        <div className="desktop-panel" style={{ background: "var(--surface-subtle)" }}>
          <div className="panel-header">
            <h4 style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: "700" }}>
              <IconRefresh size={16} color="var(--primary)" /> Sinkronkan / Petakan Ulang Alokasi QRIS
            </h4>
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: "1.5", margin: "0 0 14px 0" }}>
            Jika Anda baru saja memperbarui atau melengkapi <strong>Kode Digit QRIS</strong> pada menu <em>Master Pos Program</em>, gunakan fitur ini untuk memeriksa dan memetakan kembali seluruh transaksi QRIS yang telah tersimpan di database agar pos programnya otomatis sesuai dengan digit terbarunya.
          </p>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleReallocateQris}
            disabled={isReallocating}
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontWeight: "600" }}
          >
            <IconRefresh size={16} />
            <span>{isReallocating ? "Sedang Memetakan Ulang..." : "Petakan Ulang Alokasi Transaksi QRIS"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
