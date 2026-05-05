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
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          axios.get(`${API_URL}/api/products/public/home`),
          axios.get(`${API_URL}/api/categories`)
        ]);

        setBestsellers(productsRes.data.bestsellers);
        setOffers(productsRes.data.offers);
        setNewProducts(productsRes.data.newProducts);
        setCategories(categoriesRes.data);
      } catch (err) {
        console.error("Error cargando datos de inicio", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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

  const getCategoryIcon = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('consolas')) return '🎮';
    if (lowerName.includes('pc') || lowerName.includes('notebook')) return '💻';
    if (lowerName.includes('componentes') || lowerName.includes('hardware')) return '🖥️';
    if (lowerName.includes('accesorios') || lowerName.includes('perifericos')) return '🖱️';
    if (lowerName.includes('juegos')) return '🎲';
    return '📁';
  };

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
          {categories.length > 0 ? (
            categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/category/${encodeURIComponent(cat.name)}`}
                className="category-card"
              >
                {getCategoryIcon(cat.name)} {cat.name}
              </Link>
            ))
          ) : (
            <p>Cargando categorías...</p>
          )}
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
            {categories.slice(0, 6).map((cat) => (
              <Link key={`footer-${cat._id}`} to={`/category/${encodeURIComponent(cat.name)}`}>
                {cat.name}
              </Link>
            ))}
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
