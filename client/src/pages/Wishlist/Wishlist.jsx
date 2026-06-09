import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import './Wishlist.css';

const WishlistSkeleton = () => (
  <div className="wishlist-skeleton-grid">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="wishlist-skeleton-card">
        <div className="wishlist-skeleton-img skeleton-pulse" />
        <div className="wishlist-skeleton-body">
          <div className="wishlist-skeleton-line skeleton-pulse" style={{ width: '40%' }} />
          <div className="wishlist-skeleton-line skeleton-pulse" style={{ width: '80%' }} />
          <div className="wishlist-skeleton-line skeleton-pulse" style={{ width: '50%' }} />
          <div className="wishlist-skeleton-line skeleton-pulse" style={{ width: '30%' }} />
        </div>
      </div>
    ))}
  </div>
);

const WishlistCard = ({ item, onRemove, onAddToCart, addingId }) => {
  const product = typeof item.product === 'object' ? item.product : null;
  if (!product) return null;

  const productId = product._id;
  const allImages = [];
  if (product.imageUrl) allImages.push(product.imageUrl);
  if (product.images && product.images.length > 0) {
    product.images.forEach(img => {
      if (!allImages.includes(img)) allImages.push(img);
    });
  }
  const primaryImg = allImages.length > 0 ? allImages[0] : '/img/placeholder.png';

  const isAdding = addingId === productId;

  return (
    <div className="wishlist-card">
      <Link to={`/product/${productId}`} className="wishlist-card__image-wrap">
        <img
          src={primaryImg}
          alt={product.nombre}
          className="wishlist-card__image"
          loading="lazy"
        />
        {product.porcentajeDescuento > 0 && (
          <span className="wishlist-card__badge">-{product.porcentajeDescuento}%</span>
        )}
      </Link>

      <div className="wishlist-card__info">
        {product.marca && <span className="wishlist-card__brand">{product.marca}</span>}
        <Link to={`/product/${productId}`} className="wishlist-card__name">
          {product.nombre}
        </Link>

        <span className="wishlist-card__category">{product.category}</span>

        <div className="wishlist-card__pricing">
          {product.isOffer && product.precioAnterior ? (
            <>
              <span className="wishlist-card__old-price">
                {Number(product.precioAnterior).toLocaleString('es-PY')} Gs.
              </span>
              <span className="wishlist-card__price wishlist-card__price--offer">
                {Number(product.precio).toLocaleString('es-PY')} Gs.
              </span>
            </>
          ) : (
            <span className="wishlist-card__price">
              {Number(product.precio).toLocaleString('es-PY')} Gs.
            </span>
          )}
        </div>

        <span className={`wishlist-card__stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
          {product.stock > 0 ? `Stock: ${product.stock} unidades` : 'Sin stock'}
        </span>

        <div className="wishlist-card__actions">
          <button
            className={`wishlist-card__btn wishlist-card__btn--cart ${isAdding ? 'adding' : ''}`}
            onClick={() => onAddToCart(product)}
            disabled={isAdding || product.stock <= 0}
          >
            {isAdding ? (
              <>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Agregado
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                Agregar al carrito
              </>
            )}
          </button>

          <Link to={`/product/${productId}`} className="wishlist-card__btn wishlist-card__btn--view">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
            </svg>
            Ver producto
          </Link>

          <button
            className="wishlist-card__btn wishlist-card__btn--remove"
            onClick={() => onRemove(productId)}
            aria-label="Eliminar de favoritos"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

const Wishlist = () => {
  const { favorites, loading, count, removeFavorite, fetchFavorites } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [addingId, setAddingId] = useState(null);

  const handleAddToCart = (product) => {
    setAddingId(product._id);
    addToCart(product);
    setTimeout(() => setAddingId(null), 1200);
  };

  const handleRemove = async (productId) => {
    await removeFavorite(productId);
  };

  return (
    <div className="wishlist-page">
      <div className="wishlist-container">
        <div className="wishlist-header">
          <div className="wishlist-header__title-group">
            <h1 className="wishlist-header__title">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              Lista de Deseos
            </h1>
            <p className="wishlist-header__subtitle">
              {count > 0
                ? `Tenés ${count} producto${count !== 1 ? 's' : ''} guardado${count !== 1 ? 's' : ''} en tu lista`
                : 'Guardá tus productos favoritos para comprarlos después'}
            </p>
          </div>
        </div>

        {loading ? (
          <WishlistSkeleton />
        ) : favorites.length === 0 ? (
          <div className="wishlist-empty">
            <div className="wishlist-empty__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <h2 className="wishlist-empty__title">Tu lista de deseos está vacía</h2>
            <p className="wishlist-empty__text">
              Guardá productos que te gusten para comprarlos más tarde. Todos tus favoritos van a aparecer acá.
            </p>
            <Link to="/products" className="wishlist-empty__btn">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Explorar productos
            </Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {favorites.map(item => (
              <WishlistCard
                key={item._id}
                item={item}
                onRemove={handleRemove}
                onAddToCart={handleAddToCart}
                addingId={addingId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
