/**
 * Utilidades de WhatsApp para GameMasters
 * Número de la tienda: +595 981 123 456 (cambiar por el real)
 */

const STORE_PHONE = '595981123456'; // Sin el +, formato internacional sin 0

/**
 * Envía un pedido completo por WhatsApp
 * @param {Array} products - Array de productos en el carrito
 * @param {Object} customerInfo - Información del cliente (opcional)
 */
export const sendWhatsAppOrder = (products, customerInfo = null) => {
  const total = products.reduce((sum, p) => sum + (p.precio * (p.quantity || 1)), 0);
  
  let message = `🛒 *NUEVO PEDIDO - GameMasters*\n\n`;
  
  // Info del cliente si se proporciona
  if (customerInfo) {
    message += `*Cliente:* ${customerInfo.name || 'No especificado'}\n`;
    message += `*Teléfono:* ${customerInfo.phone || 'No especificado'}\n`;
    message += `*Dirección:* ${customerInfo.address || 'No especificada'}\n\n`;
  }
  
  message += `*PRODUCTOS:*\n`;
  message += `${'─'.repeat(30)}\n`;
  
  products.forEach((p, index) => {
    const subtotal = p.precio * (p.quantity || 1);
    message += `${index + 1}. *${p.nombre}*\n`;
    message += `   📦 Marca: ${p.marca || 'N/A'}\n`;
    message += `   🔢 Cantidad: ${p.quantity || 1}\n`;
    message += `   💰 Precio unit.: ${Number(p.precio).toLocaleString("es-PY")} Gs.\n`;
    message += `   💵 Subtotal: ${subtotal.toLocaleString("es-PY")} Gs.\n\n`;
  });
  
  message += `${'─'.repeat(30)}\n`;
  message += `*TOTAL DEL PEDIDO:* ${total.toLocaleString("es-PY")} Gs.\n\n`;
  message += `📍 _Pedido realizado desde la web_\n`;
  message += `⏰ _${new Date().toLocaleString("es-PY")}_`;
  
  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/${STORE_PHONE}?text=${encodedMessage}`, '_blank');
};

/**
 * Envía una consulta rápida sobre un producto
 * @param {Object} product - Producto a consultar
 */
export const sendWhatsAppProductInquiry = (product) => {
  const message = `🎮 *CONSULTA SOBRE PRODUCTO*\n\n` +
    `*${product.nombre}*\n` +
    `📦 Marca: ${product.marca || 'N/A'}\n` +
    `💰 Precio: ${Number(product.precio).toLocaleString("es-PY")} Gs.\n` +
    `📦 Stock: ${product.stock || 'Consultar'} unidades\n\n` +
    `Hola! Me interesa este producto y quisiera más información.\n` +
    `📍 _Consulta desde la web_`;
  
  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/${STORE_PHONE}?text=${encodedMessage}`, '_blank');
};

/**
 * Envía un mensaje general de contacto
 * @param {string} message - Mensaje personalizado (opcional)
 */
export const sendWhatsAppContact = (message = '') => {
  const defaultMessage = message || 
    `Hola! 👋\n\n` +
    `Vi su tienda online GameMasters y quisiera hacer una consulta.\n\n` +
    `Muchas gracias!`;
  
  const encodedMessage = encodeURIComponent(defaultMessage);
  window.open(`https://wa.me/${STORE_PHONE}?text=${encodedMessage}`, '_blank');
};

const whatsappUtils = {
  sendWhatsAppOrder,
  sendWhatsAppProductInquiry,
  sendWhatsAppContact
};

export default whatsappUtils;
