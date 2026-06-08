import { useEffect } from 'react';
import { FiX, FiShoppingBag } from 'react-icons/fi';
import './QuickViewModal.css';

const QuickViewModal = ({ product, onClose, onAddToCart }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!product) return null;

  const primaryImg = product.imageUrl || (product.images && product.images[0]) || '/img/placeholder.png';
  const allImages = [];
  if (product.imageUrl) allImages.push(product.imageUrl);
  if (product.images) {
    product.images.forEach(img => {
      if (!allImages.includes(img)) allImages.push(img);
    });
  }

  return (
    <div className="quickview-overlay" onClick={onClose}>
      <div className="quickview-modal" onClick={e => e.stopPropagation()}>
        <button className="quickview-close" onClick={onClose} aria-label="Cerrar">
          <FiX size={20} />
        </button>
        <div className="quickview-content">
          <div className="quickview-image-section">
            <img src={primaryImg} alt={product.nombre} className="quickview-main-image" />
            {allImages.length > 1 && (
              <div className="quickview-thumbnails">
                {allImages.slice(0, 4).map((img, i) => (
                  <div key={i} className="quickview-thumb">
                    <img src={img} alt="" />
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="quickview-details">
            {product.category && (
              <span className="quickview-category">{product.category}</span>
            )}
            <h2 className="quickview-title">{product.nombre}</h2>
            {product.marca && (
              <p className="quickview-brand">{product.marca}</p>
            )}
            <div className="quickview-price-row">
              {product.isOffer && product.precioAnterior ? (
                <>
                  <span className="quickview-old-price">
                    {Number(product.precioAnterior).toLocaleString("es-PY")} Gs.
                  </span>
                  <span className="quickview-current-price highlight">
                    {Number(product.precio).toLocaleString("es-PY")} Gs.
                  </span>
                  {product.porcentajeDescuento && (
                    <span className="quickview-discount-badge">
                      -{product.porcentajeDescuento}%
                    </span>
                  )}
                </>
              ) : (
                <span className="quickview-current-price">
                  {Number(product.precio).toLocaleString("es-PY")} Gs.
                </span>
              )}
            </div>
            {product.descripcion && (
              <p className="quickview-description">{product.descripcion}</p>
            )}
            <div className="quickview-stock">
              {product.stock > 0 ? (
                <span className="in-stock">Stock disponible: {product.stock} unidades</span>
              ) : (
                <span className="out-of-stock">Sin stock</span>
              )}
            </div>
            <button
              className="quickview-add-to-cart"
              onClick={() => onAddToCart(product)}
              disabled={product.stock <= 0}
            >
              <FiShoppingBag size={18} />
              {product.stock > 0 ? 'Agregar al carrito' : 'Sin stock'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
