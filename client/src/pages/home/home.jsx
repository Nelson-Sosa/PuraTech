import { Link } from "react-router-dom";
import axios from "axios";
import { useState, useEffect, useRef, useCallback } from "react";
import { API_URL } from '../../config';
import './home.css';
import { useCart } from '../../context/CartContext';

// ── Hero Slides Data ──────────────────────────────────────────
const HERO_SLIDES = [
  {
    id: 0,
    image: "/img/hero_setup.png",
    badge: "🔥 Setup Gamer Pro",
    title: "Tu setup gamer",
    titleHighlight: "al siguiente nivel",
    subtitle: "Equipos premium para gamers exigentes. Rendimiento real, precios accesibles.",
    cta: { text: "Ver productos", to: "/products" },
    ctaSecondary: { text: "Ver categorías", to: "#categories" },
    accentColor: "#2563eb",
  },
  {
    id: 1,
    image: "/img/hero_silla.png",
    badge: "💺 Confort Extremo",
    title: "Jugá más cómodo",
    titleHighlight: "y mejor",
    subtitle: "Sillas gamer ergonómicas diseñadas para sesiones largas. Soporte lumbar real.",
    cta: { text: "Ver sillas", to: "/category/Sillas" },
    ctaSecondary: { text: "Ver ofertas", to: "/products" },
    accentColor: "#7c3aed",
  },
  {
    id: 2,
    image: "/img/hero_perifericos.png",
    badge: "🖱️ Periféricos Top",
    title: "Los mejores",
    titleHighlight: "periféricos gamer",
    subtitle: "Teclados mecánicos, mouses gaming y headsets de alta fidelidad. Jugá sin límites.",
    cta: { text: "Ver periféricos", to: "/category/Accesorios" },
    ctaSecondary: { text: "Ver novedades", to: "/products" },
    accentColor: "#0891b2",
  },
];

const SLIDE_DURATION = 5500; // ms por slide

const Home = () => {
  const [bestsellers, setBestsellers] = useState([]);
  const [offers, setOffers] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [addingToCart, setAddingToCart] = useState({});

  // ── Slider State ──
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);
  const progressRef = useRef(null);

  const goToSlide = useCallback((index) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setProgress(0);
    setTimeout(() => {
      setCurrentSlide(index);
      setIsTransitioning(false);
    }, 600);
  }, [isTransitioning]);

  const nextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % HERO_SLIDES.length);
  }, [currentSlide, goToSlide]);

  // ── Auto-play ──
  useEffect(() => {
    if (isPaused) return;
    intervalRef.current = setInterval(nextSlide, SLIDE_DURATION);
    return () => clearInterval(intervalRef.current);
  }, [isPaused, nextSlide]);

  // ── Progress bar ──
  useEffect(() => {
    if (isPaused) return;
    setProgress(0);
    const start = performance.now();
    const tick = (now) => {
      const elapsed = now - start;
      setProgress(Math.min((elapsed / SLIDE_DURATION) * 100, 100));
      if (elapsed < SLIDE_DURATION) {
        progressRef.current = requestAnimationFrame(tick);
      }
    };
    progressRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(progressRef.current);
  }, [currentSlide, isPaused]);

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

  const ProductSection = ({ title, subtitle, products, iconColor }) => (
    <section className="product-section">
      <div className="product-section-header">
        <div className="title-with-pill">
          <span className={`pill ${iconColor}`}></span>
          <div>
            <h2>{title}</h2>
            <p className="section-subtitle">{subtitle}</p>
          </div>
        </div>
        <Link to="/products" className="view-all-link">Ver todo →</Link>
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
                    src={(product.images && product.images[0]) || product.imageUrl || "/img/placeholder.png"} 
                    alt={product.nombre}
                    className="product-image"
                  />
                  {product.isOffer && <span className="badge offer">OFERTA</span>}
                  {product.isNew && <span className="badge new">NUEVO</span>}
                  {product.images && product.images.length > 1 && (
                    <span className="image-count">+{product.images.length - 1}</span>
                  )}
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
                className={`add-to-cart-btn ${addingToCart[product._id] ? 'added' : ''}`}
                onClick={() => {
                  setAddingToCart(prev => ({...prev, [product._id]: 'adding'}));
                  addToCart(product);
                  setAddingToCart(prev => ({...prev, [product._id]: 'added'}));
                  setTimeout(() => {
                    setAddingToCart(prev => {
                      const newState = {...prev};
                      delete newState[product._id];
                      return newState;
                    });
                  }, 1500);
                }}
              >
                {addingToCart[product._id] === 'added' ? (
                  <>✓ Agregado</>
                ) : addingToCart[product._id] === 'adding' ? (
                  <>Agregando...</>
                ) : (
                  <>🛒 Agregar</>
                )}
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
      {/* ── HERO SLIDER (Cinematic) ── */}
      <section
        className="hero-slider"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Slides */}
        {HERO_SLIDES.map((slide, index) => (
          <div
            key={slide.id}
            className={`hero-slide ${index === currentSlide ? 'hero-slide--active' : ''} ${isTransitioning && index === currentSlide ? 'hero-slide--exit' : ''}`}
          >
            {/* Background Image with Ken Burns */}
            <div
              className={`hero-bg ${index === currentSlide ? 'hero-bg--zoom' : ''}`}
              style={{ backgroundImage: `url(${slide.image})` }}
            />
            {/* Dark Overlay Gradient */}
            <div className="hero-overlay" />

            {/* Content — staggered text entrance */}
            <div className={`hero-content ${index === currentSlide && !isTransitioning ? 'hero-content--visible' : ''}`}>
              <span className="hero-badge">{slide.badge}</span>
              <h1 className="hero-title">
                {slide.title}<br />
                <span className="hero-title-highlight" style={{ '--slide-accent': slide.accentColor }}>
                  {slide.titleHighlight}
                </span>
              </h1>
              <p className="hero-subtitle">{slide.subtitle}</p>
              <div className="hero-cta-group">
                <Link to={slide.cta.to} className="hero-btn-primary">
                  {slide.cta.text} →
                </Link>
                {slide.ctaSecondary.to.startsWith('#') ? (
                  <a href={slide.ctaSecondary.to} className="hero-btn-secondary">
                    {slide.ctaSecondary.text}
                  </a>
                ) : (
                  <Link to={slide.ctaSecondary.to} className="hero-btn-secondary">
                    {slide.ctaSecondary.text}
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Dot Navigation + Progress */}
        <div className="hero-nav">
          {HERO_SLIDES.map((slide, index) => (
            <button
              key={slide.id}
              className={`hero-dot ${index === currentSlide ? 'hero-dot--active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Ir al slide ${index + 1}`}
            >
              {index === currentSlide && (
                <span
                  className="hero-dot-progress"
                  style={{ transform: `scaleX(${progress / 100})` }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Arrow Navigation */}
        <button
          className="hero-arrow hero-arrow--prev"
          onClick={() => goToSlide((currentSlide - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
          aria-label="Slide anterior"
        >
          ‹
        </button>
        <button
          className="hero-arrow hero-arrow--next"
          onClick={() => nextSlide()}
          aria-label="Siguiente slide"
        >
          ›
        </button>
      </section>

      {/* CATEGORÍAS PRINCIPALES */}
      <section className="categories-section" id="categories">
        <div className="section-header">
          <h2>Categorías</h2>
          <p>Explora nuestra selección por categorías</p>
        </div>
        
        <div className="categories-grid">
          {categories.length > 0 ? (
            categories.map((cat) => (
              <Link 
                key={cat._id} 
                to={`/category/${encodeURIComponent(cat.name)}`} 
                className="category-card"
              >
                <div className="cat-content">
                  <span className="cat-label">{cat.name}</span>
                  <span className="cat-explore">Ver productos</span>
                </div>
              </Link>
            ))
          ) : (
            <div className="loading-categories">
              <div className="spinner"></div>
              <p>Cargando categorías...</p>
            </div>
          )}
        </div>
      </section>

      {/* PRODUCTOS DESTACADOS */}
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Cargando productos seleccionados...</p>
        </div>
      ) : (
        <>
          <ProductSection 
            title="Más vendidos" 
            subtitle="Los favoritos de nuestra comunidad gamer" 
            products={bestsellers} 
            iconColor="hot"
          />
          <ProductSection 
            title="Ofertas Increíbles" 
            subtitle="Precios especiales por tiempo limitado" 
            products={offers} 
            iconColor="deal"
          />
          <ProductSection 
            title="Novedades" 
            subtitle="Lo último en tecnología y periféricos" 
            products={newProducts} 
            iconColor="new"
          />
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

      {/* FOOTER */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-brand-logo">🎮 GameMasters</div>
            <p>Tu tienda gamer de confianza en Paraguay.</p>
          </div>
          <div className="footer-section">
            <h4>Enlaces rápidos</h4>
            <Link to="/products">Catálogo</Link>
            <Link to="/login">Mi cuenta</Link>
            <Link to="/cart">Carrito</Link>
          </div>
          <div className="footer-section">
            <h4>Contacto</h4>
            <p>📱 WhatsApp: +595 983 986 775</p>
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
