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
    image: "/img/hero_gaming_consoles.png",
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

// ── Premium SVG Icons ──
const SVG_ICONS = {
  electronica: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
      <polyline points="17 2 12 7 7 2"></polyline>
    </svg>
  ),
  computacion: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
      <line x1="8" y1="21" x2="16" y2="21"></line>
      <line x1="12" y1="17" x2="12" y2="21"></line>
    </svg>
  ),
  gaming: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 12h4m-2-2v4m4-4h.01M16 12h.01M2 12c0-4.4 3.6-8 8-8h4c4.4 0 8 3.6 8 8 0 1.5-.5 3-1.5 4.1L19 18H5l-1.5-1.9C2.5 15 2 13.5 2 12z"></path>
    </svg>
  ),
  audio: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
    </svg>
  ),
  perifericos: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="7"></rect>
      <line x1="12" y1="6" x2="12" y2="10"></line>
    </svg>
  ),
  smartphones: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
      <line x1="12" y1="18" x2="12.01" y2="18"></line>
    </svg>
  ),
  accesorios: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  ),
  default: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="9" y1="3" x2="9" y2="21"></line>
    </svg>
  )
};

const getCatConfig = (name) => {
  const lower = name.toLowerCase();
  if (lower.includes('electronica')) return { svg: SVG_ICONS.electronica, gradient: 'var(--gradient-accent)' };
  if (lower.includes('computacion') || lower.includes('comput')) return { svg: SVG_ICONS.computacion, gradient: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)' };
  if (lower.includes('gaming') || lower.includes('juego') || lower.includes('consola')) return { svg: SVG_ICONS.gaming, gradient: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)' };
  if (lower.includes('audio') || lower.includes('sonido')) return { svg: SVG_ICONS.audio, gradient: 'linear-gradient(135deg, #0891b2 0%, #22d3ee 100%)' };
  if (lower.includes('periferic')) return { svg: SVG_ICONS.perifericos, gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' };
  if (lower.includes('smart') || lower.includes('phone') || lower.includes('celul')) return { svg: SVG_ICONS.smartphones, gradient: 'linear-gradient(135deg, #0e7490 0%, #06b6d4 100%)' };
  if (lower.includes('accesori') || lower.includes('cable') || lower.includes('cargad')) return { svg: SVG_ICONS.accesorios, gradient: 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)' };
  return { svg: SVG_ICONS.default, gradient: 'linear-gradient(135deg, #475569 0%, #64748b 100%)' };
};

const CategoryCard = ({ cat }) => {
  const cfg = getCatConfig(cat.name);
  const href = `/category/${encodeURIComponent(cat.slug || cat.name)}`;

  return (
    <Link to={href} className="cat-featured-card">
      <div className="cat-icon-wrapper">
        <div className="cat-svg-icon" style={{ '--icon-gradient': cfg.gradient }}>
          {cfg.svg}
        </div>
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

const CountdownTimer = ({ endDate }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!endDate) return;
    const end = new Date(endDate).getTime();
    
    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = end - now;
      
      if (distance < 0) {
        setTimeLeft("Oferta terminada");
        return;
      }
      
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) {
        setTimeLeft(`Termina en ${days}d ${hours}h`);
      } else {
        setTimeLeft(`Termina en ${hours}h ${minutes}m`);
      }
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [endDate]);

  if (!timeLeft) return null;

  return (
    <div className="countdown-timer">
      <span className="timer-icon">⏰</span> {timeLeft}
    </div>
  );
};

const getTimeAgo = (dateString) => {
  if (!dateString) return "Reciente";
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Nuevo hoy";
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 14) return "Hace 1 semana";
  if (diffDays < 30) return `Hace ${Math.floor(diffDays/7)} semanas`;
  return "Reciente";
};

// ── Sub-component: Product Section ──────────────────────────
const ProductSection = ({ title, subtitle, products = [], iconColor, addToCart, addingToCart, setAddingToCart, loading, sectionType = "default" }) => (
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
        {products.map((product, index) => {
          if (!product) return null;
          const productId = product._id || product.id;
          
          const allImages = [];
          if (product.imageUrl) allImages.push(product.imageUrl);
          if (product.images && product.images.length > 0) {
            product.images.forEach(img => {
              if (!allImages.includes(img)) allImages.push(img);
            });
          }
          const hasMultipleImages = allImages.length > 1;
          const primaryImg = allImages.length > 0 ? allImages[0] : "/img/placeholder.png";
          const secondaryImg = hasMultipleImages ? allImages[1] : null;

          return (
            <div key={productId} className={`product-card ${sectionType}-card ${hasMultipleImages ? 'has-multiple-images' : ''}`}>
              <Link to={`/product/${productId}`} className="product-link">
                <div className="product-image-container">
                  {sectionType === 'bestsellers' && (() => {
                    const rankIcons = [
                      // #1 — Trophy SVG
                      <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M7 4H17L15.5 10.5C15 13 13.7 14 12 14C10.3 14 9 13 8.5 10.5L7 4ZM5 4H7L8.5 10.5C8.8 12 9.5 13.5 11 14.5L10 16H8L7 18H17L16 16H14L13 14.5C14.5 13.5 15.2 12 15.5 10.5L17 4H19L19.7 7H21V9H19.5L18.8 12H17.5L16 19L14 19V21H10V19H8L6.5 19L5 12H3.5L2.8 9H1V7H2.3L3 4H5Z"/></svg>,
                      // #2 — Star SVG
                      <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>,
                      // #3 — Medal SVG
                      <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M20 2H4v6l8 4 8-4V2zM12 10L6 7V4h12v3l-6 3zM12 12a6 6 0 100 12 6 6 0 000-12zm0 10a4 4 0 110-8 4 4 0 010 8z"/></svg>,
                      // #4 — Chart/Trending SVG
                      <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6" fill="none" stroke="currentColor" strokeWidth="2"/></svg>,
                    ];
                    return (
                      <div className={`premium-ranking rank-${index + 1}`}>
                        <span className="rank-icon-svg">{rankIcons[index] || rankIcons[3]}</span>
                        <span className="rank-text">Top {index + 1}</span>
                      </div>
                    );
                  })()}
                  <img 
                    src={primaryImg} 
                    alt={product.nombre || "Producto"}
                    className="product-image primary"
                    loading="lazy"
                  />
                  {hasMultipleImages && (
                    <img 
                      src={secondaryImg} 
                      alt={`${product.nombre} vista alterna`}
                      className="product-image secondary"
                      loading="lazy"
                    />
                  )}
                  {sectionType === 'offers' ? (
                    <span className="badge offer">-{product.porcentajeDescuento || 0}%</span>
                  ) : product.isOffer ? (
                    <span className="badge offer">OFERTA</span>
                  ) : null}
                  {sectionType === 'new' ? (
                    <span className="badge new-time">
                      <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
                        <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" />
                      </svg>
                      {getTimeAgo(product.createdAt)}
                    </span>
                  ) : product.isNew ? (
                    <span className="badge new">
                      <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
                        <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" />
                      </svg>
                      NUEVO
                    </span>
                  ) : null}
                </div>
                <div className="product-info">
                  <p className="product-brand">{product.marca || "Marca"}</p>
                  <h3>{product.nombre || "Producto sin nombre"}</h3>
                  {sectionType === 'offers' && product.precioAnterior ? (
                    <div className="price-container">
                      <span className="old-price">{Number(product.precioAnterior).toLocaleString("es-PY")} Gs.</span>
                      <div className="product-price highlight-price">
                        {Number(product.precio || 0).toLocaleString("es-PY")} Gs.
                      </div>
                    </div>
                  ) : (
                    <div className="product-price">
                      {Number(product.precio || 0).toLocaleString("es-PY")} Gs.
                    </div>
                  )}
                  {sectionType === 'bestsellers' && product.ventas > 0 ? (
                    <p className="stock sales-count">🔥 {product.ventas} vendidos</p>
                  ) : (
                    <p className="stock">✓ Stock: {product.stock || 0} unidades</p>
                  )}
                  {sectionType === 'offers' && product.fechaFinOferta && (
                    <CountdownTimer endDate={product.fechaFinOferta} />
                  )}
                </div>
              </Link>
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
            sectionType="bestsellers"
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
            sectionType="offers"
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
            sectionType="new"
          />
        </>
      )}

      {/* BENEFICIOS */}
      <section className="benefits-section">
        <div className="benefit-item">
          <div className="benefit-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
          </div>
          <div className="benefit-text">
            <h4>Envíos a todo Paraguay</h4>
            <p>Entregas rápidas y seguras</p>
          </div>
        </div>
        
        <div className="benefit-item">
          <div className="benefit-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line>
            </svg>
          </div>
          <div className="benefit-text">
            <h4>Pagos Flexibles</h4>
            <p>Transferencia o código QR</p>
          </div>
        </div>

        <div className="benefit-item">
          <div className="benefit-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
          </div>
          <div className="benefit-text">
            <h4>Atención Personalizada</h4>
            <p>Soporte directo vía WhatsApp</p>
          </div>
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
            <div className="footer-brand-logo">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#footer-logo-gradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="brand-logo-icon" style={{marginRight: '8px', verticalAlign: 'middle'}}>
                <defs>
                  <linearGradient id="footer-logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
              PuraTech
            </div>
            <p>Tu tienda de tecnología y electrónica de confianza en Paraguay.</p>
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
            <p>📧 email@puratech.com</p>
            <p>📍 Asunción, Paraguay</p>
          </div>
        </div>
        <p className="footer-bottom">© 2026 PuraTech — Todos los derechos reservados</p>
      </footer>
    </div>
  );
};

export default Home;
