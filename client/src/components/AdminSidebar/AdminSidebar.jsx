import { Link, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import "../Navbar/UserProfileButton.tailwind.css";

const items = [
  {
    label: "Agregar Producto",
    path: "/agregar/product",
    icon: "M12 5v14m-7-7h14",
  },
  {
    label: "Agregar Proveedor",
    path: "/add/suppliers",
    icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2",
  },
  {
    label: "Agregar Categoría",
    path: "/add/category",
    icon: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z",
  },
  {
    label: "Ver Categorías",
    path: "/categories",
    icon: "M4 6h16M4 10h16M4 14h16M4 18h16",
  },
  {
    label: "Ver Pedidos",
    path: "/orders",
    icon: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z",
  },
  {
    label: "Ver Clientes",
    path: "/clients",
    icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2",
  },
  {
    label: "Inventario",
    path: "/inventory",
    icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  },
];

const AdminIcon = ({ d, active }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-[20px] h-[20px]"
  >
    <path d={d} />
  </svg>
);

const AdminSidebar = ({ open, onClose, onLogout }) => {
  const location = useLocation();
  const sidebarRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const isActive = (path) => location.pathname === path;

  const nav = (
    <nav className="flex flex-col h-full bg-white" aria-label="Panel de administración">
      {/* ── Brand ── */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-gray-100 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-sm flex-shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <span className="text-base font-bold text-gray-900 tracking-tight">Admin Panel</span>
      </div>

      {/* ── Items ── */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        {items.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={`
              flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium
              transition-all duration-150
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
              ${isActive(item.path)
                ? "bg-indigo-50 text-indigo-600 font-semibold"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }
            `}
            aria-current={isActive(item.path) ? "page" : undefined}
          >
            <span className={`
              flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg transition-colors duration-150
              ${isActive(item.path)
                ? "bg-indigo-100 text-indigo-600"
                : "bg-gray-50 text-gray-400 group-hover:bg-gray-100"
              }
            `}>
              <AdminIcon d={item.icon} active={isActive(item.path)} />
            </span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      {/* ── Back to Store ── */}
      <div className="flex-shrink-0 px-3 pb-1">
        <Link
          to="/"
          onClick={onClose}
          className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <span className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-gray-50 text-gray-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </span>
          <span>Volver a la Tienda</span>
        </Link>
      </div>

      {/* ── Logout ── */}
      <div className="flex-shrink-0 border-t border-gray-100 p-3">
        <button
          onClick={onLogout}
          className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl w-full text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          aria-label="Cerrar sesión"
        >
          <span className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-red-50 text-red-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </span>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </nav>
  );

  return (
    <>
      {/* ── Desktop (≥ 1024px): fixed sidebar ── */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-30 border-r border-gray-100 bg-white shadow-sm">
        {nav}
      </aside>

      {/* ── Mobile (< 1024px): off-canvas drawer ── */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={onClose}
            aria-hidden="true"
          />
          {/* Drawer */}
          <aside
            ref={sidebarRef}
            className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-2xl animate-[slideInLeft_0.25s_cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden"
          >
            {nav}
          </aside>
        </div>
      )}
    </>
  );
};

export default AdminSidebar;
