import { Link } from "react-router-dom";
import { useCart } from '../../context/CartContext';
import { useState } from 'react';
import { API_URL } from '../../config';
import './Cart.css';
import Navbar from '../../components/Navbar/Navbar';
import { sendWhatsAppOrder } from '../../utils/whatsapp';

const Cart = () => {
  const { cart, removeFromCart, clearCart, getTotal, getCount } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: ''
  });

  const handleWhatsApp = () => {
    console.log("Click detectado", cart, customerInfo);
    sendWhatsAppOrder(cart, customerInfo.name || customerInfo.phone ? customerInfo : null);
  };

  const handleCustomerInfoChange = (e) => {
    setCustomerInfo({
      ...customerInfo,
      [e.target.name]: e.target.value
    });
  };

  if (cart.length === 0) {
    return (
      <>
      <div className="cart-page">
        <div className="cart-empty">
          <span className="cart-empty-icon">🛒</span>
          <h2>Tu carrito está vacío</h2>
          <p>Explorá nuestros productos y encontrá lo que buscás</p>
          <Link to="/" className="continue-shopping">← Seguir comprando</Link>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
    <div className="cart-page">
      <h2>Tu Carrito ({getCount()} productos)</h2>

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

          {/* Formulario opcional de cliente */}
          <div className="customer-info-section">
            <button 
              className="toggle-form-btn"
              onClick={() => setShowCustomerForm(!showCustomerForm)}
            >
              {showCustomerForm ? '▼ Ocultar' : '▶'} Agregar mis datos (opcional)
            </button>
            
            {showCustomerForm && (
              <div className="customer-form">
                <input
                  type="text"
                  name="name"
                  placeholder="Tu nombre"
                  value={customerInfo.name}
                  onChange={handleCustomerInfoChange}
                  className="customer-input"
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Tu teléfono (ej. 0981 123 456)"
                  value={customerInfo.phone}
                  onChange={handleCustomerInfoChange}
                  className="customer-input"
                />
                <input
                  type="text"
                  name="address"
                  placeholder="Dirección de entrega (opcional)"
                  value={customerInfo.address}
                  onChange={handleCustomerInfoChange}
                  className="customer-input"
                />
              </div>
            )}
          </div>
          <button className="checkout-btn" onClick={handleWhatsApp}>
          🚀 Finalizar pedido por WhatsApp
          </button>
          <button className="clear-btn" onClick={clearCart}>
            Vaciar carrito
          </button>
          <Link to="/" className="continue-shopping">Seguir comprando</Link>
        </div>
      </div>
    </div>
    </>
  );
};

export default Cart;
