import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCart } from '../../context/CartContext';
import axios from "axios";
import { API_URL } from '../../config';
import './Navbar.css';

const Navbar = () => {
  const [userRole, setUserRole] = useState(localStorage.getItem('rol'));
  const [isAdmin, setIsAdmin] = useState(userRole === 'admin');
  const [salesMeta, setSalesMeta] = useState(null);
  const { getCount } = useCart();

  useEffect(() => {
    const role = localStorage.getItem('rol');
    setUserRole(role);
    setIsAdmin(role === 'admin');
  }, []);

  // Verificar meta de ventas solo para admin (TEMPORALMENTE DESACTIVADO)
  // useEffect(() => {
  //   if (isAdmin) {
  //     const checkMeta = async () => {
  //       try {
  //         const res = await axios.get(`${API_URL}/api/sales-meta`);
  //         setSalesMeta(res.data);
  //       } catch (err) {
  //         console.error("Error checking sales meta:", err);
  //       }
  //     };
  //     checkMeta();
  //   }
  // }, [isAdmin]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('usuario');
    setUserRole(null);
    setIsAdmin(false);
    window.location.href = '/';
  };

  return (
    <header className="navbar">
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
          🛒 Carrito
          {getCount() > 0 && <span className="cart-badge">{getCount()}</span>}
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
          <Link to="/login" className="login-link">Iniciá sesión</Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;
