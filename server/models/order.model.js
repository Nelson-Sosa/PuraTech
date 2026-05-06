const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  // Cliente
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  customerEmail: { type: String },
  deliveryAddress: { type: String },
  
  // Productos del pedido
  products: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    nombre: String,
    marca: String,
    imageUrl: String,
    quantity: { type: Number, required: true },
    precio: { type: Number, required: true }
  }],
  
  // Totales
  subtotal: { type: Number, required: true },
  shippingCost: { type: Number, default: 0 },
  total: { type: Number, required: true },
  
  // Estado del pedido
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  
  // Flag para controlar si el stock ya fue reducido
  stockReduced: {
    type: Boolean,
    default: false
  },
  
  // Información adicional
  notes: { type: String },
  paymentMethod: { type: String, default: 'whatsapp' },
  
  // WhatsApp
  whatsappMessage: { type: String },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Actualizar timestamp automáticamente
OrderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;
