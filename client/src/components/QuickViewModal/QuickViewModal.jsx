import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiX, FiShoppingBag, FiHeart, FiChevronLeft, FiChevronRight, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useWishlist } from '../../context/WishlistContext';
import './QuickViewModal.css';
import { isOfferActive } from '../../utils/offerUtils';

const QuickViewModal = ({ product, onClose, onAddToCart }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [selectedImage, setSelectedImage] = useState(0);
  const [expandedDesc, setExpandedDesc] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const allImages = useMemo(() => {
    const imgs = [];
    if (product?.imageUrl) imgs.push(product.imageUrl);
    if (product?.images) {
      product.images.forEach(img => {
        if (!imgs.includes(img)) imgs.push(img);
      });
    }
    return imgs.length > 0 ? imgs : ['/img/placeholder.png'];
  }, [product]);

  const parseFeatures = (text) => {
    if (!text) return [];
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const features = [];
    let inList = false;
    for (const line of lines) {
      const bullet = line.replace(/^[•\-*✓]\s*/, '').trim();
      if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || line.startsWith('✓')) {
        features.push({ type: 'bullet', text: bullet });
        inList = true;
      } else if (line.match(/^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+:/)) {
        features.push({ type: 'bullet', text: line });
        inList = true;
      } else if (inList && line.length > 3) {
        features.push({ type: 'bullet', text: line });
      } else if (line.length > 10) {
        features.push({ type: 'text', text: line });
      }
    }
    return features.length > 0 ? features : [{ type: 'text', text }];
  };

  const features = useMemo(() => parseFeatures(product?.descripcion), [product]);
  const visibleFeatures = expandedDesc ? features : features.slice(0, 6);
  const hasMore = features.length > 6;

  const handleAddToCart = () => {
    setAdding(true);
    onAddToCart(product);
    setTimeout(() => setAdding(false), 1200);
  };

  const nextImage = () => setSelectedImage(prev => (prev + 1) % allImages.length);
  const prevImage = () => setSelectedImage(prev => (prev - 1 + allImages.length) % allImages.length);

  if (!product) return null;

  const inWishlist = isInWishlist(product._id);

  return (
    <div className="qv-overlay" onClick={onClose}>
      <div className="qv-modal" onClick={e => e.stopPropagation()}>
        <button className="qv-close" onClick={onClose} aria-label="Cerrar">
          <FiX size={22} />
        </button>

        <div className="qv-layout">
          <div className="qv-gallery">
            <div className="qv-main-image-wrapper">
              {allImages.length > 1 && (
                <>
                  <button className="qv-gallery-arrow qv-gallery-prev" onClick={prevImage} aria-label="Anterior">
                    <FiChevronLeft size={22} />
                  </button>
                  <button className="qv-gallery-arrow qv-gallery-next" onClick={nextImage} aria-label="Siguiente">
                    <FiChevronRight size={22} />
                  </button>
                </>
              )}
              <img
                src={allImages[selectedImage]}
                alt={product.nombre}
                className="qv-main-image"
              />
            </div>
            {allImages.length > 1 && (
              <div className="qv-thumbnails">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    className={`qv-thumb ${i === selectedImage ? 'active' : ''}`}
                    onClick={() => setSelectedImage(i)}
                  >
                    <img src={img} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="qv-info">
            {product.marca && (
              <span className="qv-brand-badge">{product.marca}</span>
            )}

            <h2 className="qv-title">{product.nombre}</h2>

            {isOfferActive(product) && product.precioAnterior ? (
              <div className="qv-price-block">
                <div className="qv-price-row">
                  <span className="qv-old-price">
                    {Number(product.precioAnterior).toLocaleString('es-PY')} Gs.
                  </span>
                  {product.porcentajeDescuento && (
                    <span className="qv-discount">-{product.porcentajeDescuento}%</span>
                  )}
                </div>
                <span className="qv-price offer">
                  {Number(product.precio).toLocaleString('es-PY')} Gs.
                </span>
              </div>
            ) : (
              <div className="qv-price-block">
                <span className="qv-price">
                  {Number(product.precio).toLocaleString('es-PY')} Gs.
                </span>
              </div>
            )}

            <div className="qv-stock">
              {product.stock <= 0 ? (
                <span className="qv-stock-badge out">Agotado</span>
              ) : product.stock <= 5 ? (
                <span className="qv-stock-badge low">
                  Solo {product.stock} disponibles
                </span>
              ) : (
                <span className="qv-stock-badge in">En stock</span>
              )}
            </div>

            {features.length > 0 && (
              <div className="qv-features">
                <ul className={`qv-feature-list ${!expandedDesc && hasMore ? 'collapsed' : ''}`}>
                  {visibleFeatures.map((f, i) => (
                    <li key={i} className={f.type === 'text' ? 'qv-feature-text' : 'qv-feature-bullet'}>
                      {f.type === 'bullet' && <span className="qv-bullet-icon">✓</span>}
                      {f.text}
                    </li>
                  ))}
                </ul>
                {hasMore && (
                  <button className="qv-expand-btn" onClick={() => setExpandedDesc(!expandedDesc)}>
                    {expandedDesc ? (
                      <>Ver menos <FiChevronUp size={16} /></>
                    ) : (
                      <>Ver descripción completa <FiChevronDown size={16} /></>
                    )}
                  </button>
                )}
              </div>
            )}

            <div className="qv-actions">
              <button
                className="qv-btn-cart"
                onClick={handleAddToCart}
                disabled={product.stock <= 0 || adding}
              >
                {adding ? (
                  <>
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Agregado
                  </>
                ) : (
                  <>
                    <FiShoppingBag size={20} />
                    Agregar al carrito
                  </>
                )}
              </button>
              <button
                className={`qv-btn-wishlist ${inWishlist ? 'active' : ''}`}
                onClick={() => toggleWishlist(product._id)}
                aria-label={inWishlist ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              >
                <FiHeart size={18} />
              </button>
              <Link to={`/product/${product._id}`} className="qv-btn-detail" onClick={onClose}>
                Vista detallada
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
