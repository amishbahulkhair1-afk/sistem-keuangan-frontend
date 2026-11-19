import { IconCheckCircle, IconScale } from "../../Icons";
import { formatRupiah } from "../../utils/formatters";

export default function LaporanNeracaUmum({ neracaData }) {
  return (
    <div className="neraca-page-wrapper">
      <div className={`reconciliation-card ${neracaData?.reconciliation?.is_balanced ? "balanced" : "unbalanced"}`}>
        <div className="rec-left">
          <div className="rec-badge-icon">
            {neracaData?.reconciliation?.is_balanced ? <IconCheckCircle size={20} /> : <IconScale size={20} />}
          </div>
          <div className="rec-info">
            <span className="rec-label">Status Rekonsiliasi Otomatis</span>
            <strong className="rec-status">{neracaData?.reconciliation?.status}</strong>
          </div>
        </div>
      </div>

      <div className="desktop-panel neraca-panel">
        <div className="neraca-header-box">
          <div className="neraca-tag">Laporan Keuangan Resmi Konsolidasi</div>
          <h2 className="neraca-kop-title">PENGEMBANGAN PEMBANGUNAN PP ANNUQAYAH LATEE</h2>
          <p className="neraca-kop-sub">Guluk-Guluk Sumenep Jawa Timur • {neracaData?.periode}</p>
        </div>

        <div className="desktop-2col-grid neraca-tables-grid">
          <div className="neraca-sub-card">
            <h4 className="neraca-section-title">I. AKTIVA (HARTA LANCAR)</h4>
            <div className="table-responsive-desktop">
              <table className="portal-table neraca-table">
                <tbody>
                  {neracaData?.aktiva?.harta_lancar?.map((h, i) => (
                    <tr key={i}>
                      <td className="neraca-cell-name">{h.nama}</td>
                      <td style={{ textAlign: "right", fontWeight: "700" }}>{formatRupiah(h.saldo)}</td>
                    </tr>
                  ))}
                  <tr style={{ background: "var(--surface-subtle)", fontWeight: "800" }}>
                    <td>TOTAL AKTIVA</td>
                    <td style={{ textAlign: "right", color: "var(--primary)", fontSize: "14px" }}>{formatRupiah(neracaData?.aktiva?.total_aktiva)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="neraca-sub-card">
            <h4 className="neraca-section-title">II. PASSIVA (AKUMULASI DANA PROGRAM)</h4>
            <div className="table-responsive-desktop">
              <table className="portal-table neraca-table">
                <tbody>
                  {neracaData?.passiva?.dana_program?.map(dp => (
                    <tr key={dp.pos_id}>
                      <td className="neraca-cell-name">{dp.nama_pos}</td>
                      <td style={{ textAlign: "right", fontWeight: "700" }}>{formatRupiah(dp.saldo_akhir)}</td>
                    </tr>
                  ))}
                  <tr style={{ background: "var(--surface-subtle)", fontWeight: "800" }}>
                    <td>TOTAL PASSIVA</td>
                    <td style={{ textAlign: "right", color: "var(--primary)", fontSize: "14px" }}>{formatRupiah(neracaData?.passiva?.total_passiva)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
