import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useWishlist } from "../../context/WishlistContext";
import "./UserProfileButton.tailwind.css";

const UserIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const UserProfileButton = ({ onLogout }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();
  const { count: wishlistCount } = useWishlist();

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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const isActive = (path) => location.pathname === path;

  const items = [
    {
      label: "Mi Cuenta",
      path: "/",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
    {
      label: "Mis Pedidos",
      path: "/orders",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      ),
    },
    {
      label: "Favoritos",
      path: "/wishlist",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ),
      badge: wishlistCount,
    },
    {
      label: "Configuración",
      path: "/",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      {/* ── Trigger Button ── */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-full
          bg-gray-100 md:bg-white border border-gray-300 md:border-gray-200
          ${open
            ? "md:border-blue-200 md:bg-blue-50/60 shadow-sm border-blue-300 bg-blue-50/60"
            : "hover:border-gray-400 hover:bg-gray-200 md:hover:border-gray-300 md:hover:bg-gray-50 hover:shadow-sm"
          }
          transition-all duration-200 ease-out
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
        `}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`Menú de usuario: ${fullName}`}
      >
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {photoURL ? (
            <img
              src={photoURL}
              alt={fullName}
              className="w-9 h-9 rounded-lg object-cover md:ring-2 md:ring-white shadow-sm"
            />
          ) : (
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-sm">
              <span className="text-white font-semibold text-sm leading-none select-none">{initial}</span>
            </div>
          )}
        </div>

        {/* Name (hidden on < 768px) */}
        <span className="hidden md:block text-sm font-medium text-gray-800 truncate max-w-[110px]">
          {fullName}
        </span>

        {/* Chevron */}
        <svg
          className={`
            hidden md:block w-4 h-4 text-gray-400 flex-shrink-0
            transition-transform duration-200 ease-out
            ${open ? "rotate-180" : ""}
          `}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* ── Dropdown Menu ── */}
      <div
        className={`
          absolute right-0 top-full mt-2 w-72
          bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.1),0_8px_20px_rgba(0,0,0,0.06)]
          border border-gray-100
          overflow-hidden
          transition-all duration-200 ease-out
          ${open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-2 pointer-events-none"
          }
        `}
        role="menu"
        aria-label="Opciones de cuenta"
      >
        {/* ── Header ── */}
        <div className="flex items-start gap-3.5 px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex-shrink-0">
            {photoURL ? (
              <img
                src={photoURL}
                alt={fullName}
                className="w-11 h-11 rounded-xl object-cover ring-2 ring-white shadow-md"
              />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-md ring-2 ring-white">
                <span className="text-white font-bold text-base leading-none select-none">{initial}</span>
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{fullName}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
              <span className="text-[11px] font-semibold text-emerald-600 tracking-wide">Usuario Verificado</span>
            </div>
            <p className="text-[11px] text-gray-400 font-medium mt-0.5">Gestiona tu cuenta</p>
          </div>
        </div>

        {/* ── Items ── */}
        <nav className="py-1.5" aria-label="Menú de cuenta">
          {items.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              onClick={() => setOpen(false)}
              className={`
                flex items-center gap-3.5 px-5 py-2.5 mx-2 rounded-xl
                text-sm font-medium transition-all duration-150
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                ${isActive(item.path)
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }
              `}
              role="menuitem"
              aria-current={isActive(item.path) ? "page" : undefined}
            >
              <span className={`
                flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg transition-colors duration-150
                ${isActive(item.path)
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                }
              `}>
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              {item.badge > 0 && (
                <span className="flex-shrink-0 min-w-[22px] h-[22px] flex items-center justify-center px-1.5 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white text-[11px] font-bold shadow-sm shadow-red-500/20">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* ── Divider + Logout ── */}
        <div className="border-t border-gray-100 mt-1 px-5 py-2">
          <button
            onClick={() => {
              setOpen(false);
              if (onLogout) onLogout();
            }}
            className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl w-full text-sm font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            role="menuitem"
            aria-label="Cerrar sesión"
          >
            <span className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-red-50 text-red-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </span>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileButton;
