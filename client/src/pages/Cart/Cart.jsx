import { Link } from "react-router-dom";
import { useCart } from '../../context/CartContext';
import { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';
import './Cart.css';
import { sendWhatsAppOrder } from '../../utils/whatsapp';

const Cart = () => {
  const { cart, removeFromCart, clearCart, getTotal, getCount } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: ''
  });

  const handleWhatsApp = async () => {
    setLoading(true);
    try {
      // Preparar datos del pedido
      const orderData = {
        customerName: customerInfo.name || 'Cliente',
        customerPhone: customerInfo.phone || 'No especificado',
        customerEmail: '',
        deliveryAddress: customerInfo.address || '',
        products: cart.map(item => ({
          productId: item._id,
          nombre: item.nombre,
          marca: item.marca,
          imageUrl: item.imageUrl,
          quantity: item.quantity,
          precio: item.precio
        })),
        subtotal: getTotal(),
        shippingCost: 0,
        total: getTotal(),
        notes: ''
      };

      // Guardar pedido en la base de datos
      const orderResponse = await axios.post(`${API_URL}/api/orders`, orderData);
      const savedOrder = orderResponse.data;
      console.log("✅ Pedido guardado:", savedOrder._id);

      // Generar mensaje de WhatsApp
      const message = generateWhatsAppMessage(cart, customerInfo, savedOrder._id);
      
      // Abrir WhatsApp
      const whatsappUrl = `https://wa.me/595983986775?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      
      // Limpiar carrito
      clearCart();
      alert("¡Pedido guardado! Serás redirigido a WhatsApp para confirmar.");
      
    } catch (error) {
      console.error("Error al guardar pedido:", error);
      // Si falla, aún así intentar enviar por WhatsApp
      sendWhatsAppOrder(cart, customerInfo.name || customerInfo.phone ? customerInfo : null);
    } finally {
      setLoading(false);
    }
  };

  const generateWhatsAppMessage = (cart, customerInfo, orderId) => {
    const items = cart.map(item => 
      `• ${item.nombre} (${item.marca}) x${item.quantity} - ${Number(item.precio).toLocaleString("es-PY")} Gs.`
    ).join('\n');

    const total = getTotal().toLocaleString("es-PY");
    
    const customerText = customerInfo.name || customerInfo.phone 
      ? `\n📋 *Datos del cliente:*\n👤 Nombre: ${customerInfo.name || 'No especificado'}\n📱 Teléfono: ${customerInfo.phone || 'No especificado'}\n📍 Dirección: ${customerInfo.address || 'No especificada'}`
      : '';

    return `🛒 *NUEVO PEDIDO #${orderId}*

*Productos:*
${items}

*Total: ${total} Gs.*
${customerText}

⏰ Pedido realizado desde la tienda online GameMasters`;
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
          <button className="checkout-btn" onClick={handleWhatsApp} disabled={loading}>
          {loading ? '⏳ Guardando pedido...' : '🚀 Finalizar pedido por WhatsApp'}
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
