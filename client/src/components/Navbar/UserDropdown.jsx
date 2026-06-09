import { Link, useLocation } from "react-router-dom";
import { useWishlist } from "../../context/WishlistContext";
import "./UserDropdown.css";

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const PackageIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const LogOutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const VerifiedIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const UserDropdown = ({ variant = "dropdown", onItemClick, wishlistCount, onLogout }) => {
  const location = useLocation();

  const userData = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();

  const photoURL = localStorage.getItem("photoURL");
  const fullName = [userData.nombre, userData.apellido].filter(Boolean).join(" ") || "Usuario";
  const initial = (userData.nombre?.[0] || "U").toUpperCase();

  const isActive = (path) => location.pathname === path;

  const handleClick = (path) => {
    if (variant === "sheet" && onItemClick) onItemClick();
  };

  return (
    <div className={`user-dropdown-panel ${variant === "sheet" ? "user-dropdown-panel--sheet" : ""}`}>
      {/* ── Header ── */}
      <div className="udp-header">
        <div className="udp-avatar">
          {photoURL ? (
            <img src={photoURL} alt={fullName} className="udp-avatar-img" />
          ) : (
            <span className="udp-avatar-letter">{initial}</span>
          )}
        </div>
        <div className="udp-header-info">
          <span className="udp-header-name">{fullName}</span>
          <span className="udp-header-badge">
            <VerifiedIcon />
            Usuario Verificado
          </span>
          <span className="udp-header-sub">Gestiona tu cuenta</span>
        </div>
      </div>

      {/* ── Main Items ── */}
      <nav className="udp-nav" aria-label="Menú de cuenta">
        <Link
          to="/"
          className={`udp-item ${isActive("/") ? "udp-item--active" : ""}`}
          onClick={() => handleClick("/")}
          aria-current={isActive("/") ? "page" : undefined}
        >
          <span className="udp-item-icon"><UserIcon /></span>
          <span className="udp-item-label">Mi Cuenta</span>
        </Link>

        <Link
          to="/"
          className={`udp-item ${isActive("/perfil") ? "udp-item--active" : ""}`}
          onClick={() => handleClick("/")}
          aria-current={isActive("/perfil") ? "page" : undefined}
        >
          <span className="udp-item-icon"><UserIcon /></span>
          <span className="udp-item-label">Mi Perfil</span>
        </Link>

        <Link
          to="/orders"
          className={`udp-item ${isActive("/orders") ? "udp-item--active" : ""}`}
          onClick={() => handleClick("/orders")}
          aria-current={isActive("/orders") ? "page" : undefined}
        >
          <span className="udp-item-icon"><PackageIcon /></span>
          <span className="udp-item-label">Mis Pedidos</span>
        </Link>

        <Link
          to="/wishlist"
          className={`udp-item ${isActive("/wishlist") ? "udp-item--active" : ""}`}
          onClick={() => handleClick("/wishlist")}
          aria-current={isActive("/wishlist") ? "page" : undefined}
        >
          <span className="udp-item-icon udp-item-icon--heart"><HeartIcon /></span>
          <span className="udp-item-label">Lista de Deseos</span>
          {wishlistCount > 0 && (
            <span className="udp-badge udp-badge--wishlist">{wishlistCount}</span>
          )}
        </Link>
      </nav>

      {/* ── Settings ── */}
      <div className="udp-divider" />
      <Link
        to="/"
        className="udp-item udp-item--settings"
        onClick={() => handleClick("/")}
      >
        <span className="udp-item-icon"><SettingsIcon /></span>
        <span className="udp-item-label">Configuración</span>
      </Link>

      {/* ── Logout ── */}
      <div className="udp-divider" />
      <button
        className="udp-item udp-item--logout"
        onClick={() => {
          if (onLogout) onLogout();
          if (variant === "sheet" && onItemClick) onItemClick();
        }}
        aria-label="Cerrar sesión"
      >
        <span className="udp-item-icon udp-item-icon--logout-icon"><LogOutIcon /></span>
        <span className="udp-item-label">Cerrar Sesión</span>
      </button>
    </div>
  );
};

export default UserDropdown;
