import { Link } from "react-router-dom";
import { useCart } from '../../context/CartContext';
import { useState } from 'react';
import { API_URL } from '../../config';

const Cart = () => {
  const { cart, removeFromCart, clearCart, getTotal, getCount } = useCart();
  const [searchQuery, setSearchQuery] = useState("");

  const handleWhatsApp = () => {
    const productsList = cart.map(p => 
      `- ${p.nombre} (${p.quantity}x) - ${(p.precio * p.quantity).toLocaleString("es-PY")} Gs.`
    ).join('%0A'); // %0A es salto de línea

    const message = `Hola! Quiero comprar:%0A${productsList}%0ATotal: ${getTotal().toLocaleString("es-PY")} Gs.`;
    window.open(`https://wa.me/595981123456?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <h2>🛒 Tu carrito está vacío</h2>
        <Link to="/" className="continue-shopping">Seguir comprando</Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h2>🛒 Tu Carrito ({getCount()} productos)</h2>

      <div className="cart-layout">
        <div className="cart-items">
          {cart.map(item => (
            <div key={item._id} className="cart-item">
              <img 
                src={item.imageUrl || "/img/placeholder.png"} 
                alt={item.nombre}
                className="cart-item-image"
              />
              <div className="cart-item-info">
                <h3>{item.nombre}</h3>
                <p className="brand">{item.marca}</p>
                <p className="price">{Number(item.precio).toLocaleString("es-PY")} Gs. x {item.quantity}</p>
              </div>
              <button 
                className="remove-btn"
                onClick={() => removeFromCart(item._id)}
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3>Resumen del pedido</h3>
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>{getTotal().toLocaleString("es-PY")} Gs.</span>
          </div>
          <div className="summary-row total">
            <span>Total:</span>
            <span>{getTotal().toLocaleString("es-PY")} Gs.</span>
          </div>
          <button className="checkout-btn" onClick={handleWhatsApp}>
            📱 Enviar pedido por WhatsApp
          </button>
          <button className="clear-btn" onClick={clearCart}>
            Vaciar carrito
          </button>
          <Link to="/" className="continue-shopping">Seguir comprando</Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;
