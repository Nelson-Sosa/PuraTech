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
    if (product.imageUrl) images.push(product.imageUrl);
    if (product.images && product.images.length > 0) {
      product.images.forEach(img => {
        if (!images.includes(img)) images.push(img);
      });
    }
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
               src={images[currentImageIndex]} 
               alt={`${product.nombre} - Imagen ${currentImageIndex + 1}`}
               className="main-image"
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
            <p>{product.descripcion}</p>
          </div>

          <div className="actions-section">
            <button 
              className={`add-to-cart-detail-btn ${addingToCart ? 'added' : ''}`}
              onClick={handleAddToCart}
              disabled={addingToCart}
            >
              {addingToCart ? '✓ Agregado' : '🛒 Agregar al carrito'}
            </button>
            
            <Link to="/cart" className="buy-now-btn">
              Comprar ahora
            </Link>
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
