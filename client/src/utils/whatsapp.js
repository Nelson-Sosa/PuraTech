/**
 * Utilidades de WhatsApp para GameMasters
 * Número de la tienda: +595 983 986 775 (Paraguay)
 */

const STORE_PHONE = '595983986775';

export const sendWhatsAppOrder = (products, customerInfo) => {
  if (!products || products.length === 0) {
    alert("El carrito está vacío");
    return;
  }

  const total = products.reduce((sum, p) => {
    return sum + (p.precio * (p.quantity || 1));
  }, 0);

  let message = `🛒 *NUEVO PEDIDO - GameMasters*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  // Datos del cliente
  if (customerInfo) {
    message += `👤 *Cliente:* ${customerInfo.name || 'No especificado'}\n`;
    message += `📞 *Teléfono:* ${customerInfo.phone || 'No especificado'}\n`;
    message += `📍 *Dirección:* ${customerInfo.address || 'No especificada'}\n\n`;
  }

  message += `📦 *DETALLE DEL PEDIDO:*\n\n`;

  products.forEach((p, index) => {
    const subtotal = p.precio * (p.quantity || 1);

    message += `🔹 *${index + 1}. ${p.nombre}*\n`;
    message += `   🏷️ Marca: ${p.marca || 'N/A'}\n`;
    message += `   🔢 Cantidad: ${p.quantity || 1}\n`;
    message += `   💲 Precio: ${Number(p.precio).toLocaleString("es-PY")} Gs.\n`;
    message += `   🧾 Subtotal: ${subtotal.toLocaleString("es-PY")} Gs.\n\n`;
  });

  message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `💰 *TOTAL:* ${total.toLocaleString("es-PY")} Gs.\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  message += `🕒 Pedido realizado: ${new Date().toLocaleString("es-PY")}\n`;
  message += `🌐 Desde la tienda online`;

  const encodedMessage = encodeURIComponent(message);
  const url = `https://wa.me/${STORE_PHONE}?text=${encodedMessage}`;

  // 🔥 FIX anti-bloqueo
  const win = window.open(url, '_blank');
  if (!win) {
    window.location.href = url;
  }
};

/**
 * Envía consulta sobre producto
 */
export const sendWhatsAppProductInquiry = (product) => {
  var message = '*CONSULTA SOBRE PRODUCTO*\n\n' +
    '*' + product.nombre + '*\n' +
    'Marca: ' + (product.marca || 'N/A') + '\n' +
    'Precio: ' + Number(product.precio).toLocaleString("es-PY") + ' Gs.\n' +
    'Stock: ' + (product.stock || 'Consultar') + ' unidades\n\n' +
    'Hola! Me interesa este producto y quisiera más información.\n' +
    '_Consulta desde la web_';

  var encodedMessage = encodeURIComponent(message);
  var url = 'https://wa.me/' + STORE_PHONE + '?text=' + encodedMessage;
  window.open(url, '_blank');
};

/**
 * Envía mensaje general
 */
export const sendWhatsAppContact = (message) => {
  var defaultMessage = message || 'Hola! \n\n' +
    'Vi su tienda online GameMasters y quisiera hacer una consulta.\n\n' +
    'Muchas gracias!';

  var encodedMessage = encodeURIComponent(defaultMessage);
  var url = 'https://wa.me/' + STORE_PHONE + '?text=' + encodedMessage;
  window.open(url, '_blank');
};
