import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../config";
import "./MiPerfil.css";
import { useNavigate } from "react-router-dom";

const ChangePasswordModal = ({ isOpen, onClose, token }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      return setError("Las nuevas contraseñas no coinciden.");
    }
    if (newPassword.length < 6) {
      return setError("La nueva contraseña debe tener al menos 6 caracteres.");
    }

    setLoading(true);
    try {
      await axios.put(
        `${API_URL}/api/usuarios/password`,
        { currentPassword, newPassword },
        { headers: { token_usuario: token } }
      );
      setSuccess("Contraseña actualizada correctamente.");
      setTimeout(() => {
        onClose();
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setSuccess("");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.mensaje || "Error al cambiar la contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pwd-modal-overlay" onClick={onClose}>
      <div className="pwd-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="pwd-modal-close" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <h2 className="pwd-modal-title">Cambiar contraseña</h2>
        
        {error && <div className="alert-message error">{error}</div>}
        {success && <div className="alert-message success">{success}</div>}

        <form onSubmit={handleSubmit} className="perfil-form">
          <div className="form-group">
            <label>Contraseña actual</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              placeholder="Ingresa tu contraseña actual"
            />
          </div>
          <div className="form-group">
            <label>Nueva contraseña</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="Mínimo 6 caracteres"
              minLength={6}
            />
          </div>
          <div className="form-group">
            <label>Confirmar nueva contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Vuelve a ingresar la nueva contraseña"
              minLength={6}
            />
          </div>
          <div className="pwd-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Guardando..." : "Actualizar contraseña"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const MiPerfil = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    photoURL: "",
    createdAt: null
  });
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null); // { type: 'success' | 'error', msg: '' }
  const [isPwdModalOpen, setIsPwdModalOpen] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        navigate("/login");
        return;
      }
      setToken(storedToken);

      try {
        const res = await axios.get(`${API_URL}/api/verify-token`, {
          headers: { token_usuario: storedToken }
        });

        const storedPhotoURL = localStorage.getItem("photoURL");
        const user = res.data.user;

        // Si tenemos photoURL, asumimos que es usuario de Google
        if (storedPhotoURL) {
          setIsGoogleUser(true);
        }

        setUserData({
          nombre: user.nombre || "",
          apellido: user.apellido || "",
          correo: user.correo || "",
          telefono: user.telefono || "",
          photoURL: storedPhotoURL || "",
          createdAt: user.createdAt || null
        });
      } catch (err) {
        console.error("Error validando sesión:", err);
        localStorage.clear();
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setAlert(null);

    try {
      const res = await axios.put(
        `${API_URL}/api/usuarios/perfil`,
        {
          nombre: userData.nombre,
          apellido: userData.apellido,
          telefono: userData.telefono
        },
        { headers: { token_usuario: token } }
      );

      // Actualizar localStorage con nuevos datos (nombre, apellido)
      const newUserData = res.data.usuario;
      localStorage.setItem("user", JSON.stringify(newUserData));
      localStorage.setItem("token", res.data.token);

      setAlert({ type: "success", msg: "Perfil actualizado correctamente." });
    } catch (err) {
      setAlert({ type: "error", msg: err.response?.data?.mensaje || "Error al actualizar el perfil." });
    } finally {
      setSaving(false);
      // Auto-ocultar alerta
      setTimeout(() => setAlert(null), 4000);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const getInitials = () => {
    const n = userData.nombre?.charAt(0) || "";
    const a = userData.apellido?.charAt(0) || "";
    return (n + a).toUpperCase() || "U";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Desconocida";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "Desconocida";
    return d.toLocaleDateString("es-PY", { month: "long", year: "numeric" });
  };

  if (loading) {
    return (
      <div className="mi-perfil-page">
        <div style={{ textAlign: "center", padding: "40px" }}>Cargando información del perfil...</div>
      </div>
    );
  }

  return (
    <div className="mi-perfil-page">
      <div className="perfil-page-header">
        <h1>Mi Perfil</h1>
        <p className="perfil-subtitle">Gestiona tu información personal y de contacto</p>
      </div>

      <div className="perfil-top-card">
        <div className="perfil-avatar-container">
          {userData.photoURL ? (
            <img src={userData.photoURL} alt="Perfil" referrerPolicy="no-referrer" />
          ) : (
            <span className="perfil-initials">{getInitials()}</span>
          )}
        </div>
        <div className="perfil-info">
          <h2 className="perfil-name">{`${userData.nombre} ${userData.apellido}`.trim() || "Usuario"}</h2>
          <p className="perfil-email">{userData.correo}</p>
          <p className="perfil-member-since">
            Miembro desde {formatDate(userData.createdAt)}
          </p>
        </div>
      </div>

      <div className="perfil-form-card">
        <h3 className="perfil-form-title">Datos Personales</h3>

        {alert && (
          <div className={`alert-message ${alert.type}`}>
            {alert.type === 'success' ? (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            )}
            {alert.msg}
          </div>
        )}

        <form className="perfil-form" onSubmit={handleSaveProfile}>
          <div className="form-row">
            <div className="form-group">
              <label>Nombre</label>
              <input
                type="text"
                name="nombre"
                value={userData.nombre}
                onChange={handleInputChange}
                required
                placeholder="Tu nombre"
              />
            </div>
            <div className="form-group">
              <label>Apellido</label>
              <input
                type="text"
                name="apellido"
                value={userData.apellido}
                onChange={handleInputChange}
                required
                placeholder="Tu apellido"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Correo electrónico</label>
              <input
                type="email"
                value={userData.correo}
                readOnly
                disabled
              />
            </div>
            <div className="form-group">
              <label>Número de teléfono</label>
              <input
                type="tel"
                name="telefono"
                value={userData.telefono}
                onChange={handleInputChange}
                placeholder="Ej. +595 9XX XXX XXX"
              />
            </div>
          </div>

          <div className="perfil-actions">
            <button type="button" className="btn-danger" onClick={handleLogout}>
              Cerrar sesión
            </button>
            
            {!isGoogleUser && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsPwdModalOpen(true)}
              >
                Cambiar contraseña
              </button>
            )}
            
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>

      <ChangePasswordModal
        isOpen={isPwdModalOpen}
        onClose={() => setIsPwdModalOpen(false)}
        token={token}
      />
    </div>
  );
};

export default MiPerfil;
