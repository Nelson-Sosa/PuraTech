import { Link } from "react-router-dom";
import axios from "axios";
import { useState, useEffect } from "react";
import { API_URL } from '../../config';
import './home.css';
import { useCart } from '../../context/CartContext';
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [bestsellers, setBestsellers] = useState([]);
  const [offers, setOffers] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const userRole = localStorage.getItem('rol');
  const { addToCart, getCount } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/products/public/home`);
        setBestsellers(res.data.bestsellers);
        setOffers(res.data.offers);
        setNewProducts(res.data.newProducts);
      } catch (err) {
        console.error("Error cargando productos", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllProducts();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery}`);
    }
  };

  const whatsappNumber = "595981123456";

  const ProductSection = ({ title, products, icon }) => (
    <section className="product-section">
      <h2>{icon} {title}</h2>
      <div className="products-grid">
        {products.map((product) => (
          <div key={product._id} className="product-card">
            <Link to={`/product/${product._id}`} className="product-link">
              <div className="product-image-container">
                <img 
                  src={product.imageUrl || "/img/placeholder.png"} 
                  alt={product.nombre}
                  className="product-image"
                />
                {product.isOffer && <span className="badge offer">OFERTA</span>}
                {product.isNew && <span className="badge new">NUEVO</span>}
                <button 
                  className="quick-view-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Vista rápida - Próximamente');
                  }}
                >
                  Vista rápida
                </button>
              </div>
              <div className="product-info">
                <h3>{product.nombre}</h3>
                <p className="product-brand">{product.marca}</p>
                <p className="product-price">
                  {Number(product.precio).toLocaleString("es-PY")} Gs.
                </p>
                <p className="stock">Stock: {product.stock || 10}</p>
              </div>
            </Link>
            <button 
              className="add-to-cart-btn"
              onClick={() => addToCart(product)}
            >
              Agregar al carrito
            </button>
          </div>
        ))}
      </div>
    </section>
  );

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
          <Link to="/cart" className="cart-icon">🛒 <span className="cart-count">{getCount()}</span></Link>
          {userRole ? (
            <div className="user-dropdown">
              <span className="user-role">{userRole}</span>
            </div>
          ) : (
            <Link to="/login" className="login-btn">Iniciá sesión</Link>
          )}
        </div>
      </header>

      {/* HERO SECTION CON SLIDER */}
      <section className="hero-slider">
        <div className="slide active">
          <div className="slide-content">
            <h1>🎮 Equipos y accesorios gamer al mejor precio</h1>
            <p>🚀 Comprá fácil y rápido desde tu casa</p>
            <Link to="/category/Consolas" className="hero-btn">Ver ofertas</Link>
          </div>
        </div>
      </section>

      {/* CATEGORÍAS PRINCIPALES */}
      <section className="categories-section">
        <h2>Categorías principales</h2>
        <div className="categories-grid">
          <Link to="/category/Consolas" className="category-card">🎮 Consolas</Link>
          <Link to="/category/PCs Gamer" className="category-card">💻 PCs Gamer</Link>
          <Link to="/category/Componentes" className="category-card">🖥️ Componentes</Link>
          <Link to="/category/Accesorios" className="category-card">🖱️ Accesorios</Link>
        </div>
      </section>

      {/* PRODUCTOS DESTACADOS */}
      {loading ? (
        <p className="loading">Cargando productos...</p>
      ) : (
        <>
          <ProductSection title="Más vendidos" products={bestsellers} icon="🔥" />
          <ProductSection title="Ofertas" products={offers} icon="💰" />
          <ProductSection title="Nuevos" products={newProducts} icon="🆕" />
        </>
      )}

      {/* TESTIMONIOS */}
      <section className="testimonials-section">
        <h2>Lo que dicen nuestros clientes</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="stars">⭐⭐⭐⭐⭐</div>
            <p>"Excelente atención y productos de calidad"</p>
            <span>- Juan P.</span>
          </div>
          <div className="testimonial-card">
            <div className="stars">⭐⭐⭐⭐⭐</div>
            <p>"Llegó súper rápido a mi casa"</p>
            <span>- María G.</span>
          </div>
        </div>
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
        <div className="footer-content">
          <div className="footer-section">
            <h3>GameMasters</h3>
            <p>Tu tienda gamer de confianza</p>
          </div>
          <div className="footer-section">
            <h4>Categorías</h4>
            <Link to="/category/Consolas">Consolas</Link>
            <Link to="/category/PCs Gamer">PCs Gamer</Link>
            <Link to="/category/Componentes">Componentes</Link>
          </div>
          <div className="footer-section">
            <h4>Contacto</h4>
            <p>📱 WhatsApp: +595 981 123 456</p>
            <p>📧 email@gamemasters.com</p>
          </div>
        </div>
        <p className="footer-bottom">© 2026 GameMasters - Todos los derechos reservados</p>
      </footer>
    </div>
  );
};

export default Home;
