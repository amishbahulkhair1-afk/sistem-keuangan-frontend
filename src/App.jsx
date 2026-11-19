import { useState, useEffect } from "react";
import MobileApp from "./MobileApp";
import DesktopPortal from "./DesktopPortal";
import FontSizeModal, { applySystemFontSize, getSavedSystemFontSize } from "./components/common/FontSizeModal";
import ThemeModal from "./components/common/ThemeModal";
import { getSavedBgTheme, saveBgTheme } from "./components/common/DynamicBackgroundCanvas";
import logoImg from "./assets/logo.jpg";
import "./App.css";

const API_BASE = "/api";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "null"));

  // Sistem Ukuran Font Global
  const [systemFontSize, setSystemFontSize] = useState(getSavedSystemFontSize());
  const [showFontModal, setShowFontModal] = useState(false);

  // Sistem Tema: 'light' (Terang) / 'dark' (Gelap)
  const [theme, setTheme] = useState(localStorage.getItem("app_theme") || "light");

  // Sistem Tema Animasi Latar Belakang (Islamic, Sky Wave, Geometric, Constellation)
  const [bgTheme, setBgTheme] = useState(getSavedBgTheme());
  const [showThemeModal, setShowThemeModal] = useState(false);

  useEffect(() => {
    applySystemFontSize(systemFontSize);
  }, [systemFontSize]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("app_theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute("data-bg-theme", bgTheme);
  }, [bgTheme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  };

  const handleSelectBgTheme = (newBgTheme) => {
    setBgTheme(newBgTheme);
    saveBgTheme(newBgTheme);
  };

  const handleChangeFontSize = (newSize) => {
    setSystemFontSize(newSize);
    applySystemFontSize(newSize);
  };

  // Mode Antarmuka: 'mobile' (Aplikasi HP) atau 'desktop' (Portal Web Komputer)
  // Otomatis deteksi lebar layar awal
  const [viewMode, setViewMode] = useState(
    localStorage.getItem("viewMode") || (window.innerWidth < 768 ? "mobile" : "desktop")
  );

  // Auth States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState(null);

  const handleLogin = (e) => {
    e.preventDefault();
    setAuthError(null);
    fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.token) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          setToken(data.token);
          setUser(data.user);
        } else {
          setAuthError(data.detail || "Login gagal");
        }
      })
      .catch(() => setAuthError("Gagal menghubungi server backend"));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  const switchMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem("viewMode", mode);
  };

  if (!token) {
    return (
      <div className="login-wrapper">
        <div className="login-glass-card">
          <div className="login-header-center">
            <div className="login-logo-circle">
              <img src={logoImg} alt="Logo Donasi Latee" className="app-logo-img" />
            </div>
            <h2 style={{ fontSize: "22px", fontWeight: "800", color: "var(--text-main)", textAlign: "center" }}>Donasi Latee</h2>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px", textAlign: "center" }}>Pondok Pesantren Annuqayah Daerah Latee</p>
          </div>

          {authError && <div className="alert-box alert-danger">{authError}</div>}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email Petugas</label>
              <input className="form-control" type="email" placeholder="nama@annuqayah.test" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Kata Sandi</label>
              <input className="form-control" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn-primary-action">Masuk ke Sistem</button>
          </form>
        </div>
      </div>
    );
  }

  // Render sesuai mode antarmuka
  // Petugas lapangan diwajibkan hanya mengakses Mode HP (Mobile)
  const isPetugasLapangan = user?.role === "petugas_lapangan";
  return (
    <>
      {isPetugasLapangan || viewMode === "mobile" ? (
        <MobileApp
          user={user}
          onLogout={handleLogout}
          onSwitchPortal={() => !isPetugasLapangan && switchMode("desktop")}
          onOpenFontModal={() => setShowFontModal(true)}
          currentFontSize={systemFontSize}
          theme={theme}
          onToggleTheme={toggleTheme}
          bgTheme={bgTheme}
          onOpenThemeModal={() => setShowThemeModal(true)}
        />
      ) : (
        <DesktopPortal
          user={user}
          onLogout={handleLogout}
          onSwitchMobile={() => switchMode("mobile")}
          onOpenFontModal={() => setShowFontModal(true)}
          currentFontSize={systemFontSize}
          theme={theme}
          onToggleTheme={toggleTheme}
          bgTheme={bgTheme}
          onOpenThemeModal={() => setShowThemeModal(true)}
        />
      )}

      {/* Modal Pengaturan Ukuran Font Sistem */}
      <FontSizeModal
        isOpen={showFontModal}
        onClose={() => setShowFontModal(false)}
        currentSize={systemFontSize}
        onSelectSize={handleChangeFontSize}
      />

      {/* Modal Pengaturan Tema & Animasi Latar Belakang */}
      <ThemeModal
        isOpen={showThemeModal}
        onClose={() => setShowThemeModal(false)}
        currentBgTheme={bgTheme}
        onSelectBgTheme={handleSelectBgTheme}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    </>
  );
}

export default App;
