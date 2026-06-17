import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { API_URL } from '../../config';
import { useCart } from '../../context/CartContext';
import './ProductDetail.css';
import { isOfferActive } from '../../utils/offerUtils';
import ProductReviews from '../../components/ProductReviews/ProductReviews';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct]               = useState(null);
  const [loading, setLoading]               = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [addingToCart, setAddingToCart]     = useState(false);
  const [userRole, setUserRole]             = useState(null);

  // ── Image zoom follow-mouse state ──
  const [isZoomed, setIsZoomed]             = useState(false);
  const [zoomPos, setZoomPos]               = useState({ x: 50, y: 50 });
  const imageContainerRef                   = useRef(null);

  /* ── Data fetching ── */
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/product/${id}`);
        setProduct(res.data);
        setCurrentImageIndex(0);
      } catch (error) {
        console.error("Error cargando producto:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    const role = localStorage.getItem('rol');
    setUserRole(role);
  }, []);

  /* ── Image helpers ── */
  const getAllImages = useCallback(() => {
    if (!product) return [];
    const images = [];

    const isValidImageUrl = (url) => {
      if (!url || typeof url !== 'string') return false;
      if (url.startsWith('/uploads/')) return true;
      if (url.match(/^https?:\/\/.+/i)) return true;
      return false;
    };

    if (product.imageUrl && isValidImageUrl(product.imageUrl)) {
      images.push(product.imageUrl);
    }

    if (product.images && Array.isArray(product.images)) {
      product.images.forEach(img => {
        if (img && isValidImageUrl(img) && !images.includes(img)) {
          images.push(img);
        }
      });
    }

    return images.length > 0 ? images : ["/img/placeholder.png"];
  }, [product]);

  const images = getAllImages();

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  const goToImage = (index) => setCurrentImageIndex(index);

  /* ── Zoom on mouse move ── */
  const handleMouseMove = useCallback((e) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  }, []);

  const handleMouseEnter = () => setIsZoomed(true);
  const handleMouseLeave = () => { setIsZoomed(false); setZoomPos({ x: 50, y: 50 }); };

  /* ── Cart action ── */
  const handleAddToCart = () => {
    setAddingToCart(true);
    addToCart(product);
    setTimeout(() => setAddingToCart(false), 1500);
  };

  /* ── Keyboard navigation ── */
  useEffect(() => {
    const handleKey = (e) => {
      if (images.length <= 1) return;
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft')  prevImage();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [images.length, currentImageIndex]);

  /* ── States ── */
  if (loading) {
    return (
      <div className="detail-container">
        <div className="detail-layout">
          <div className="gallery-section">
            <div className="skeleton-detail-img skeleton"></div>
          </div>
          <div className="product-info-section">
            <div className="skeleton-detail-title skeleton"></div>
            <div className="skeleton-detail-price skeleton"></div>
            <div className="skeleton-detail-desc skeleton"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="detail-empty">
        <span className="empty-icon">😕</span>
        <h2>Producto no encontrado</h2>
        <Link to="/products" className="back-link">← Volver a productos</Link>
      </div>
    );
  }

  /* ── Stock badge based on availability ── */
  const getStockBadge = () => {
    const stock = product.stock || 10;
    if (stock <= 0) return null;
    if (stock <= 3) return { text: 'Últimas unidades disponibles', type: 'critical' };
    if (stock <= 10) return { text: 'Stock limitado', type: 'warning' };
    return { text: 'En stock', type: 'available' };
  };
  const stockBadge = getStockBadge();

  return (
    <div className="detail-container">
      {/* Breadcrumbs */}
      <div className="breadcrumbs">
        <Link to="/">Inicio</Link>
        <span className="separator">/</span>
        <Link to={`/category/${encodeURIComponent(product.category)}`}>{product.category}</Link>
        <span className="separator">/</span>
        <span>{product.nombre}</span>
      </div>

      <div className="detail-layout">

        {/* ── Image Gallery ── */}
        <div className="gallery-section">

          {/* Main image */}
          <div
            ref={imageContainerRef}
            className="main-image-container"
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <img
              src={images.length > 0 ? images[currentImageIndex] : '/img/placeholder.png'}
              alt={`${product.nombre} — Imagen ${currentImageIndex + 1}`}
              className="main-image"
              onError={(e) => { e.target.src = '/img/placeholder.png'; }}
              style={isZoomed ? {
                transform: `scale(1.35)`,
                transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                transition: 'transform 0.1s ease',
              } : {}}
            />

            {/* Arrow navigation — appear on hover (CSS handles opacity) */}
            {images.length > 1 && (
              <>
                <button className="gallery-btn prev-btn" onClick={prevImage} aria-label="Imagen anterior">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button className="gallery-btn next-btn" onClick={nextImage} aria-label="Imagen siguiente">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </>
            )}

            {/* Image counter */}
            {images.length > 1 && (
              <span className="image-counter">{currentImageIndex + 1} / {images.length}</span>
            )}

            {/* Badges */}
            {isOfferActive(product) && product.porcentajeDescuento && <span className="offer-badge-detail">-{product.porcentajeDescuento}%</span>}
            {product.isNew  && <span className="badge-detail new">NUEVO</span>}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="thumbnail-grid">
              {images.map((img, index) => (
                <div
                  key={index}
                  className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                  onClick={() => goToImage(index)}
                >
                  <img
                    src={img}
                    alt={`${product.nombre} — ${index + 1}`}
                    onError={(e) => { e.target.src = '/img/placeholder.png'; }}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Product Info ── */}
        <div className="product-info-section">

          {/* Header */}
          <div className="product-header">
            <span className="product-brand-detail">{product.marca}</span>
            <h1 className="product-title">{product.nombre}</h1>
          </div>

          {/* Price + Stock + Urgency */}
          <div className="price-section">
            {isOfferActive(product) && product.precioAnterior ? (
              <div className="price-detail-container">
                <div className="price-detail-row">
                  <span className="old-price-detail">
                    {Number(product.precioAnterior).toLocaleString("es-PY")} Gs.
                  </span>
                  {isOfferActive(product) && product.porcentajeDescuento ? (
                    <span className="discount-badge-detail">-{product.porcentajeDescuento}%</span>
                  ) : null}
                </div>
                <span className="product-price-detail">
                  {Number(product.precio).toLocaleString("es-PY")} Gs.
                </span>
              </div>
            ) : (
              <span className="product-price-detail">
                {Number(product.precio).toLocaleString("es-PY")} Gs.
              </span>
            )}
            <span className={`stock-detail ${stockBadge ? `stock-detail--${stockBadge.type}` : ''}`}>
              {product.stock || 10} unidades
            </span>
            {stockBadge && (
              <span className={`stock-badge stock-badge--${stockBadge.type}`}>{stockBadge.text}</span>
            )}
          </div>

          {/* Description */}
          <div className="description-section">
            <h3>Descripción</h3>
            <div className="formatted-description">
              {product.descripcion?.split('\n').map((line, index) => {
                const trimmed = line.trim();
                if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
                  return <li key={index}>{trimmed.replace(/^[•\-*]\s*/, '')}</li>;
                }
                return trimmed ? <p key={index}>{trimmed}</p> : <br key={index} />;
              })}
            </div>
          </div>

          {/* Add to Cart — Premium */}
          <div className="actions-section">
            {product.stock <= 0 && <div className="out-of-stock-notice">Agotado</div>}
            <div className="cart-btn-wrapper">
              <button
                className={`add-to-cart-detail-btn ${addingToCart ? 'added' : ''} ${product.stock <= 0 ? 'out-of-stock' : ''}`}
                onClick={handleAddToCart}
                disabled={addingToCart || product.stock <= 0}
              >
                {product.stock <= 0 ? (
                  <>
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="15" y1="9" x2="9" y2="15"></line>
                      <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                    Sin Stock
                  </>
                ) : addingToCart ? (
                  <>
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    ¡Agregado al carrito!
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                      <line x1="3" y1="6" x2="21" y2="6"></line>
                      <path d="M16 10a4 4 0 0 1-8 0"></path>
                    </svg>
                    Agregar al carrito
                  </>
                )}
              </button>
            </div>

            {/* Trust badges */}
            <div className="trust-badges">
              <span className="trust-badge">🔒 Compra segura</span>
              <span className="trust-badge">🚚 Envío a todo PY</span>
              <span className="trust-badge">💬 Soporte WhatsApp</span>
            </div>
          </div>

          {/* Meta info */}
          <div className="meta-info">
            <div className="meta-item">
              <span className="meta-label">Categoría:</span>
              <Link to={`/category/${encodeURIComponent(product.category)}`} className="meta-value">
                {product.category}
              </Link>
            </div>
            {userRole === 'admin' && (
              <div className="meta-item">
                <span className="meta-label">Ventas:</span>
                <span className="meta-value">{product.ventas || 0} unidades vendidas</span>
              </div>
            )}
            {product.sku && (
              <div className="meta-item">
                <span className="meta-label">SKU:</span>
                <span className="meta-value">{product.sku}</span>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── SECCIÓN DE RESEÑAS ── */}
      <ProductReviews productId={id} />
    </div>
  );
};

export default ProductDetail;
