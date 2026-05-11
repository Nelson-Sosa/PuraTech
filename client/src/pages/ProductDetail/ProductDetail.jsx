import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { API_URL } from '../../config';
import { useCart } from '../../context/CartContext';
import './ProductDetail.css';

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
      <div className="detail-loading">
        <div className="loading-spinner"></div>
        <p>Cargando producto...</p>
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

  /* ── Urgency helper (based on stock) ── */
  const getUrgencyText = () => {
    const stock = product.stock || 10;
    if (stock <= 3) return `⚡ ¡Solo ${stock} en stock!`;
    if (stock <= 8) return `🔥 Pocas unidades`;
    if ((product.ventas || 0) >= 10) return `🏆 Muy popular`;
    return null;
  };
  const urgencyText = getUrgencyText();

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
                <button className="gallery-btn prev-btn" onClick={prevImage} aria-label="Imagen anterior">‹</button>
                <button className="gallery-btn next-btn" onClick={nextImage} aria-label="Imagen siguiente">›</button>
              </>
            )}

            {/* Image counter */}
            {images.length > 1 && (
              <span className="image-counter">{currentImageIndex + 1} / {images.length}</span>
            )}

            {/* Badges */}
            {product.isOffer && <span className="badge-detail offer">OFERTA</span>}
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
            <span className="product-price-detail">
              {Number(product.precio).toLocaleString("es-PY")} Gs.
            </span>
            <span className="stock-detail">
              Stock: {product.stock || 10} unidades
            </span>
            {urgencyText && (
              <span className="urgency-hint">{urgencyText}</span>
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
            <div className="cart-btn-wrapper">
              <button
                className={`add-to-cart-detail-btn ${addingToCart ? 'added' : ''}`}
                onClick={handleAddToCart}
                disabled={addingToCart}
              >
                {addingToCart ? (
                  <><span>✓</span> ¡Agregado al carrito!</>
                ) : (
                  <><span>🛒</span> Agregar al carrito</>
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
    </div>
  );
};

export default ProductDetail;
