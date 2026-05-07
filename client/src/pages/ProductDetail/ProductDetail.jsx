import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from '../../config';
import { useCart } from '../../context/CartContext';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/product/${id}`);
        setProduct(res.data);
        setCurrentImageIndex(0); // Reset to first image
      } catch (error) {
        console.error("Error cargando producto:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const getAllImages = () => {
    if (!product) return [];
    const images = [];
    
    console.log("🖼️ [ProductDetail] product.imageUrl:", product.imageUrl);
    console.log("🖼️ [ProductDetail] product.images:", product.images);
    
    // Helper simple - aceptar cualquier URL válida de imagen
    const isValidImageUrl = (url) => {
      if (!url || typeof url !== 'string') return false;
      console.log("🖼️ [isValidImageUrl] Checking URL:", url);
      // Aceptar URLs que empiezan con / (uploads locales)
      if (url.startsWith('/uploads/')) return true;
      // Aceptar cualquier URL https/http que parezca imagen
      if (url.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i)) return true;
      if (url.match(/^https?:\/\/.+/i)) return true;
      return false;
    };
    
    // Process imageUrl
    if (product.imageUrl && isValidImageUrl(product.imageUrl)) {
      console.log("🖼️ [ProductDetail] Adding imageUrl:", product.imageUrl);
      images.push(product.imageUrl);
    }
    
    // Process images array
    if (product.images && Array.isArray(product.images)) {
      console.log("🖼️ [ProductDetail] Processing images array, length:", product.images.length);
      product.images.forEach(img => {
        console.log("🖼️ [ProductDetail] Checking image:", img);
        if (img && isValidImageUrl(img) && !images.includes(img)) {
          console.log("🖼️ [ProductDetail] Adding image:", img);
          images.push(img);
        }
      });
    }
    
    console.log("🖼️ [ProductDetail] Final images array:", images);
    return images.length > 0 ? images : ["/img/placeholder.png"];
  };

  const images = getAllImages();

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  const handleAddToCart = () => {
    setAddingToCart(true);
    addToCart(product);
    setTimeout(() => {
      setAddingToCart(false);
    }, 1500);
  };

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

  return (
    <div className="detail-container">
      <div className="breadcrumbs">
        <Link to="/">Inicio</Link> <span className="separator">/</span>
        <Link to={`/category/${encodeURIComponent(product.category)}`}>{product.category}</Link>
        <span className="separator">/</span>
        <span>{product.nombre}</span>
      </div>

      <div className="detail-layout">
        {/* Image Gallery */}
        <div className="gallery-section">
<div className="main-image-container">
              <img 
                src={images && images.length > 0 ? images[currentImageIndex] : '/img/placeholder.png'} 
                alt={`${product.nombre} - Imagen ${currentImageIndex + 1}`}
                className="main-image"
                onError={(e) => { e.target.src = '/img/placeholder.png'; }}
              />
            
            {images.length > 1 && (
              <>
                <button className="gallery-btn prev-btn" onClick={prevImage}>
                  ‹
                </button>
                <button className="gallery-btn next-btn" onClick={nextImage}>
                  ›
                </button>
              </>
            )}

            {product.isOffer && <span className="badge-detail offer">OFERTA</span>}
            {product.isNew && <span className="badge-detail new">NUEVO</span>}
          </div>

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
                     alt={`${product.nombre} - ${index + 1}`}
                   />
                 </div>
               ))}
             </div>
          )}
        </div>

        {/* Product Info */}
        <div className="product-info-section">
          <div className="product-header">
            <span className="product-brand-detail">{product.marca}</span>
            <h1 className="product-title">{product.nombre}</h1>
          </div>

          <div className="price-section">
            <span className="product-price-detail">
              {Number(product.precio).toLocaleString("es-PY")} Gs.
            </span>
            <span className="stock-detail">
              ✓ Stock: {product.stock || 10} unidades
            </span>
          </div>

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

          <div className="actions-section">
            <button 
              className={`add-to-cart-detail-btn ${addingToCart ? 'added' : ''}`}
              onClick={handleAddToCart}
              disabled={addingToCart}
            >
              {addingToCart ? '✓ Agregado' : '🛒 Agregar al carrito'}
            </button>
          </div>

          <div className="meta-info">
            <div className="meta-item">
              <span className="meta-label">Categoría:</span>
              <Link to={`/category/${encodeURIComponent(product.category)}`} className="meta-value">
                {product.category}
              </Link>
            </div>
            <div className="meta-item">
              <span className="meta-label">Ventas:</span>
              <span className="meta-value">{product.ventas || 0} ventas</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
