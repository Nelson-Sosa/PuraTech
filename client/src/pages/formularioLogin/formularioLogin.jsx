import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import './formularioLogin.css';
import jwtDecode from "jwt-decode";
import { API_URL } from '../../config';
import { signInWithGoogle, onGoogleRedirectResult } from "../../services/firebaseAuth";

const FormularioLogin = ({ setLogin }) => {
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navegacion = useNavigate();

  useEffect(() => {
    onGoogleRedirectResult(async (userData) => {
      setGoogleLoading(true);
      try {
        console.log("[GoogleRedirect] Enviando idToken al backend...");
        const res = await axios.post(`${API_URL}/api/auth/google`, userData);
        const datos = res.data;
        console.log("[GoogleRedirect] Respuesta del backend:", datos);
        if (!datos.token) throw new Error("El backend no retornó un token");
        localStorage.setItem("token", datos.token);
        const decodificar = jwtDecode(datos.token);
        localStorage.setItem("rol", decodificar.rol);
        if (datos.usuario) {
          localStorage.setItem("user", JSON.stringify(datos.usuario));
        }
        if (userData.photoURL) {
          localStorage.setItem("photoURL", userData.photoURL);
        }
        console.log("[GoogleRedirect] ✅ Token guardado, redirigiendo a /");
        setLogin(true);
        window.location.href = "/";
      } catch (err) {
        console.error("[GoogleRedirect] ❌ Error:", err);
        setError(err.response?.data?.mensaje || err.message || "Error al autenticar con Google.");
      } finally {
        setGoogleLoading(false);
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const procesaLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/login`, { correo, contraseña });
      const datos = res.data;
      localStorage.setItem("token", datos.token);
      const decodificar = jwtDecode(datos.token);
      localStorage.setItem("rol", decodificar.rol);
      const userData = datos.usuario || decodificar;
      localStorage.setItem("user", JSON.stringify(userData));
      setLogin(true);
      window.location.href = "/";
    } catch (err) {
      const errorMessage = err.response
        ? (typeof err.response.data === 'string'
          ? err.response.data
          : err.response.data.mensaje || "Credenciales inválidas")
        : "Error de conexión. Intenta de nuevo.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      // PASO 1: Firebase signInWithPopup
      console.log("[GoogleLogin] PASO 1: Iniciando signInWithPopup...");
      const userData = await signInWithGoogle();
      if (!userData) {
        console.warn("[GoogleLogin] signInWithGoogle retornó null (popup bloqueado o redirect iniciado)");
        return;
      }
      console.log("[GoogleLogin] PASO 2: Firebase OK. uid:", userData.uid, "email:", userData.email);
      console.log("[GoogleLogin] PASO 3: idToken obtenido:", userData.idToken ? "✅ SÍ" : "❌ NO");

      // PASO 4: Enviar al backend
      console.log("[GoogleLogin] PASO 4: Enviando al backend /api/auth/google...");
      const res = await axios.post(`${API_URL}/api/auth/google`, userData);
      const datos = res.data;
      console.log("[GoogleLogin] PASO 5: Respuesta del backend:", datos);

      if (!datos.token) {
        throw new Error("El backend no retornó un token JWT");
      }

      // PASO 6: Guardar en localStorage
      localStorage.setItem("token", datos.token);
      const decodificar = jwtDecode(datos.token);
      localStorage.setItem("rol", decodificar.rol);
      if (datos.usuario) {
        localStorage.setItem("user", JSON.stringify(datos.usuario));
      }
      if (userData.photoURL) {
        localStorage.setItem("photoURL", userData.photoURL);
      }
      console.log("[GoogleLogin] PASO 6: ✅ localStorage guardado. Token:", !!localStorage.getItem("token"), "Rol:", localStorage.getItem("rol"));

      // PASO 7: Redirigir
      setLogin(true);
      console.log("[GoogleLogin] PASO 7: Redirigiendo a /");
      window.location.href = "/";
    } catch (err) {
      console.error("[GoogleLogin] ❌ Error completo:", err);
      if (err.code === "auth/popup-closed-by-user") {
        setError("Ventana cerrada. Intenta de nuevo.");
      } else if (err.code === "auth/cancelled-popup-request") {
        setError("Solicitud cancelada.");
      } else if (err.code === "auth/api-key-not-valid" || err.message?.includes("API key not valid") || err.code === "auth/invalid-api-key") {
        setError("Servicio de Google no disponible en este momento.");
      } else if (err.code?.startsWith("auth/") || err.message?.includes("Firebase")) {
        setError("Servicio de Google no disponible en este momento.");
      } else {
        setError(err.response?.data?.mensaje || err.message || "Error al autenticar con Google.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="contLogin">
      <div className="login-brand">PuraTech</div>

      <div className="login-card">
        <h1>Iniciar sesión</h1>

        <button
          className="google-btn"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
        >
          <svg viewBox="0 0 48 48" width="20" height="20">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.54 28.59A14.5 14.5 0 0 1 9.5 24c0-1.59.28-3.14.76-4.59l-7.98-6.19A23.99 23.99 0 0 0 0 24c0 3.77.87 7.35 2.56 10.56l7.98-5.97z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 5.97C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          {googleLoading ? "Conectando..." : "Continuar con Google"}
        </button>

        <div className="divider">
          <span>o</span>
        </div>

        <form onSubmit={procesaLogin}>
          {error && <div className="error-message">{error}</div>}

          <div className="input-group">
            <label htmlFor="correo">Correo electrónico</label>
            <input
              type="email"
              id="correo"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="nombre@ejemplo.com"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="contraseña">Contraseña</label>
            <input
              type="password"
              id="contraseña"
              value={contraseña}
              onChange={(e) => setContraseña(e.target.value)}
              placeholder="Ingresa tu contraseña"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="login-submit-btn">
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>

        <p className="login-footer-text">
          ¿No tienes cuenta? <Link to="/register">Crear cuenta</Link>
        </p>
      </div>
    </div>
  );
};

export default FormularioLogin;
