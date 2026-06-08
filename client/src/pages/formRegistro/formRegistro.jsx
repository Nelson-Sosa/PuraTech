import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import './formRegistro.css';
import { API_URL } from '../../config';
import { signInWithGoogle, onGoogleRedirectResult } from "../../services/firebaseAuth";

const FormRegistro = () => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [edad, setEdad] = useState('');
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [confirContraseña, setConfirContraseña] = useState('');
  const [rol, setRol] = useState('usuario');
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const navegar = useNavigate();

  useEffect(() => {
    setGoogleLoading(true);
    const unsubscribe = onGoogleRedirectResult(async (userData) => {
      try {
        const res = await axios.post(`${API_URL}/api/auth/google`, userData);
        const datos = res.data;
        localStorage.setItem("token", datos.token);
        const jwtDecode = (await import("jwt-decode")).default;
        const decodificar = jwtDecode(datos.token);
        localStorage.setItem("rol", decodificar.rol);
        if (userData.photoURL) {
          localStorage.setItem("photoURL", userData.photoURL);
        }
        setSuccessMsg("¡Cuenta creada con Google! Redirigiendo...");
        setTimeout(() => { window.location.href = "/"; }, 1200);
      } catch (err) {
        console.error("Google auth error:", err);
        setError({ general: err.response?.data?.mensaje || "Error al autenticar con Google." });
      } finally {
        setGoogleLoading(false);
      }
    });
    return unsubscribe;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newError = {};
    if (nombre.length < 3) newError.nombre = "Nombre debe tener al menos 3 caracteres";
    if (!/^[a-zA-ZÀ-ÿ0-9\s]+$/.test(nombre)) newError.nombre = "Nombre solo puede contener letras y números";
    if (apellido.length < 3) newError.apellido = "Apellido debe tener al menos 3 caracteres";
    if (!/^[a-zA-ZÀ-ÿ0-9\s]+$/.test(apellido)) newError.apellido = "Apellido solo puede contener letras y números";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) newError.correo = "Correo inválido";
    if (contraseña.length < 5) newError.contraseña = "Contraseña debe tener al menos 5 caracteres";
    if (contraseña !== confirContraseña) newError.confirContraseña = "Las contraseñas no coinciden";
    setError(newError);
    if (Object.keys(newError).length === 0) {
      setLoading(true);
      setSuccessMsg("");
      try {
        await axios.post(`${API_URL}/api/agregar/usuario`, {
          nombre, apellido, edad, correo, contraseña, rol
        });
        setSuccessMsg("¡Cuenta creada correctamente! Redirigiendo...");
        setTimeout(() => navegar('/login'), 1500);
      } catch (err) {
        const msg = err.response?.data?.error || err.response?.data?.mensaje || "Error al registrar usuario";
        setError({ general: msg });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogleRegister = async () => {
    setError({});
    setGoogleLoading(true);
    try {
      const userData = await signInWithGoogle();
      if (!userData) return;
      const res = await axios.post(`${API_URL}/api/auth/google`, userData);
      const datos = res.data;
      localStorage.setItem("token", datos.token);
      const jwtDecode = (await import("jwt-decode")).default;
      const decodificar = jwtDecode(datos.token);
      localStorage.setItem("rol", decodificar.rol);
      if (userData.photoURL) {
        localStorage.setItem("photoURL", userData.photoURL);
      }
      setSuccessMsg("¡Cuenta creada con Google! Redirigiendo...");
      setTimeout(() => { window.location.href = "/"; }, 1200);
    } catch (err) {
      console.error("Google register error:", err);
      if (err.code === "auth/popup-closed-by-user") {
        setError({ general: "Ventana cerrada. Intenta de nuevo." });
      } else if (err.code === "auth/cancelled-popup-request") {
        setError({ general: "Solicitud cancelada." });
      } else if (err.code === "auth/api-key-not-valid" || err.message?.includes("API key not valid") || err.code === "auth/invalid-api-key") {
        setError({ general: "Servicio de Google no disponible en este momento." });
      } else if (err.code?.startsWith("auth/") || err.message?.includes("Firebase")) {
        setError({ general: "Servicio de Google no disponible en este momento." });
      } else {
        setError({ general: err.response?.data?.mensaje || "Error al autenticar con Google." });
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="contRegistro">
      <div className="registro-card">
        <h1>Crear cuenta</h1>
        <p className="registro-subtitle">Únete a PuraTech</p>

        <button
          className="google-btn"
          onClick={handleGoogleRegister}
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

        {error.general && <div className="error-message">{error.general}</div>}
        {successMsg && <div className="success-message">{successMsg}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Nombre</label>
              <input type="text" placeholder="Ej. Juan" value={nombre}
                onChange={(e) => setNombre(e.target.value)} />
              {error.nombre && <div className="error-text">{error.nombre}</div>}
            </div>
            <div className="form-group">
              <label>Apellido</label>
              <input type="text" placeholder="Ej. Pérez" value={apellido}
                onChange={(e) => setApellido(e.target.value)} />
              {error.apellido && <div className="error-text">{error.apellido}</div>}
            </div>
          </div>

          <div className="form-group">
            <label>Edad</label>
            <input type="number" placeholder="Tu edad" value={edad}
              onChange={(e) => setEdad(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Correo electrónico</label>
            <input type="email" placeholder="nombre@ejemplo.com" value={correo}
              onChange={(e) => setCorreo(e.target.value)} />
            {error.correo && <div className="error-text">{error.correo}</div>}
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input type="password" placeholder="Mínimo 5 caracteres" value={contraseña}
              onChange={(e) => setContraseña(e.target.value)} />
            {error.contraseña && <div className="error-text">{error.contraseña}</div>}
          </div>

          <div className="form-group">
            <label>Confirmar contraseña</label>
            <input type="password" placeholder="Repite tu contraseña" value={confirContraseña}
              onChange={(e) => setConfirContraseña(e.target.value)} />
            {error.confirContraseña && <div className="error-text">{error.confirContraseña}</div>}
          </div>

          <div className="form-group">
            <label>Rol</label>
            <select value={rol} onChange={(e) => setRol(e.target.value)}>
              <option value="usuario">Usuario Estándar</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <button className="btn-registro" type="submit" disabled={loading}>
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>

          <div className="form-footer">
            ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormRegistro;
