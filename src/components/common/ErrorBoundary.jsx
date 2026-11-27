import React, { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: "36px 24px",
            background: "#ffffff",
            borderRadius: "12px",
            border: "1px solid #fee2e2",
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
            margin: "24px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>⚠️</div>
          <h3 style={{ margin: "0 0 8px 0", color: "#991b1b", fontSize: "18px", fontWeight: "700" }}>
            Terjadi Kendala Memuat Komponen
          </h3>
          <p style={{ margin: "0 0 16px 0", color: "#64748b", fontSize: "13px" }}>
            Sistem mendeteksi kesalahan: <code>{this.state.error?.message || "Kesalahan tidak terduga"}</code>
          </p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            <button
              type="button"
              onClick={this.handleReset}
              className="btn-primary"
              style={{ padding: "8px 18px", fontSize: "13px", borderRadius: "6px" }}
            >
              🔄 Coba Muat Ulang
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="btn-secondary"
              style={{ padding: "8px 18px", fontSize: "13px", borderRadius: "6px", background: "white" }}
            >
              Refresh Halaman
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
