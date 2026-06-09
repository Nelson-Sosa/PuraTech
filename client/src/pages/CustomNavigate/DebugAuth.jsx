import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../config";
import { auth, googleProvider } from "../../firebase/config";
import { signInWithPopup } from "firebase/auth";
import jwtDecode from "jwt-decode";

/**
 * Página de diagnóstico de autenticación.
 * Solo para uso en desarrollo. Acceder en: /debug-auth
 */
const DebugAuth = () => {
  const [logs, setLogs] = useState([]);
  const [lsState, setLsState] = useState({});
  const [loading, setLoading] = useState(false);

  const addLog = (msg, type = "info") => {
    const ts = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { msg, type, ts }]);
  };

  const refreshLS = () => {
    setLsState({
      token: localStorage.getItem("token") || "❌ NO EXISTE",
      rol: localStorage.getItem("rol") || "❌ NO EXISTE",
      user: localStorage.getItem("user") || "❌ NO EXISTE",
      photoURL: localStorage.getItem("photoURL") || "(vacío)",
    });
  };

  useEffect(() => {
    refreshLS();
  }, []);

  const clearLS = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("rol");
    localStorage.removeItem("user");
    localStorage.removeItem("photoURL");
    refreshLS();
    addLog("🗑️ localStorage limpiado", "warn");
  };

  const testBackend = async () => {
    setLoading(true);
    addLog("📡 Testeando conexión al backend...", "info");
    try {
      const res = await axios.get(`${API_URL}/api/categories`);
      addLog(`✅ Backend OK. Status: ${res.status}. Categorías: ${res.data?.length || 0}`, "ok");
    } catch (err) {
      addLog(`❌ Backend ERROR: ${err.message}. Status: ${err.response?.status}`, "error");
    }
    setLoading(false);
  };

  const testGoogleLogin = async () => {
    setLoading(true);
    setLogs([]);
    addLog("═══ INICIO TEST GOOGLE LOGIN ═══", "info");

    // PASO 1: Firebase
    let firebaseUser = null;
    let idToken = null;
    try {
      addLog("PASO 1: Llamando signInWithPopup...", "info");
      const result = await signInWithPopup(auth, googleProvider);
      firebaseUser = result.user;
      addLog(`✅ PASO 1 OK: uid=${firebaseUser.uid} email=${firebaseUser.email}`, "ok");
    } catch (err) {
      addLog(`❌ PASO 1 FALLÓ: ${err.code} — ${err.message}`, "error");
      setLoading(false);
      return;
    }

    // PASO 2: idToken
    try {
      addLog("PASO 2: Obteniendo idToken...", "info");
      idToken = await firebaseUser.getIdToken();
      addLog(`✅ PASO 2 OK: idToken starts with: ${idToken.substring(0, 40)}...`, "ok");
    } catch (err) {
      addLog(`❌ PASO 2 FALLÓ: ${err.message}`, "error");
      setLoading(false);
      return;
    }

    // PASO 3: Construir payload
    const payload = {
      uid: firebaseUser.uid,
      nombre: firebaseUser.displayName?.split(" ")[0] || "Usuario",
      apellido: firebaseUser.displayName?.split(" ").slice(1).join(" ") || "",
      email: firebaseUser.email,
      photoURL: firebaseUser.photoURL || "",
      idToken,
    };
    addLog(`PASO 3: Payload: ${JSON.stringify({ ...payload, idToken: "..." })}`, "info");

    // PASO 4: Llamar backend
    let backendData = null;
    try {
      addLog(`PASO 4: POST ${API_URL}/api/auth/google`, "info");
      const res = await axios.post(`${API_URL}/api/auth/google`, payload);
      backendData = res.data;
      addLog(`✅ PASO 4 OK: Status ${res.status}. Response: ${JSON.stringify(backendData).substring(0, 200)}`, "ok");
    } catch (err) {
      const errDetail = err.response?.data
        ? JSON.stringify(err.response.data)
        : err.message;
      addLog(`❌ PASO 4 FALLÓ: HTTP ${err.response?.status} — ${errDetail}`, "error");
      setLoading(false);
      return;
    }

    // PASO 5: Verificar token
    if (!backendData?.token) {
      addLog(`❌ PASO 5 FALLÓ: backendData.token es undefined. Data: ${JSON.stringify(backendData)}`, "error");
      setLoading(false);
      return;
    }
    addLog(`✅ PASO 5 OK: Token recibido: ${backendData.token.substring(0, 40)}...`, "ok");

    // PASO 6: Decodificar y guardar
    try {
      addLog("PASO 6: Guardando en localStorage...", "info");
      const decoded = jwtDecode(backendData.token);
      addLog(`  Decoded: ${JSON.stringify(decoded)}`, "info");

      localStorage.setItem("token", backendData.token);
      localStorage.setItem("rol", decoded.rol);
      if (backendData.usuario) {
        localStorage.setItem("user", JSON.stringify(backendData.usuario));
      }
      if (payload.photoURL) {
        localStorage.setItem("photoURL", payload.photoURL);
      }
      refreshLS();
      addLog(`✅ PASO 6 OK: localStorage guardado. rol=${decoded.rol}`, "ok");
    } catch (err) {
      addLog(`❌ PASO 6 FALLÓ: ${err.message}`, "error");
      setLoading(false);
      return;
    }

    addLog("═══ TEST COMPLETO ✅ ═══", "ok");
    addLog("Podés ir a / para verificar que la sesión persiste", "ok");
    setLoading(false);
  };

  const colorMap = {
    info: "#a0c4ff",
    ok: "#b7f5a0",
    warn: "#ffe599",
    error: "#ff9999",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f0f1a",
      color: "#e0e0e0",
      fontFamily: "monospace",
      padding: "24px",
      boxSizing: "border-box"
    }}>
      <h1 style={{ color: "#7c3aed", marginBottom: "4px" }}>🔐 Debug Auth Panel</h1>
      <p style={{ color: "#666", marginBottom: "24px", fontSize: "13px" }}>
        Esta página solo existe para diagnóstico. Eliminala en producción.
      </p>

      {/* Estado de localStorage */}
      <div style={{ background: "#1a1a2e", padding: "16px", borderRadius: "8px", marginBottom: "16px", border: "1px solid #333" }}>
        <h3 style={{ color: "#60a5fa", margin: "0 0 12px 0" }}>📦 Estado actual de localStorage</h3>
        {Object.entries(lsState).map(([k, v]) => (
          <div key={k} style={{ marginBottom: "6px" }}>
            <span style={{ color: "#94a3b8" }}>{k}: </span>
            <span style={{ color: v.startsWith("❌") ? "#f87171" : "#4ade80", wordBreak: "break-all" }}>
              {k === "token" && v !== "❌ NO EXISTE" ? `${v.substring(0, 50)}...` : v}
            </span>
          </div>
        ))}
        <button onClick={refreshLS} style={btnStyle("#334155")}>🔄 Refrescar</button>
        <button onClick={clearLS} style={{ ...btnStyle("#7f1d1d"), marginLeft: "8px" }}>🗑️ Limpiar localStorage</button>
      </div>

      {/* Acciones */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
        <button
          onClick={testBackend}
          disabled={loading}
          style={btnStyle("#1d4ed8")}
        >
          📡 Test conexión backend
        </button>
        <button
          onClick={testGoogleLogin}
          disabled={loading}
          style={btnStyle("#15803d")}
        >
          🚀 Test Google Login completo
        </button>
        <button
          onClick={() => setLogs([])}
          style={btnStyle("#334155")}
        >
          🗑️ Limpiar logs
        </button>
        <a href="/" style={{ ...btnStyle("#7c3aed"), textDecoration: "none" }}>
          🏠 Ir a Home
        </a>
      </div>

      {/* Logs */}
      <div style={{
        background: "#0a0a14",
        border: "1px solid #222",
        borderRadius: "8px",
        padding: "16px",
        minHeight: "200px",
        maxHeight: "500px",
        overflowY: "auto"
      }}>
        <h3 style={{ color: "#60a5fa", margin: "0 0 12px 0" }}>📋 Logs en tiempo real</h3>
        {logs.length === 0 && (
          <p style={{ color: "#555" }}>Presioná alguna acción para ver los logs aquí...</p>
        )}
        {logs.map((log, i) => (
          <div key={i} style={{ marginBottom: "4px", fontSize: "13px" }}>
            <span style={{ color: "#555" }}>[{log.ts}] </span>
            <span style={{ color: colorMap[log.type] || "#e0e0e0" }}>{log.msg}</span>
          </div>
        ))}
      </div>

      <p style={{ marginTop: "16px", color: "#555", fontSize: "12px" }}>
        URL: {API_URL}/api/auth/google
      </p>
    </div>
  );
};

const btnStyle = (bg) => ({
  background: bg,
  color: "#fff",
  border: "none",
  padding: "10px 16px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "14px",
  fontFamily: "monospace"
});

export default DebugAuth;
