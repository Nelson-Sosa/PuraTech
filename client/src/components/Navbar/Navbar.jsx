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

  // Verificar meta de ventas solo para admin
  useEffect(() => {
    if (isAdmin) {
      const checkMeta = async () => {
        try {
          const res = await axios.get(`${API_URL}/api/sales-meta`);
          setSalesMeta(res.data);
        } catch (err) {
          console.error("Error checking sales meta:", err);
        }
      };
      checkMeta();
    }
  }, [isAdmin]);

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
            window.location.href = `/category/${query}`;
          }
        }}>
          <input 
            type="text" 
            name="search"
            placeholder="🔎 Buscar productos..." 
            className="search-input"
          />
          <button type="submit" className="search-btn">Buscar</button>
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
