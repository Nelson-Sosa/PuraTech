import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useCart } from '../../context/CartContext';
import axios from "axios";
import { API_URL } from '../../config';
import './Navbar.css';

// ── Category navigation config ────────────────────────────────
const CATEGORY_NAV = [
  {
    id: 'perifericos',
    label: 'Periféricos',
    icon: '🖱️',
    href: '/category/perifericos',
    children: [
      { label: 'Mice & Mousepad', href: '/category/mouse', icon: '🖱️' },
      { label: 'Teclados', href: '/category/teclado', icon: '⌨️' },
      { label: 'Auriculares', href: '/category/headset', icon: '🎧' },
      { label: 'Sillas Gamer', href: '/category/silla', icon: '🪑' },
    ],
  },
  {
    id: 'pc',
    label: 'PC Gaming',
    icon: '🖥️',
    href: '/category/computadora',
    children: [
      { label: 'Computadoras', href: '/category/computadora', icon: '🖥️' },
      { label: 'Gabinetes', href: '/category/gabinete', icon: '📦' },
      { label: 'Placas de Video', href: '/category/gpu', icon: '🎮' },
    ],
  },
  {
    id: 'monitores',
    label: 'Monitores',
    icon: '🖥️',
    href: '/category/monitor',
    children: [],
  },
  {
    id: 'consolas',
    label: 'Consolas',
    icon: '🕹️',
    href: '/category/consola',
    children: [
      { label: 'PlayStation', href: '/category/playstation', icon: '🎮' },
      { label: 'Xbox', href: '/category/xbox', icon: '🎮' },
      { label: 'Nintendo', href: '/category/nintendo', icon: '🎮' },
    ],
  },
  {
    id: 'accesorios',
    label: 'Accesorios',
    icon: '🔌',
    href: '/category/accesorios',
    children: [],
  },
  {
    id: 'ofertas',
    label: '🔥 Ofertas',
    icon: '',
    href: '/products',
    highlight: true,
    children: [],
  },
];

// ── CategoryItem sub-component ────────────────────────────────
const CategoryItem = ({ cat }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const timerRef = useRef(null);

  const handleMouseEnter = () => {
    clearTimeout(timerRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timerRef.current = setTimeout(() => setOpen(false), 120);
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <div
      className={`cat-nav-item ${cat.highlight ? 'cat-nav-highlight' : ''}`}
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link to={cat.href} className="cat-nav-link">
        {cat.icon && <span className="cat-nav-icon">{cat.icon}</span>}
        {cat.label}
        {cat.children.length > 0 && (
          <svg className={`cat-nav-chevron ${open ? 'rotated' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        )}
      </Link>

      {cat.children.length > 0 && open && (
        <div className="cat-dropdown">
          <div className="cat-dropdown-grid">
            {cat.children.map((child) => (
              <Link key={child.href} to={child.href} className="cat-dropdown-item">
                <span className="cat-dd-icon">{child.icon}</span>
                <span>{child.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main Navbar ───────────────────────────────────────────────
const Navbar = () => {
  const [userRole, setUserRole] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [salesMeta, setSalesMeta] = useState(null);
  const { getCount } = useCart();

  useEffect(() => {
    const validateAndSetRole = async () => {
      const token = localStorage.getItem('token');
      const storedRole = localStorage.getItem('rol');

      if (!token) {
        setUserRole(null);
        setIsAdmin(false);
        return;
      }

      // Check localStorage first for immediate display
      if (storedRole === 'admin') {
        setUserRole('admin');
        setIsAdmin(true);
      }

      // Then validate with server
      try {
        const res = await axios.get(`${API_URL}/api/verify-token`, {
          headers: { token_usuario: token }
        });
        const serverRole = res.data.user?.rol;
        if (serverRole) {
          setUserRole(serverRole);
          setIsAdmin(serverRole === 'admin');
          localStorage.setItem('rol', serverRole);
        }
      } catch (err) {
        // If server validation fails but localStorage says admin, keep admin
        if (storedRole !== 'admin') {
          localStorage.removeItem('token');
          localStorage.removeItem('rol');
          localStorage.removeItem('user');
          setUserRole(null);
          setIsAdmin(false);
        }
      }
    };

    validateAndSetRole();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('user');
    localStorage.removeItem('usuario');
    setUserRole(null);
    setIsAdmin(false);
    window.location.href = '/';
  };

  return (
    <header className="navbar-wrapper">
      {/* ── TOP BAR ── */}
      <div className="navbar">
        <div className="navbar-brand">
          <Link to="/" className="logo">🎮 GameMasters</Link>
        </div>

        <div className="navbar-search">
          <form onSubmit={(e) => {
            e.preventDefault();
            const query = e.target.search.value;
            if (query.trim()) {
              window.location.href = `/category/${encodeURIComponent(query)}`;
            }
          }} className="search-form">
            <div className="search-input-wrapper">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                name="search"
                placeholder="Buscar productos, marcas y más..."
                className="search-input"
              />
            </div>
            <button type="submit" className="search-btn">
              <span>Buscar</span>
            </button>
          </form>
        </div>

        <div className="navbar-actions">
          <Link to="/cart" className="cart-link">
            <div className="cart-icon-wrapper">
              <svg className="cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {getCount() > 0 && <span className="cart-badge">{getCount()}</span>}
            </div>
            <span className="cart-text">Carrito</span>
          </Link>

          {isAdmin ? (
            <div className="admin-dropdown">
              <span className="admin-badge">ADMIN</span>
              {salesMeta && salesMeta.achieved && (
                <span className="meta-notification" title={`Meta: ${salesMeta.percentage.toFixed(1)}%`}>
                  🎯 Meta 50% alcanzada!
                </span>
              )}
              <div className="dropdown-content">
                <Link to="/agregar/product">Agregar Producto</Link>
                <Link to="/add/suppliers">Agregar Proveedor</Link>
                <Link to="/add/category">Agregar Categoría</Link>
                <Link to="/categories">Ver Categorías</Link>
                <Link to="/orders">📋 Ver Pedidos</Link>
                <Link to="/clients">👥 Ver Clientes</Link>
                <Link to="/inventory">📦 Inventario</Link>
                <button onClick={handleLogout} className="logout-btn">Cerrar Sesión</button>
              </div>
            </div>
          ) : userRole ? (
            <div className="user-dropdown">
              <span className="user-badge">{userRole}</span>
              <div className="dropdown-content">
                <button onClick={handleLogout} className="logout-btn">Cerrar Sesión</button>
              </div>
            </div>
          ) : (
            <div className="auth-actions-wrapper">
              <div className="user-icon-circle">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div className="auth-actions">
                <Link to="/login" className="login-btn-nav">Iniciá sesión</Link>
                <Link to="/register" className="register-btn-nav">Creá tu cuenta</Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── CATEGORY NAV BAR ── */}
      <nav className="cat-navbar">
        <div className="cat-navbar-inner">
          {CATEGORY_NAV.map((cat) => (
            <CategoryItem key={cat.id} cat={cat} />
          ))}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
