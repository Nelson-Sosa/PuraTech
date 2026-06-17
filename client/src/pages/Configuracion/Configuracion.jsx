import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../config";
import "./Configuracion.css";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase/config";
import { deleteUser } from "firebase/auth";
import { useTheme } from "../../context/ThemeContext";

const Configuracion = () => {
  const navigate = useNavigate();
  const { setTheme } = useTheme();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  // Estados de usuario básicos (solo lectura)
  const [userInfo, setUserInfo] = useState({
    correo: "",
    createdAt: null,
    isGoogleUser: false
  });

  // Configuraciones (mutables)
  const [preferencias, setPreferencias] = useState({
    idioma: "es",
    moneda: "PYG",
    tema: "system"
  });

  const [notificaciones, setNotificaciones] = useState({
    promociones: true,
    pedidos: true,
    novedades: true
  });

  // Modal de eliminación
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    const fetchConfig = async () => {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        navigate("/login");
        return;
      }
      setToken(storedToken);

      try {
        // Obtenemos los datos básicos para lectura del localStorage (ya están allí)
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        const storedPhotoURL = localStorage.getItem("photoURL");
        const isGoogle = !!storedPhotoURL;

        setUserInfo({
          correo: storedUser.correo || "",
          createdAt: storedUser.createdAt || null,
          isGoogleUser: isGoogle
        });

        // Obtener la configuración del servidor
        const res = await axios.get(`${API_URL}/api/usuarios/configuracion`, {
          headers: { token_usuario: storedToken }
        });

        if (res.data.preferencias) setPreferencias(res.data.preferencias);
        if (res.data.notificaciones) setNotificaciones(res.data.notificaciones);

      } catch (err) {
        console.error("Error al cargar configuración:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [navigate]);

  const showAlert = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 4000);
  };

  const saveConfig = async (newPrefs, newNotifs) => {
    setSaving(true);
    try {
      await axios.put(
        `${API_URL}/api/usuarios/configuracion`,
        { preferencias: newPrefs, notificaciones: newNotifs },
        { headers: { token_usuario: token } }
      );
      showAlert("success", "Configuración actualizada correctamente.");
    } catch (err) {
      console.error(err);
      showAlert("error", "Error al guardar la configuración.");
    } finally {
      setSaving(false);
    }
  };

  const handlePrefChange = (e) => {
    const { name, value } = e.target;
    const newPrefs = { ...preferencias, [name]: value };
    setPreferencias(newPrefs);
    saveConfig(newPrefs, notificaciones);
    if (name === 'tema') {
      if (value === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');
      } else {
        setTheme(value);
      }
    }
  };

  const handleNotifChange = (e) => {
    const { name, checked } = e.target;
    const newNotifs = { ...notificaciones, [name]: checked };
    setNotificaciones(newNotifs);
    saveConfig(preferencias, newNotifs);
  };

  const handleLogoutDevice = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const handleDownloadData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      perfil: JSON.parse(localStorage.getItem("user") || "{}"),
      preferencias,
      notificaciones
    }, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "mis_datos_puratech.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleDeleteAccount = async () => {
    setDeleteError("");
    setDeleteLoading(true);

    try {
      // 1. Si es usuario de Google, borrar primero de Firebase
      if (userInfo.isGoogleUser) {
        const user = auth.currentUser;
        if (user) {
          try {
            await deleteUser(user);
          } catch (firebaseErr) {
            if (firebaseErr.code === 'auth/requires-recent-login') {
              setDeleteError("Por seguridad, necesitas volver a iniciar sesión con Google para eliminar tu cuenta.");
              setDeleteLoading(false);
              return;
            }
            throw firebaseErr;
          }
        }
      }

      // 2. Borrar de nuestro backend (MongoDB)
      await axios.delete(`${API_URL}/api/usuarios/cuenta`, {
        headers: { token_usuario: token },
        data: userInfo.isGoogleUser ? {} : { password: deletePassword }
      });

      // 3. Limpiar y redirigir
      localStorage.clear();
      window.location.href = "/";
    } catch (err) {
      console.error(err);
      setDeleteError(err.response?.data?.mensaje || "Error al eliminar la cuenta.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Desconocida";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "Desconocida";
    return d.toLocaleDateString("es-PY", { year: "numeric", month: "long", day: "numeric" });
  };

  if (loading) {
    return (
      <div className="configuracion-page">
        <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>Cargando preferencias...</div>
      </div>
    );
  }

  return (
    <div className="configuracion-page">
      <div className="config-page-header">
        <h1>Configuración</h1>
        <p className="config-subtitle">Gestiona tus preferencias, privacidad y seguridad</p>
      </div>

      {alert && (
        <div className={`config-alert ${alert.type}`}>
          {alert.msg}
        </div>
      )}

      <div className="config-grid">
        
        {/* SECCIÓN 1: SEGURIDAD */}
        <div className="config-card">
          <div className="config-card-header">
            <h2 className="config-card-title">Seguridad</h2>
            <p className="config-card-desc">Administra el acceso a tu cuenta.</p>
          </div>
          <div className="config-section">
            <div className="config-item">
              <div className="config-item-info">
                <h3 className="config-item-title">Método de inicio de sesión</h3>
                <p className="config-item-desc">
                  Actualmente inicias sesión usando {userInfo.isGoogleUser ? "Google" : "Correo y Contraseña"}.
                </p>
              </div>
              <div className="config-item-action">
                <span className={`auth-badge ${userInfo.isGoogleUser ? 'google' : 'local'}`}>
                  {userInfo.isGoogleUser ? "Cuenta de Google" : "Cuenta Local"}
                </span>
              </div>
            </div>

            {!userInfo.isGoogleUser && (
              <div className="config-item border-top">
                <div className="config-item-info">
                  <h3 className="config-item-title">Contraseña</h3>
                  <p className="config-item-desc">Cambia tu contraseña regularmente para mantener tu cuenta segura.</p>
                </div>
                <div className="config-item-action">
                  <button className="btn-outline" onClick={() => navigate('/mi-cuenta/perfil')}>
                    Cambiar contraseña
                  </button>
                </div>
              </div>
            )}

            <div className="config-item border-top">
              <div className="config-item-info">
                <h3 className="config-item-title">Sesiones activas</h3>
                <p className="config-item-desc">Cierra la sesión actual en este navegador y dispositivo.</p>
              </div>
              <div className="config-item-action">
                <button className="btn-outline" onClick={handleLogoutDevice}>
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: NOTIFICACIONES */}
        <div className="config-card">
          <div className="config-card-header">
            <h2 className="config-card-title">Notificaciones</h2>
            <p className="config-card-desc">Decide qué correos quieres recibir de nosotros.</p>
          </div>
          <div className="config-section">
            <div className="config-item">
              <div className="config-item-info">
                <h3 className="config-item-title">Promociones y Ofertas</h3>
                <p className="config-item-desc">Recibe descuentos exclusivos y alertas de rebajas.</p>
              </div>
              <div className="config-item-action">
                <label className="toggle-switch">
                  <input type="checkbox" name="promociones" checked={notificaciones.promociones} onChange={handleNotifChange} disabled={saving} />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
            
            <div className="config-item border-top">
              <div className="config-item-info">
                <h3 className="config-item-title">Estado de Pedidos</h3>
                <p className="config-item-desc">Avisos importantes sobre el envío y entrega de tus compras.</p>
              </div>
              <div className="config-item-action">
                <label className="toggle-switch">
                  <input type="checkbox" name="pedidos" checked={notificaciones.pedidos} onChange={handleNotifChange} disabled={saving} />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="config-item border-top">
              <div className="config-item-info">
                <h3 className="config-item-title">Novedades y Lanzamientos</h3>
                <p className="config-item-desc">Entérate antes que nadie de los nuevos productos en PuraTech.</p>
              </div>
              <div className="config-item-action">
                <label className="toggle-switch">
                  <input type="checkbox" name="novedades" checked={notificaciones.novedades} onChange={handleNotifChange} disabled={saving} />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN 3: PREFERENCIAS */}
        <div className="config-card">
          <div className="config-card-header">
            <h2 className="config-card-title">Preferencias</h2>
            <p className="config-card-desc">Personaliza tu experiencia de navegación.</p>
          </div>
          <div className="config-section">
            <div className="config-item">
              <div className="config-item-info">
                <h3 className="config-item-title">Idioma</h3>
                <p className="config-item-desc">El idioma en el que verás la tienda.</p>
              </div>
              <div className="config-item-action">
                <select className="config-select" name="idioma" value={preferencias.idioma} onChange={handlePrefChange} disabled={saving}>
                  <option value="es">Español</option>
                  <option value="en">Inglés (Próximamente)</option>
                </select>
              </div>
            </div>
            
            <div className="config-item border-top">
              <div className="config-item-info">
                <h3 className="config-item-title">Moneda</h3>
                <p className="config-item-desc">La moneda en la que se mostrarán los precios.</p>
              </div>
              <div className="config-item-action">
                <select className="config-select" name="moneda" value={preferencias.moneda} onChange={handlePrefChange} disabled={saving}>
                  <option value="PYG">Guaraníes (Gs.)</option>
                  <option value="USD">Dólares (US$)</option>
                </select>
              </div>
            </div>

            <div className="config-item border-top">
              <div className="config-item-info">
                <h3 className="config-item-title">Tema Visual</h3>
                <p className="config-item-desc">Elige entre modo claro u oscuro.</p>
              </div>
              <div className="config-item-action">
                <select className="config-select" name="tema" value={preferencias.tema} onChange={handlePrefChange} disabled={saving}>
                  <option value="system">Automático (Sistema)</option>
                  <option value="light">Claro</option>
                  <option value="dark">Oscuro</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN 4: INFORMACIÓN DE LA CUENTA */}
        <div className="config-card">
          <div className="config-card-header">
            <h2 className="config-card-title">Información Técnica</h2>
            <p className="config-card-desc">Detalles internos de tu cuenta.</p>
          </div>
          <div className="config-section">
            <div className="config-item">
              <div className="config-item-info">
                <h3 className="config-item-title">Correo Registrado</h3>
                <p className="config-item-desc">{userInfo.correo}</p>
              </div>
            </div>
            <div className="config-item border-top">
              <div className="config-item-info">
                <h3 className="config-item-title">Fecha de Creación</h3>
                <p className="config-item-desc">{formatDate(userInfo.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN 5: PRIVACIDAD (Zona de Peligro) */}
        <div className="config-card" style={{ borderColor: '#fca5a5' }}>
          <div className="config-card-header" style={{ borderBottomColor: '#fee2e2' }}>
            <h2 className="config-card-title" style={{ color: '#dc2626' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Privacidad y Datos
            </h2>
            <p className="config-card-desc">Opciones avanzadas sobre tu información.</p>
          </div>
          <div className="config-section">
            <div className="config-item">
              <div className="config-item-info">
                <h3 className="config-item-title">Descargar mis datos</h3>
                <p className="config-item-desc">Obtén una copia de tu información personal y preferencias en formato JSON.</p>
              </div>
              <div className="config-item-action">
                <button className="btn-outline" onClick={handleDownloadData}>
                  Exportar datos
                </button>
              </div>
            </div>

            <div className="config-item border-top">
              <div className="config-item-info">
                <h3 className="config-item-title" style={{ color: '#dc2626' }}>Eliminar mi cuenta</h3>
                <p className="config-item-desc">
                  Eliminará permanentemente tu cuenta, historial de pedidos y preferencias. Esta acción no se puede deshacer.
                </p>
              </div>
              <div className="config-item-action">
                <button className="btn-destructive-outline" onClick={() => setIsDeleteModalOpen(true)}>
                  Eliminar cuenta
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Modal de Eliminación */}
      {isDeleteModalOpen && (
        <div className="modal-overlay" onClick={() => !deleteLoading && setIsDeleteModalOpen(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title" style={{ color: '#dc2626' }}>¿Eliminar cuenta permanentemente?</h2>
            <p className="modal-text">
              Estás a punto de eliminar tu cuenta de PuraTech. Perderás el acceso a tus pedidos, favoritos y configuración. <strong>Esta acción es irreversible.</strong>
            </p>

            {deleteError && (
              <div className="config-alert error" style={{ marginBottom: '16px' }}>
                {deleteError}
              </div>
            )}

            {!userInfo.isGoogleUser && (
              <div>
                <p className="modal-text" style={{ marginBottom: '8px', fontWeight: 600 }}>
                  Por seguridad, ingresa tu contraseña:
                </p>
                <input 
                  type="password" 
                  className="modal-input" 
                  placeholder="Contraseña actual"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  disabled={deleteLoading}
                />
              </div>
            )}

            <div className="modal-actions">
              <button 
                className="btn-outline" 
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={deleteLoading}
              >
                Cancelar
              </button>
              <button 
                className="btn-destructive" 
                onClick={handleDeleteAccount}
                disabled={deleteLoading || (!userInfo.isGoogleUser && !deletePassword)}
              >
                {deleteLoading ? "Eliminando..." : "Sí, eliminar cuenta"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Configuracion;
