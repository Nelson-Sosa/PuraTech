import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./UserProfileButton.tailwind.css";

const ShieldIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const AdminDot = () => (
  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-indigo-500 rounded-full ring-2 ring-white" />
);

const AdminBadge = ({ onLogout }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();

  const photoURL = localStorage.getItem("photoURL");

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
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

  const Svg = ({ children }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
      {children}
    </svg>
  );

  const items = [
    { label: "Agregar Producto", path: "/agregar/product", icon: <Svg><path d="M12 5v14M5 12h14" /></Svg> },
    { label: "Agregar Proveedor", path: "/add/suppliers", icon: <Svg><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></Svg> },
    { label: "Agregar Categoría", path: "/add/category", icon: <Svg><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></Svg> },
    { label: "Ver Categorías", path: "/categories", icon: <Svg><path d="M4 6h16M4 10h16M4 14h16M4 18h16" /></Svg> },
    { label: "Ver Pedidos", path: "/orders", icon: <Svg><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></Svg> },
    { label: "Ver Clientes", path: "/clients", icon: <Svg><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /></Svg> },
    { label: "Inventario", path: "/inventory", icon: <Svg><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></Svg> },
  ];

  return (
    <div className="relative" ref={menuRef}>
      {/* ── Trigger Button ── */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="
          flex items-center gap-2
          md:px-3 md:py-1.5 md:rounded-full md:bg-white md:border md:border-gray-200
          md:hover:border-gray-300 md:hover:shadow-sm
          md:transition-all md:duration-200 md:ease-out
          min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0
          items-center justify-center md:justify-start
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2
          rounded-full
        "
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Menú de administración"
      >
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {photoURL ? (
            <div className="relative">
              <img
                src={photoURL}
                alt="Admin"
                className="w-10 h-10 rounded-full object-cover ring-1 ring-black/5 shadow-sm"
              />
              <AdminDot />
            </div>
          ) : (
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center ring-1 ring-black/5 shadow-sm">
                <ShieldIcon className="w-5 h-5 text-gray-500" />
              </div>
              <AdminDot />
            </div>
          )}
        </div>

        {/* Admin label */}
        <span className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-indigo-700">
          Admin
        </span>

        {/* Chevron */}
        <svg
          className="
            hidden md:block w-4 h-4 text-indigo-400 flex-shrink-0
            transition-transform duration-200 ease-out
          "
          style={{ transform: open ? "rotate(180deg)" : undefined }}
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
          transition-all duration-200 ease-out z-50
          ${open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-2 pointer-events-none"
          }
        `}
        role="menu"
        aria-label="Panel de administración"
      >
        {/* ── Header ── */}
        <div className="px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              {photoURL ? (
                <div className="relative">
                  <img
                    src={photoURL}
                    alt="Admin"
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-md"
                  />
                  <AdminDot />
                </div>
              ) : (
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center ring-2 ring-white shadow-md">
                    <ShieldIcon className="w-5 h-5 text-gray-500" />
                  </div>
                  <AdminDot />
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Panel de Administración</p>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">Gestión completa del sistema</p>
            </div>
          </div>
        </div>

        {/* ── Items ── */}
        <nav className="py-1.5" aria-label="Enlaces de administración">
          {items.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              onClick={() => setOpen(false)}
              className={`
                flex items-center gap-3.5 px-5 py-2.5 mx-2 rounded-xl
                text-sm font-medium transition-all duration-150
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
                ${isActive(item.path)
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }
              `}
              role="menuitem"
              aria-current={isActive(item.path) ? "page" : undefined}
            >
              <span className={`
                flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg transition-colors duration-150
                ${isActive(item.path)
                  ? "bg-indigo-100 text-indigo-600"
                  : "bg-gray-100 text-gray-500"
                }
              `}>
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* ── Logout ── */}
        <div className="border-t border-gray-100 mt-1 px-5 py-2">
          <button
            onClick={() => { setOpen(false); if (onLogout) onLogout(); }}
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

export default AdminBadge;
