// Global fetch interceptor to inject Sanctum Bearer token & handle 401
const originalFetch = window.fetch;

window.fetch = async function (resource, config = {}) {
  const url = typeof resource === "string" ? resource : resource?.url || "";
  
  // Deteksi apakah request ditujukan ke API backend
  const isApiRequest =
    url.includes("/api") ||
    (typeof resource === "string" &&
      (resource.startsWith("/api") || resource.startsWith("/backend_donasi/api")));
  const isLoginRequest = url.includes("/login") || url.includes("/auth/login");

  if (isApiRequest && !isLoginRequest) {
    const token = localStorage.getItem("token");
    const headers = new Headers(config.headers || {});
    
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    if (!headers.has("Accept")) {
      headers.set("Accept", "application/json");
    }
    config = { ...config, headers };
  }

  const response = await originalFetch(resource, config);

  // Jika token expired atau unauthenticated, picu event auth-expired
  if (response.status === 401 && isApiRequest && !isLoginRequest) {
    console.warn("Sesi autentikasi telah berakhir atau tidak valid.");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new CustomEvent("auth-expired"));
  }

  return response;
};
