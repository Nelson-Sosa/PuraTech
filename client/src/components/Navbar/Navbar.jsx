import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import axios from "axios";
import { API_URL } from '../../config';
import UserProfileButton from './UserProfileButton';
import './Navbar.css';

// ── Category icons map ──────────────────────────────────────
const ICONS = {
  1: (
    <svg className="cat-icon-svg level-1-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  ),
  2: (
    <svg className="cat-icon-svg level-2-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      <path d="M2 10h20" />
    </svg>
  ),
  3: (
    <svg className="cat-icon-svg level-3-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  ),
  default: (
    <svg className="cat-icon-svg default-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  )
};

// ── Full Mobile Categories Panel (Drill-down Drawer Lateral) ──
const MobileCategoryMenu = ({ categories, onClose }) => {
  const [viewStack, setViewStack] = useState([{ title: 'Todas las Categorías', items: categories, parent: null }]);
  
  const currentView = viewStack[viewStack.length - 1];

  const handleItemClick = (item) => {
    if (item.children && item.children.length > 0) {
      setViewStack([...viewStack, { title: item.name, items: item.children, parent: item }]);
    }
  };

  const handleBack = () => {
    if (viewStack.length > 1) {
      setViewStack(viewStack.slice(0, -1));
    }
  };

  return (
    <div className="mob-cat-overlay" onClick={onClose}>
      <div className="mob-cat-drawer" onClick={e => e.stopPropagation()}>
        <div className="mob-cat-drawer-header">
          {viewStack.length > 1 ? (
            <button className="mob-cat-back-btn" onClick={handleBack} aria-label="Volver">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          ) : (
            <div className="mob-cat-back-placeholder" style={{ width: '36px' }} />
          )}
          
          <h3 className="mob-cat-title">{currentView.title}</h3>
          
          <button className="mob-cat-close-btn" onClick={onClose} aria-label="Cerrar menú de categorías">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="mob-cat-drawer-body">
          {viewStack.length > 1 && currentView.parent && (
            <Link 
              to={`/category/${encodeURIComponent(currentView.parent.slug || currentView.parent.name)}`}
              className="mob-drill-item mob-drill-view-all"
              onClick={onClose}
            >
              <span>Ver todo en {currentView.title}</span>
            </Link>
          )}

          {currentView.items.map(item => {
            const hasKids = item.children && item.children.length > 0;
            return (
              <div key={item._id} className="mob-drill-item-wrapper">
                <Link
                  to={hasKids ? '#' : `/category/${encodeURIComponent(item.slug || item.name)}`}
                  className="mob-drill-item"
                  onClick={(e) => {
                    if (hasKids) {
                      e.preventDefault();
                      handleItemClick(item);
                    } else {
                      onClose();
                    }
                  }}
                >
                  <div className="mob-drill-content">
                    {item.nivel < 3 && <span className="mob-drill-icon">{ICONS[item.nivel] || ICONS.default}</span>}
                    {item.nivel === 3 && <span className="mob-drill-dot" />}
                    <span className="mob-drill-name">{item.name}</span>
                  </div>
                  {hasKids && (
                    <span className="mob-drill-arrow">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </span>
                  )}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ── SubItem (level 2 item with level 3 children) — DESKTOP ONLY ─────────────
const SubItem = ({ child }) => {
  const [subOpen, setSubOpen] = useState(false);
  const timerRef = useRef(null);

  const hasSubChildren = child.children && child.children.length > 0;

  return (
    <div
      className="cat-dd-item-wrapper"
      onMouseEnter={() => { clearTimeout(timerRef.current); setSubOpen(true); }}
      onMouseLeave={() => { timerRef.current = setTimeout(() => setSubOpen(false), 120); }}
    >
      <Link
        to={`/category/${encodeURIComponent(child.slug || child.name)}`}
        className="cat-dropdown-item"
      >
        <span className="cat-dd-icon">{ICONS[child.nivel] || ICONS.default}</span>
        <span>{child.name}</span>
        {hasSubChildren && <span className="cat-dd-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12"><polyline points="9 18 15 12 9 6" /></svg></span>}
      </Link>

      {hasSubChildren && subOpen && (
        <div className="cat-sub-dropdown">
          {child.children.map((subChild) => (
            <Link
              key={subChild._id}
              to={`/category/${encodeURIComponent(subChild.slug || subChild.name)}`}
              className="cat-dropdown-item cat-sub-item"
            >
              <span className="cat-dd-icon">{ICONS[subChild.nivel] || ICONS.default}</span>
              <span>{subChild.name}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

// ── CategoryItem sub-component ────────────────────────────────
const CategoryItem = ({ cat }) => {
  const [open, setOpen] = useState(false);
  const timerRef = useRef(null);

  const handleMouseEnter = () => {
    clearTimeout(timerRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timerRef.current = setTimeout(() => setOpen(false), 120);
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const hasChildren = cat.children && cat.children.length > 0;
  const icon = ICONS[cat.nivel] || ICONS.default;
  const href = `/category/${encodeURIComponent(cat.slug || cat.name)}`;

  return (
    <div
      className={`cat-nav-item ${cat.highlight ? 'cat-nav-highlight' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link to={href} className="cat-nav-link">
        <span className="cat-nav-icon">{icon}</span>
        <span className="cat-nav-label">{cat.name}</span>
        {hasChildren && (
          <svg className={`cat-nav-chevron ${open ? 'rotated' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        )}
      </Link>

      {hasChildren && open && (
        <div className="cat-dropdown">
          <div className="cat-dropdown-grid">
            {cat.children.map((child) => (
              <SubItem key={child._id} child={child} />
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
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileCatOpen, setMobileCatOpen] = useState(false);
  const toggleMobileMenu = () => { if (window.innerWidth <= 768) setMobileMenuOpen(prev => !prev); };
  const { getCount } = useCart();
  const { count: wishlistCount } = useWishlist();

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/categories/tree`);
        setCategories(res.data || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const validateAndSetRole = async () => {
      const token = localStorage.getItem('token');
      const storedRole = localStorage.getItem('rol');

      if (!token) {
        setUserRole(null);
        setIsAdmin(false);
        return;
      }

      // Set role from localStorage immediately for instant UI feedback
      if (storedRole) {
        setUserRole(storedRole);
        setIsAdmin(storedRole === 'admin');
      }

      // Then validate with server (non-blocking)
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
        // Only clear session if server explicitly says token is invalid (401)
        // DO NOT clear on network errors or other issues — preserves Google login sessions
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('rol');
          localStorage.removeItem('user');
          localStorage.removeItem('photoURL');
          setUserRole(null);
          setIsAdmin(false);
        }
        // On network errors, keep the stored role so user stays logged in
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
          <Link to="/" className="logo">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#nav-logo-gradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="brand-logo-icon">
              <defs>
                <linearGradient id="nav-logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
            PuraTech
          </Link>
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
          {/* Mobile Categories Button */}
          <button
            className="mobile-cat-btn"
            onClick={() => setMobileCatOpen(true)}
            aria-label="Ver categorías"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          </button>

          {/* Mobile Search Toggle */}
          <button className="mobile-search-btn" onClick={() => setMobileSearchOpen(!mobileSearchOpen)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>

          {/* Mobile Search Bar (Toggle) */}
          {mobileSearchOpen && (
            <div className="mobile-search-bar">
              <form onSubmit={(e) => {
                e.preventDefault();
                const query = e.target.search.value;
                if (query.trim()) {
                  window.location.href = `/category/${encodeURIComponent(query)}`;
                }
              }} className="mobile-search-form">
                <input
                  type="text"
                  name="search"
                  placeholder="Buscar productos..."
                  className="mobile-search-input"
                  autoFocus
                />
                <button type="submit" className="mobile-search-submit">Buscar</button>
                <button type="button" className="mobile-search-close" onClick={() => setMobileSearchOpen(false)}>
                  ✕
                </button>
              </form>
            </div>
          )}

          <Link to="/wishlist" className="cart-link wishlist-link">
            <div className="cart-icon-wrapper">
              <svg className="cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {wishlistCount > 0 && <span className="cart-badge">{wishlistCount}</span>}
            </div>
            <span className="cart-text">Favoritos</span>
          </Link>

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
            <div className="admin-dropdown" onClick={toggleMobileMenu}>
              {localStorage.getItem("photoURL") ? (
                <img src={localStorage.getItem("photoURL")} alt="Admin" className="user-avatar" />
              ) : (
                <span className="admin-badge">ADMIN</span>
              )}
              {salesMeta && salesMeta.achieved && (
                <span className="meta-notification" title={`Meta: ${salesMeta.percentage.toFixed(1)}%`}>
                  🎯 Meta 50% alcanzada!
                </span>
              )}
              <div className="user-dropdown-menu">
                <Link to="/agregar/product"> Agregar Producto</Link>
                <Link to="/add/suppliers">Agregar Proveedor</Link>
                <Link to="/add/category">Agregar Categoría</Link>
                <Link to="/categories">Ver Categorías</Link>
                <Link to="/orders" className="udp-admin-link">📋 Ver Pedidos</Link>
                <Link to="/clients" className="udp-admin-link">👥 Ver Clientes</Link>
                <Link to="/inventory" className="udp-admin-link">📦 Inventario</Link>
                <button onClick={handleLogout} className="udp-admin-logout">Cerrar Sesión</button>
              </div>
            </div>
          ) : userRole ? (
            <UserProfileButton onLogout={handleLogout} />
          ) : (
            <div className="auth-actions-wrapper" onClick={toggleMobileMenu}>
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
          {loadingCategories ? (
            <>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="skeleton-nav-item">
                  <div className="skeleton-nav-icon skeleton"></div>
                  <div className="skeleton-nav-text skeleton"></div>
                </div>
              ))}
            </>
          ) : (
            categories.map((cat) => (
              <CategoryItem key={cat._id} cat={cat} />
            ))
          )}
        </div>
      </nav>

      {/* ── MOBILE CATEGORY PANEL ── */}
      {mobileCatOpen && (
        <MobileCategoryMenu
          categories={categories}
          onClose={() => setMobileCatOpen(false)}
        />
      )}

      {/* ── MOBILE BOTTOM SHEET MENU ── */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-menu-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-handle"></div>
            {(isAdmin || !userRole) && (
              <h3 className="mobile-menu-title">
                {isAdmin ? 'Panel de Administración' : 'Mi Cuenta'}
              </h3>
            )}
            
            {isAdmin ? (
              <div className="mobile-menu-links">
                <Link to="/agregar/product" onClick={() => setMobileMenuOpen(false)}>
                  <span className="menu-icon">➕</span> Agregar Producto
                </Link>
                <Link to="/add/suppliers" onClick={() => setMobileMenuOpen(false)}>
                  <span className="menu-icon">🏢</span> Agregar Proveedor
                </Link>
                <Link to="/add/category" onClick={() => setMobileMenuOpen(false)}>
                  <span className="menu-icon">📂</span> Agregar Categoría
                </Link>
                <Link to="/categories" onClick={() => setMobileMenuOpen(false)}>
                  <span className="menu-icon">📋</span> Ver Categorías
                </Link>
                <Link to="/orders" onClick={() => setMobileMenuOpen(false)}>
                  <span className="menu-icon">📦</span> Ver Pedidos
                </Link>
                <Link to="/clients" onClick={() => setMobileMenuOpen(false)}>
                  <span className="menu-icon">👥</span> Ver Clientes
                </Link>
                <Link to="/inventory" onClick={() => setMobileMenuOpen(false)}>
                  <span className="menu-icon">📊</span> Inventario
                </Link>
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="mobile-logout">
                  <span className="menu-icon">🚪</span> Cerrar Sesión
                </button>
              </div>
            ) : (
              <div className="mobile-menu-links">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="mobile-login-btn">
                  <span className="menu-icon">🔑</span> Iniciar Sesión
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="mobile-register-btn">
                  <span className="menu-icon">📝</span> Crear Cuenta
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
