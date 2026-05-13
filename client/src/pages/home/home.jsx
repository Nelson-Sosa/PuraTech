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
    image: "/img/hero_electronics.png",
    badge: "💻 Tecnología Premium",
    title: "Innovación y poder",
    titleHighlight: "al alcance de tu mano",
    subtitle: "Descubrí lo último en notebooks, smartphones y smartwatches. Rendimiento y diseño.",
    cta: { text: "Ver tecnología", to: "/products" },
    ctaSecondary: { text: "Ver categorías", to: "#categories" },
    accentColor: "#2563eb",
  },
  {
    id: 1,
    image: "/img/hero_entertainment.png",
    badge: "🎮 Entretenimiento Total",
    title: "Llevá la diversión",
    titleHighlight: "al siguiente nivel",
    subtitle: "Las mejores consolas y equipos de sonido para vivir la mejor experiencia en casa.",
    cta: { text: "Ver consolas", to: "/category/consolas" },
    ctaSecondary: { text: "Ver ofertas", to: "/products" },
    accentColor: "#7c3aed",
  },
  {
    id: 2,
    image: "/img/hero_audio_accessories.png",
    badge: "🎧 Audio Sin Límites",
    title: "Sonido envolvente",
    titleHighlight: "y accesorios top",
    subtitle: "Auriculares inalámbricos, parlantes bluetooth y todos los accesorios para tus dispositivos.",
    cta: { text: "Ver audio", to: "/category/audio" },
    ctaSecondary: { text: "Ver novedades", to: "/products" },
    accentColor: "#0891b2",
  },
];

const SLIDE_DURATION = 5500; // ms por slide

// ── Category card config (gradient + icon) ───────────────────
const CAT_CONFIG = {
  'Electrónica':     { icon: '📺', bg: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',  emoji: '📺' },
  'Computación':     { icon: '🖥️', bg: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',  emoji: '🖥️' },
  'Gaming':          { icon: '🎮', bg: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',  emoji: '🎮' },
  'Audio':           { icon: '🔊', bg: 'linear-gradient(135deg, #0891b2 0%, #22d3ee 100%)',  emoji: '🔊' },
  'Periféricos':     { icon: '🖱️', bg: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', emoji: '🖱️' },
  'Perifericos':     { icon: '🖱️', bg: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', emoji: '🖱️' },
  'Smartphones':     { icon: '📱', bg: 'linear-gradient(135deg, #0e7490 0%, #06b6d4 100%)', emoji: '📱' },
  'Accesorios':      { icon: '⚡', bg: 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)',  emoji: '⚡' },
  'Consolas':        { icon: '🎮', bg: 'linear-gradient(135deg, #dc2626 0%, #f87171 100%)', emoji: '🎮' },
};

const getCatConfig = (name) => {
  const match = CAT_CONFIG[name];
  if (match) return match;
  const lower = name.toLowerCase();
  if (lower.includes('electronica')) return CAT_CONFIG['Electrónica'];
  if (lower.includes('computacion') || lower.includes('comput')) return CAT_CONFIG['Computación'];
  if (lower.includes('gaming') || lower.includes('juego')) return CAT_CONFIG['Gaming'];
  if (lower.includes('audio') || lower.includes('sonido')) return CAT_CONFIG['Audio'];
  if (lower.includes('periferic')) return CAT_CONFIG['Periféricos'];
  if (lower.includes('smart') || lower.includes('phone') || lower.includes('celul')) return CAT_CONFIG['Smartphones'];
  if (lower.includes('accesori') || lower.includes('cable') || lower.includes('cargad')) return CAT_CONFIG['Accesorios'];
  if (lower.includes('consola')) return CAT_CONFIG['Consolas'];
  return { icon: '📁', bg: 'linear-gradient(135deg, #475569 0%, #64748b 100%)', emoji: '📁' };
};

const CategoryCard = ({ cat }) => {
  const cfg = getCatConfig(cat.name);
  const href = `/category/${encodeURIComponent(cat.slug || cat.name)}`;

  return (
    <Link to={href} className="cat-featured-card">
      <div className="cat-icon-wrapper" style={{ background: cfg.bg }}>
        <span className="cat-emoji">{cfg.emoji}</span>
      </div>
      <div className="cat-info-clean">
        <h3 className="cat-name-clean">{cat.name}</h3>
        <span className="cat-explore-clean">
          Ver productos
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  );
};

// ── Sub-component: Product Section ──────────────────────────
const ProductSection = ({ title, subtitle, products = [], iconColor, addToCart, addingToCart, setAddingToCart, loading }) => (
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
    
    {loading ? (
      <div className="products-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton-img skeleton"></div>
            <div className="skeleton-text skeleton"></div>
            <div className="skeleton-text skeleton" style={{ width: '60%' }}></div>
            <div className="skeleton-price skeleton"></div>
            <div className="skeleton-btn skeleton"></div>
          </div>
        ))}
      </div>
    ) : (!products || products.length === 0) ? (
      <div className="no-products-container">
        <p className="no-products">No hay productos disponibles en esta sección actualmente.</p>
      </div>
    ) : (
      <div className="products-grid">
        {products.map((product) => {
          if (!product) return null;
          const productId = product._id || product.id;
          
          return (
            <div key={productId} className="product-card">
              <Link to={`/product/${productId}`} className="product-link">
                <div className="product-image-container">
                  <img 
                    src={(product.images && product.images[0]) || product.imageUrl || "/img/placeholder.png"} 
                    alt={product.nombre || "Producto"}
                    className="product-image"
                    loading="lazy"
                  />
                  {product.isOffer && <span className="badge offer">OFERTA</span>}
                  {product.isNew && <span className="badge new">NUEVO</span>}
                </div>
                <div className="product-info">
                  <p className="product-brand">{product.marca || "Marca"}</p>
                  <h3>{product.nombre || "Producto sin nombre"}</h3>
                  <div className="product-price">
                    {Number(product.precio || 0).toLocaleString("es-PY")} Gs.
                  </div>
                  <p className="stock">✓ Stock: {product.stock || 0} unidades</p>
                </div>
              </Link>
              {product.images && product.images.length > 1 && (
                <span className="image-count">+{product.images.length - 1}</span>
              )}
              <button 
                className={`add-to-cart-btn ${addingToCart[productId] ? 'added' : ''}`}
                disabled={addingToCart[productId] === 'adding'}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setAddingToCart(prev => ({...prev, [productId]: 'adding'}));
                  addToCart(product);
                  setAddingToCart(prev => ({...prev, [productId]: 'added'}));
                  setTimeout(() => {
                    setAddingToCart(prev => {
                      const newState = {...prev};
                      delete newState[productId];
                      return newState;
                    });
                  }, 1500);
                }}
              >
                {addingToCart[productId] === 'added' ? (
                  <>✓ ¡Listo!</>
                ) : addingToCart[productId] === 'adding' ? (
                  <>Agregando...</>
                ) : (
                  <>🛒 Agregar</>
                )}
              </button>
            </div>
          );
        })}
      </div>
    )}
  </section>
);

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
          axios.get(`${API_URL}/api/categories/tree`)
        ]);
        
        setBestsellers(productsRes.data.bestsellers);
        setOffers(productsRes.data.offers);
        setNewProducts(productsRes.data.newProducts);
        setCategories(categoriesRes.data || []);
      } catch (err) {
        console.error("Error cargando datos de inicio", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

      {/* ── CATEGORÍAS DESTACADAS ── */}
      <section className="cat-featured-section" id="categories">
        <div className="cat-featured-container">
          <div className="cat-featured-header">
            <div className="cat-featured-title-wrap">
              <span className="cat-featured-pill">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                </svg>
                Navegá rápido
              </span>
              <h2>Explorá por categoría</h2>
              <p>Encontrá todo lo que necesitás organizado por secciones</p>
            </div>
            <Link to="/products" className="cat-featured-viewall">
              Ver todo el catálogo
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="cat-featured-grid">
            {categories.filter(c => c.nivel === 1).length > 0 ? (
              categories
                .filter(c => c.nivel === 1)
                .sort((a, b) => (a.orden || 0) - (b.orden || 0))
                .map((cat) => (
                  <CategoryCard key={cat._id} cat={cat} />
                ))
            ) : (
              <div className="loading-categories">
                <div className="spinner"></div>
                <p>Cargando categorías...</p>
              </div>
            )}
          </div>
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
            addToCart={addToCart}
            addingToCart={addingToCart}
            setAddingToCart={setAddingToCart}
            loading={loading}
          />
          <ProductSection 
            title="Ofertas Increíbles" 
            subtitle="Precios especiales por tiempo limitado" 
            products={offers} 
            iconColor="deal"
            addToCart={addToCart}
            addingToCart={addingToCart}
            setAddingToCart={setAddingToCart}
            loading={loading}
          />
          <ProductSection 
            title="Novedades" 
            subtitle="Lo último en tecnología y periféricos" 
            products={newProducts} 
            iconColor="new"
            addToCart={addToCart}
            addingToCart={addingToCart}
            setAddingToCart={setAddingToCart}
            loading={loading}
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
