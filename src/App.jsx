import { useState, useEffect } from "react";
import MobileApp from "./MobileApp";
import DesktopPortal from "./DesktopPortal";
import FontSizeModal, { applySystemFontSize, getSavedSystemFontSize } from "./components/common/FontSizeModal";
import ThemeModal from "./components/common/ThemeModal";
import { getSavedBgTheme, saveBgTheme } from "./components/common/DynamicBackgroundCanvas";
import logoImg from "./assets/logo.jpg";
import { API_BASE } from "./utils/formatters";
import "./App.css";

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

  useEffect(() => {
    const handleAuthExpired = () => {
      setToken(null);
      setUser(null);
      setAuthError("Sesi Anda telah berakhir. Silakan login kembali.");
    };
    window.addEventListener("auth-expired", handleAuthExpired);
    return () => window.removeEventListener("auth-expired", handleAuthExpired);
  }, []);

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

  // Validasi awal role akun untuk akses Portal Web (hanya Admin & Pimpinan)
  useEffect(() => {
    if (user) {
      const userRole = user.role;
      const isAllowed = userRole === "admin" || userRole === "admin_keuangan" || userRole === "pimpinan";
      if (!isAllowed) {
        handleLogout();
        setAuthError("Akses Ditolak: Portal web (desktop & mobile) hanya dapat diakses oleh Admin dan Pimpinan. Petugas lapangan wajib login melalui aplikasi Android (APK Donasi Latee).");
      }
    }
  }, [user]);

  // Auth States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState(null);

  const handleLogin = (e) => {
    e.preventDefault();
    setAuthError(null);
    fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "X-Client-Platform": "web",
      },
      body: JSON.stringify({ email, password, client: "web" }),
    })
      .then(async (r) => {
        const data = await r.json();
        return { ok: r.ok, data };
      })
      .then(({ ok, data }) => {
        if (data.token) {
          const userRole = data.user?.role;
          const isAllowed = userRole === "admin" || userRole === "admin_keuangan" || userRole === "pimpinan";
          if (!isAllowed) {
            setAuthError("Akses Ditolak: Portal web (desktop & mobile) hanya dapat diakses oleh Admin dan Pimpinan. Petugas lapangan wajib login melalui aplikasi Android (APK Donasi Latee).");
            return;
          }
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
    fetch(`${API_BASE}/logout`, { method: "POST" }).catch(() => {});
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
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              marginTop: "10px",
              padding: "4px 12px",
              background: "rgba(2, 132, 199, 0.10)",
              borderRadius: "16px",
              fontSize: "11px",
              fontWeight: "600",
              color: "var(--brand-primary, #0284c7)"
            }}>
              <span>🏛️ Portal Web Khusus Admin & Pimpinan</span>
            </div>
          </div>

          {authError && <div className="alert-box alert-danger">{authError}</div>}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email Petugas</label>
              <input
                id="login-email"
                className="form-control"
                type="email"
                placeholder="nama@annuqayah.test"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Kata Sandi</label>
              <input
                id="login-password"
                className="form-control"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <button type="submit" className="btn-primary-action">Masuk ke Sistem</button>

            <div style={{
              marginTop: "16px",
              padding: "10px 14px",
              background: "var(--bg-muted, #f8fafc)",
              borderRadius: "12px",
              fontSize: "11px",
              color: "var(--text-muted)",
              lineHeight: "1.4",
              border: "1px dashed var(--border-color, #e2e8f0)",
              textAlign: "center"
            }}>
              ℹ️ <strong>Ketentuan Akses:</strong> Portal Web ini (Desktop & Mobile Browser) hanya dapat diakses oleh <strong>Admin Keuangan</strong> dan <strong>Pimpinan</strong>. Petugas lapangan wajib login melalui <strong>Aplikasi Android (APK Donasi Latee)</strong>.
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Render sesuai mode antarmuka (Desktop / Mobile) untuk Admin dan Pimpinan
  return (
    <>
      {viewMode === "mobile" ? (
        <MobileApp
          user={user}
          onLogout={handleLogout}
          onSwitchPortal={() => switchMode("desktop")}
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
