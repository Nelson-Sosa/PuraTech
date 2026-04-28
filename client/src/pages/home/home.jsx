import { Link } from "react-router-dom";
import axios from "axios";
import { useState, useEffect } from "react";
import { API_URL } from '../../config';
import './home.css';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const userRole = localStorage.getItem('rol');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${API_URL}/api/products?category=all`,
          token ? { headers: { token_usuario: token } } : {}
        );
        setFeaturedProducts(res.data.slice(0, 8));
      } catch (err) {
        console.error("Error cargando productos", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/category/${searchQuery}`;
    }
  };

  const whatsappNumber = "595981123456"; // Cambia por tu número

  return (
    <div className="home-container">
      {/* HEADER FIJO */}
      <header className="home-header">
        <div className="header-logo">
          <Link to="/">🎮 GameMasters</Link>
        </div>
        <form className="header-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="🔎 Buscar productos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">Buscar</button>
        </form>
        <div className="header-actions">
          <span className="cart-icon">🛒</span>
          {userRole ? (
            <span className="user-role">{userRole}</span>
          ) : (
            <Link to="/login" className="login-btn">Iniciá sesión</Link>
          )}
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="hero-section">
        <h1>🎮 Equipos y accesorios gamer al mejor precio</h1>
        <p>🚀 Comprá fácil y rápido desde tu casa</p>
        <Link to="/category/Consolas" className="hero-btn">Ver productos</Link>
      </section>

      {/* CATEGORÍAS PRINCIPALES */}
      <section className="categories-section">
        <h2>Categorías</h2>
        <div className="categories-grid">
          <Link to="/category/Consolas" className="category-card">🎮 Consolas</Link>
          <Link to="/category/PCs Gamer" className="category-card">💻 PCs Gamer</Link>
          <Link to="/category/Componentes" className="category-card">🖥️ Componentes</Link>
          <Link to="/category/Accesorios" className="category-card">🖱️ Accesorios</Link>
        </div>
      </section>

      {/* PRODUCTOS DESTACADOS */}
      <section className="featured-section">
        <h2>Más vendidos</h2>
        {loading ? (
          <p>Cargando productos...</p>
        ) : (
          <div className="products-grid">
            {featuredProducts.map((product) => (
              <div key={product._id} className="product-card">
                <img 
                  src={product.imageUrl || "/img/placeholder.png"} 
                  alt={product.nombre}
                  className="product-image"
                />
                <h3>{product.nombre}</h3>
                <p className="product-brand">{product.marca}</p>
                <p className="product-price">
                  {Number(product.precio).toLocaleString("es-PY")} Gs.
                </p>
                <button className="add-to-cart-btn">Agregar al carrito</button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* BENEFICIOS */}
      <section className="benefits-section">
        <div className="benefit-item">🚚 Envíos a todo Paraguay</div>
        <div className="benefit-item">💳 Pagá por transferencia o QR</div>
        <div className="benefit-item">📱 Atención por WhatsApp</div>
      </section>

      {/* BOTÓN FLOTANTE DE WHATSAPP */}
      <a
        href={`https://wa.me/${whatsappNumber}`}
        className="whatsapp-float"
        target="_blank"
        rel="noopener noreferrer"
      >
        📱
      </a>

      {/* FOOTER */}
      <footer className="home-footer">
        <p>© 2026 GameMasters - Todos los derechos reservados</p>
      </footer>
    </div>
  );
};

export default Home;
