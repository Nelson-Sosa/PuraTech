import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCart } from '../../context/CartContext';

const Navbar = () => {
  const [userRole, setUserRole] = useState(localStorage.getItem('rol'));
  const [isAdmin, setIsAdmin] = useState(userRole === 'admin');
  const { getCount } = useCart();

  useEffect(() => {
    const role = localStorage.getItem('rol');
    setUserRole(role);
    setIsAdmin(role === 'admin');
  }, []);

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
