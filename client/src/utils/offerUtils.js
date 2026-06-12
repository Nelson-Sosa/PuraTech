/**
 * Verifica si un producto tiene una oferta activa.
 * Requiere que isOffer sea true Y que la fecha de fin no haya expirado.
 *
 * @param {Object} product - El objeto producto
 * @returns {boolean} - true si la oferta está activa
 */
export const isOfferActive = (product) => {
  if (!product) return false;
  if (!product.isOffer) return false;

  // Si hay fecha de fin de oferta, verificar que no haya expirado
  if (product.fechaFinOferta) {
    const now = new Date();
    const endDate = new Date(product.fechaFinOferta);
    if (endDate < now) return false; // Oferta expirada
  }

  // Si hay fecha de inicio, verificar que ya haya comenzado
  if (product.fechaInicioOferta) {
    const now = new Date();
    const startDate = new Date(product.fechaInicioOferta);
    if (startDate > now) return false; // Oferta aún no comenzó
  }

  return true;
};
