import { Link } from "react-router-dom";
import { useCart } from '../../context/CartContext';
import { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';
import './Cart.css';

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
    console.log("🔵 [handleWhatsApp] Iniciando...");
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
      console.log("🔵 [handleWhatsApp] orderData preparado");

      // Guardar pedido en la base de datos
      console.log("🔵 [handleWhatsApp] Guardando pedido...");
      const orderResponse = await axios.post(`${API_URL}/api/orders`, orderData);
      const savedOrder = orderResponse.data;
      console.log("✅ [handleWhatsApp] Pedido guardado:", savedOrder._id);

      // Generar mensaje de WhatsApp
      const message = generateWhatsAppMessage(cart, customerInfo, savedOrder._id);
      console.log("📱 [handleWhatsApp] Mensaje generado:", message.substring(0, 100) + "...");
      
      // Abrir WhatsApp - intentar método 1 (wa.me)
      let whatsappUrl = `https://wa.me/595983986775?text=${encodeURIComponent(message)}`;
      console.log("🔵 [handleWhatsApp] URL WhatsApp:", whatsappUrl.substring(0, 80) + "...");
      
      // Intentar abrir ventana
      let whatsappWindow = window.open(whatsappUrl, '_blank');
      
      // Si falló, intentar método 2 (web.whatsapp.com)
      if (!whatsappWindow || whatsappWindow.closed || typeof whatsappWindow.closed === 'undefined') {
        console.log("🔵 [handleWhatsApp] Intentando método alternativo...");
        whatsappUrl = `https://web.whatsapp.com/send?phone=595983986775&text=${encodeURIComponent(message)}`;
        whatsappWindow = window.open(whatsappUrl, '_blank');
      }
      
      console.log("🔵 [handleWhatsApp] Ventana abierta:", whatsappWindow ? "SÍ" : "NO");
      
      // Si sigue sin abrir, usar método alternativo - redirección directa
      if (!whatsappWindow || whatsappWindow.closed) {
        console.warn("⚠️ [handleWhatsApp] Popup bloqueado, usando redirección directa");
        
        // Redirección directa a WhatsApp
        window.location.href = `https://wa.me/595983986775?text=${encodeURIComponent(message)}`;
        return;
      }
      
      // Limpiar carrito
      clearCart();
      console.log("✅ [handleWhatsApp] Carrito limpiado - WhatsApp message updated!");
      
    } catch (error) {
      console.error("🔴 [handleWhatsApp] Error:", error);
      alert("Error al procesar el pedido. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // Generar mensaje profesional para WhatsApp
  const generateWhatsAppMessage = (cart, customerInfo, orderId) => {
    const items = cart.map((item, index) => 
      `${index + 1}. ${item.nombre}\n   Marca: ${item.marca} | Cantidad: ${item.quantity}\n   Precio: ${Number(item.precio).toLocaleString("es-PY")} Gs.`
    ).join('\n\n');

    const total = getTotal().toLocaleString("es-PY");
    
    const customerText = customerInfo.name || customerInfo.phone 
      ? `👤 *DATOS DEL CLIENTE*\n━━━━━━━━━━━━━━━━━━━━\n📝 Nombre: ${customerInfo.name || 'No proporcionado'}\n📱 Teléfono: ${customerInfo.phone || 'No proporcionado'}\n📍 Dirección: ${customerInfo.address || 'Retiro en tienda'}\n`
      : '';

    return `🛒💻 *NUEVO PEDIDO - GameMasters*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔖 *Pedido #: ${orderId.substring(0, 8).toUpperCase()}*

📦 *PRODUCTOS:*
${items}

💵 *RESUMEN:*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Subtotal: ${total} Gs.
Envío: Incluido
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 *TOTAL A PAGAR: ${total} Gs.*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${customerText}⌛ *Fecha: ${new Date().toLocaleDateString('es-PY', { 
  day: '2-digit', 
  month: 'long', 
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}

✅ ¡Gracias por tu compra! 
🏪 *GameMasters - Tu tienda de tecnología*
📞 ¿Dudas? Escribenos aquí`;

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
