import { IconBook, IconRefresh } from "../../Icons";
import { formatRupiah, formatPosNameShort } from "../../utils/formatters";

export default function BukuPembantu({ bukuBantuData, fetchBukuBantu }) {
  return (
    <div className="desktop-panel">
      <div className="panel-header">
        <div>
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <IconBook size={18} color="var(--primary)" />
            <span className="text-full">Buku Pembantu Saldo Program Donasi</span>
            <span className="text-compact">Buku Pembantu Saldo</span>
          </h3>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
            <span className="text-full">Periode: {bukuBantuData?.periode} • Pondok Pesantren Annuqayah Latee</span>
            <span className="text-compact">Periode: {bukuBantuData?.periode}</span>
          </p>
        </div>
        <button className="btn-primary-small" onClick={fetchBukuBantu} title="Refresh Data">
          <IconRefresh size={15} />
          <span className="btn-label-text">Refresh Data</span>
        </button>
      </div>

      <div className="table-responsive-desktop">
        <table className="portal-table">
          <thead>
            <tr>
              <th>
                <span className="text-full">Nama Pos Program</span>
                <span className="text-compact">Pos Program</span>
              </th>
              <th style={{ textAlign: "right" }}>
                <span className="text-full">Saldo Bulan Lalu</span>
                <span className="text-compact">Saldo Lalu</span>
              </th>
              <th style={{ textAlign: "right" }}>
                <span className="text-full">Mutasi Masuk</span>
                <span className="text-compact">Masuk</span>
              </th>
              <th style={{ textAlign: "right" }}>
                <span className="text-full">Mutasi Keluar</span>
                <span className="text-compact">Keluar</span>
              </th>
              <th style={{ textAlign: "right" }}>
                <span className="text-full">Saldo Akhir Riil</span>
                <span className="text-compact">Saldo Akhir</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {bukuBantuData?.rows?.map(r => (
              <tr key={r.pos_id}>
                <td style={{ fontWeight: "700" }}>
                  <span className="text-full">{r.nama_pos}</span>
                  <span className="text-compact" title={r.nama_pos}>{formatPosNameShort(r.nama_pos)}</span>
                </td>
                <td style={{ textAlign: "right" }}>{formatRupiah(r.saldo_bulan_lalu)}</td>
                <td style={{ textAlign: "right", color: "var(--success-text)", fontWeight: "600" }}>{formatRupiah(r.mutasi_masuk_bulan_ini)}</td>
                <td style={{ textAlign: "right", color: "var(--danger-text)", fontWeight: "600" }}>{formatRupiah(r.mutasi_keluar_bulan_ini)}</td>
                <td style={{ textAlign: "right", fontWeight: "800", color: "var(--primary)" }}>{formatRupiah(r.saldo_akhir)}</td>
              </tr>
            ))}
            <tr style={{ background: "var(--surface-subtle)", fontWeight: "800" }}>
              <td>
                <span className="text-full">TOTAL KESELURUHAN</span>
                <span className="text-compact">TOTAL</span>
              </td>
              <td style={{ textAlign: "right" }}>{formatRupiah(bukuBantuData?.totals?.total_saldo_lalu)}</td>
              <td style={{ textAlign: "right", color: "var(--success-text)" }}>{formatRupiah(bukuBantuData?.totals?.total_mutasi_masuk)}</td>
              <td style={{ textAlign: "right", color: "var(--danger-text)" }}>{formatRupiah(bukuBantuData?.totals?.total_mutasi_keluar)}</td>
              <td style={{ textAlign: "right", color: "var(--primary)", fontSize: "14px" }}>{formatRupiah(bukuBantuData?.totals?.total_saldo_akhir)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
