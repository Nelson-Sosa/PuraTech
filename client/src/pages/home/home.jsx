import { Link } from "react-router-dom";
import axios from "axios";
import { useState, useEffect } from "react";
import { API_URL } from '../../config';
import './home.css';
import { useCart } from '../../context/CartContext';
import Navbar from '../../components/Navbar/Navbar';

const Home = () => {
  const [bestsellers, setBestsellers] = useState([]);
  const [offers, setOffers] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

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

  const ProductSection = ({ title, products, icon }) => (
    <section className="product-section">
      <div className="product-section-header">
        <h2>{icon} {title}</h2>
      </div>
      {products.length === 0 ? (
        <p className="no-products">No hay productos en esta sección</p>
      ) : (
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
                  <p className="product-brand">{product.marca}</p>
                  <h3>{product.nombre}</h3>
                  <p className="product-price">
                    {Number(product.precio).toLocaleString("es-PY")} Gs.
                  </p>
                  <p className="stock">✓ Stock: {product.stock || 10} unidades</p>
                </div>
              </Link>
              <button 
                className="add-to-cart-btn"
                onClick={() => addToCart(product)}
              >
                🛒 Agregar al carrito
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );

  return (
    <div className="home-container">
      {/* HERO SECTION */}
      <section className="hero-slider">
        <div className="hero-orb-left" />
        <div className="slide active">
          <div className="slide-content">
            <h1>
              Tu tienda gamer<br />
              <span>al mejor precio</span>
            </h1>
            <p>🚀 Equipos, consolas y accesorios premium. Comprá fácil y rápido desde tu casa.</p>
            <Link to="/category/Consolas" className="hero-btn">
              Ver productos →
            </Link>
          </div>
        </div>
      </section>

      {/* CATEGORÍAS PRINCIPALES */}
      <section className="categories-section">
        <h2>🎮 Categorías</h2>
        <div className="categories-grid">
          <Link to={`/category/${encodeURIComponent('Consolas')}`} className="category-card">🎮 Consolas</Link>
          <Link to={`/category/${encodeURIComponent('Pc Gamer')}`} className="category-card">💻 PCs Gamer</Link>
          <Link to={`/category/${encodeURIComponent('Componentes')}`} className="category-card">🖥️ Componentes</Link>
          <Link to={`/category/${encodeURIComponent('Accesorios')}`} className="category-card">🖱️ Accesorios</Link>
        </div>
      </section>

      {/* PRODUCTOS DESTACADOS */}
      {loading ? (
        <div className="loading">Cargando productos...</div>
      ) : (
        <>
          <ProductSection title="Más vendidos" products={bestsellers} icon="🔥" />
          <ProductSection title="Ofertas" products={offers} icon="💰" />
          <ProductSection title="Nuevos" products={newProducts} icon="✨" />
        </>
      )}

      {/* BENEFICIOS */}
      <section className="benefits-section">
        <div className="benefit-item">
          <span className="benefit-icon">🚚</span>
          Envíos a todo Paraguay
        </div>
        <div className="benefit-item">
          <span className="benefit-icon">💳</span>
          Pagá por transferencia o QR
        </div>
        <div className="benefit-item">
          <span className="benefit-icon">📱</span>
          Atención por WhatsApp
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section className="testimonials-section">
        <h2>Lo que dicen nuestros clientes</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="stars">★★★★★</div>
            <p>"Excelente atención y productos de calidad"</p>
            <span>— Juan P.</span>
          </div>
          <div className="testimonial-card">
            <div className="stars">★★★★★</div>
            <p>"Llegó súper rápido a mi casa"</p>
            <span>— María G.</span>
          </div>
          <div className="testimonial-card">
            <div className="stars">★★★★★</div>
            <p>"Precios increíbles, volveré a comprar"</p>
            <span>— Carlos M.</span>
          </div>
        </div>
      </section>

      {/* BOTÓN FLOTANTE DE WHATSAPP */}
      <a
        href={`https://wa.me/595981123456`}
        className="whatsapp-float"
        target="_blank"
        rel="noopener noreferrer"
        title="Contactanos por WhatsApp"
      >
        📱
      </a>

      {/* FOOTER */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-brand-logo">🎮 GameMasters</div>
            <p className="footer-tagline">Tu tienda gamer de confianza en Paraguay</p>
          </div>
          <div className="footer-section">
            <h4>Categorías</h4>
            <Link to="/category/Consolas">Consolas</Link>
            <Link to="/category/Pc Gamer">PCs Gamer</Link>
            <Link to="/category/Componentes">Componentes</Link>
            <Link to="/category/Accesorios">Accesorios</Link>
          </div>
          <div className="footer-section">
            <h4>Contacto</h4>
            <p>📱 WhatsApp: +595 981 123 456</p>
            <p>📧 email@gamemasters.com</p>
            <p>📍 Asunción, Paraguay</p>
          </div>
        </div>
        <p className="footer-bottom">© 2026 GameMasters — Todos los derechos reservados</p>
      </footer>
    </div>
  );
};

export default Home;
