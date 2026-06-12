import { memo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import './Wishlist.css';
import { isOfferActive } from '../../utils/offerUtils';

/* ── Helpers ── */
const getProductImages = (product) => {
  const images = [];
  if (product.imageUrl) images.push(product.imageUrl);
  if (product.images?.length) {
    product.images.forEach(img => {
      if (!images.includes(img)) images.push(img);
    });
  }
  return images;
};

const getStockLabel = (stock) => {
  if (stock > 5) return { label: 'En stock', className: 'wishlist-card__stock--in' };
  if (stock > 0) return { label: 'Últimas unidades', className: 'wishlist-card__stock--low' };
  return { label: 'Agotado', className: 'wishlist-card__stock--out' };
};

/* ── Skeleton Loading ── */
const WishlistSkeleton = memo(() => (
  <div className="wishlist-skeleton-grid" role="status" aria-label="Cargando lista de deseos">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="wishlist-skeleton-card" aria-hidden="true">
        <div className="wishlist-skeleton-img skeleton-pulse" />
        <div className="wishlist-skeleton-body">
          <div className="wishlist-skeleton-line skeleton-pulse" style={{ width: '35%' }} />
          <div className="wishlist-skeleton-line skeleton-pulse" style={{ width: '75%' }} />
          <div className="wishlist-skeleton-line skeleton-pulse" style={{ width: '45%' }} />
          <div className="wishlist-skeleton-line skeleton-pulse" style={{ width: '28%' }} />
        </div>
      </div>
    ))}
    <span className="sr-only">Cargando productos favoritos...</span>
  </div>
));

WishlistSkeleton.displayName = 'WishlistSkeleton';

/* ── Individual Card ── */
const WishlistCard = memo(({ item, onRemove, onAddToCart, addingId }) => {
  const product = typeof item.product === 'object' ? item.product : null;
  if (!product) return null;

  const productId = product._id;
  const images = getProductImages(product);
  const primaryImg = images[0] || '/img/placeholder.png';
  const isAdding = addingId === productId;
  const stockInfo = getStockLabel(product.stock);
  const isOutOfStock = product.stock <= 0;

  return (
    <article className="wishlist-card" aria-label={`${product.nombre} — ${product.marca || ''}`}>
      <Link
        to={`/product/${productId}`}
        className="wishlist-card__image-wrap"
        aria-label={`Ver ${product.nombre}`}
        tabIndex={0}
      >
        <img
          src={primaryImg}
          alt={product.nombre}
          className="wishlist-card__image"
          loading="lazy"
          decoding="async"
        />
        {isOfferActive(product) && product.porcentajeDescuento > 0 && (
          <span className="wishlist-card__badge" aria-label={`${product.porcentajeDescuento} por ciento de descuento`}>
            -{product.porcentajeDescuento}%
          </span>
        )}
      </Link>

      <div className="wishlist-card__body">
        {product.marca && (
          <span className="wishlist-card__brand">{product.marca}</span>
        )}

        <Link
          to={`/product/${productId}`}
          className="wishlist-card__name"
          aria-label={product.nombre}
        >
          {product.nombre}
        </Link>

        <span className="wishlist-card__category">{product.category}</span>

        <div className="wishlist-card__pricing">
          {isOfferActive(product) && product.precioAnterior ? (
            <>
              <span className="wishlist-card__old-price" aria-label="Precio anterior">
                {Number(product.precioAnterior).toLocaleString('es-PY')} Gs.
              </span>
              <span className="wishlist-card__price wishlist-card__price--offer" aria-label="Precio oferta">
                {Number(product.precio).toLocaleString('es-PY')} Gs.
              </span>
            </>
          ) : (
            <span className="wishlist-card__price" aria-label="Precio">
              {Number(product.precio).toLocaleString('es-PY')} Gs.
            </span>
          )}
        </div>

        <span
          className={`wishlist-card__stock ${stockInfo.className}`}
          aria-label={stockInfo.label}
          role="status"
        >
          {stockInfo.label}
        </span>

        <div className="wishlist-card__actions">
          <button
            className={`wishlist-card__btn wishlist-card__btn--cart ${isAdding ? 'adding' : ''}`}
            onClick={() => onAddToCart(product)}
            disabled={isAdding || isOutOfStock}
            aria-label={isOutOfStock ? 'Producto agotado' : isAdding ? 'Agregado al carrito' : 'Agregar al carrito'}
            aria-busy={isAdding}
          >
            {isAdding ? (
              <>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Agregado
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                Agregar al carrito
              </>
            )}
          </button>

          <Link
            to={`/product/${productId}`}
            className="wishlist-card__btn wishlist-card__btn--view"
            aria-label={`Ver detalle de ${product.nombre}`}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
            </svg>
            Ver
          </Link>

          <button
            className="wishlist-card__btn wishlist-card__btn--remove"
            onClick={() => onRemove(productId)}
            aria-label={`Eliminar ${product.nombre} de favoritos`}
            title="Eliminar de favoritos"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
});

WishlistCard.displayName = 'WishlistCard';

/* ── Main Page ── */
const Wishlist = () => {
  const { favorites, loading, count, removeFavorite } = useWishlist();
  const { addToCart } = useCart();
  const [addingId, setAddingId] = useState(null);

  const handleAddToCart = useCallback((product) => {
    setAddingId(product._id);
    addToCart(product);
    setTimeout(() => setAddingId(null), 1200);
  }, [addToCart]);

  const handleRemove = useCallback(async (productId) => {
    await removeFavorite(productId);
  }, [removeFavorite]);

  return (
    <main className="wishlist-page">
      <div className="wishlist-container">
        <header className="wishlist-header">
          <div className="wishlist-header__title-group">
            <h1 className="wishlist-header__title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              Lista de Deseos
            </h1>
            <p className="wishlist-header__subtitle">
              {count > 0
                ? `Tenés ${count} producto${count !== 1 ? 's' : ''} guardado${count !== 1 ? 's' : ''}`
                : 'Guardá tus productos favoritos para comprarlos después'}
            </p>
          </div>
        </header>

        {loading ? (
          <WishlistSkeleton />
        ) : favorites.length === 0 ? (
          <div className="wishlist-empty">
            <div className="wishlist-empty__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <h2 className="wishlist-empty__title">Tu lista de deseos está vacía</h2>
            <p className="wishlist-empty__text">
              Guardá productos que te gusten para comprarlos más tarde.
              Todos tus favoritos van a aparecer acá.
            </p>
            <Link
              to="/products"
              className="wishlist-empty__btn"
              aria-label="Explorar productos en la tienda"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Explorar productos
            </Link>
          </div>
        ) : (
          <div className="wishlist-grid" role="list" aria-label="Lista de productos favoritos">
            {favorites.map((item, index) => (
              <div key={item._id} role="listitem" style={{ animationDelay: `${(index % 8) * 0.04}s` }}>
                <WishlistCard
                  item={item}
                  onRemove={handleRemove}
                  onAddToCart={handleAddToCart}
                  addingId={addingId}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Wishlist;
