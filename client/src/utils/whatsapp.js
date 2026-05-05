/**
 * Utilidades de WhatsApp para GameMasters
 * Numero de la tienda: +595 983 986 775 (Paraguay)
 */

const STORE_PHONE = '595983986775';

export const sendWhatsAppOrder = (products, customerInfo) => {
  const total = products.reduce(function(sum, p) {
    return sum + (p.precio * (p.quantity || 1));
  }, 0);
  
  let message = '*NUEVO PEDIDO - GameMasters*\n\n';
  
  if (customerInfo && (customerInfo.name || customerInfo.phone)) {
    message += '*Cliente:* ' + (customerInfo.name || 'No especificado') + '\n';
    message += '*Telefono:* ' + (customerInfo.phone || 'No especificado') + '\n';
    message += '*Direccion:* ' + (customerInfo.address || 'No especificada') + '\n\n';
  }
  
  message += '*PRODUCTOS:*\n';
  message += '------------------------------\n';
  
  products.forEach(function(p, index) {
    var subtotal = p.precio * (p.quantity || 1);
    message += (index + 1) + '. *' + p.nombre + '*\n';
    message += '   Marca: ' + (p.marca || 'N/A') + '\n';
    message += '   Cantidad: ' + (p.quantity || 1) + '\n';
    message += '   Precio unit.: ' + Number(p.precio).toLocaleString("es-PY") + ' Gs.\n';
    message += '   Subtotal: ' + subtotal.toLocaleString("es-PY") + ' Gs.\n\n';
  });
  
  message += '------------------------------\n';
  message += '*TOTAL DEL PEDIDO:* ' + total.toLocaleString("es-PY") + ' Gs.\n\n';
  message += 'Pedido realizado desde la web\n';
  message += new Date().toLocaleString("es-PY");
  
  var encodedMessage = encodeURIComponent(message);
  var url = 'https://wa.me/' + STORE_PHONE + '?text=' + encodedMessage;
  window.open(url, '_blank');
};

export const sendWhatsAppProductInquiry = (product) => {
  var message = '*CONSULTA SOBRE PRODUCTO*\n\n';
  message += '*' + product.nombre + '*\n';
  message += 'Marca: ' + (product.marca || 'N/A') + '\n';
  message += 'Precio: ' + Number(product.precio).toLocaleString("es-PY") + ' Gs.\n';
  message += 'Stock: ' + (product.stock || 'Consultar') + ' unidades\n\n';
  message += 'Hola! Me interesa este producto y quisiera mas informacion.\n';
  message += 'Consulta desde la web';
  
  var encodedMessage = encodeURIComponent(message);
  var url = 'https://wa.me/' + STORE_PHONE + '?text=' + encodedMessage;
  window.open(url, '_blank');
};

export const sendWhatsAppContact = (message) => {
  var defaultMessage = message || 'Hola! \n\nVi su tienda online GameMasters y quisiera hacer una consulta.\n\nMuchas gracias!';
  
  var encodedMessage = encodeURIComponent(defaultMessage);
  var url = 'https://wa.me/' + STORE_PHONE + '?text=' + encodedMessage;
  window.open(url, '_blank');
};
