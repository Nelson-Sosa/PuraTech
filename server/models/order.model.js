const mongoose = require('mongoose');
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});
const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

async function getNextOrderNumber() {
  const counter = await Counter.findByIdAndUpdate(
    'orderNumber',
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  const year = new Date().getFullYear();
  const seq = String(counter.seq).padStart(6, '0');
  return `PT-${year}-${seq}`;
}

const OrderSchema = new mongoose.Schema({
  // Usuario (para pedidos de clientes registrados)
  userId: { type: String, index: true },
  
  // Número de pedido único
  orderNumber: { type: String, unique: true, sparse: true },
  
  // Cliente
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  customerEmail: { type: String, index: true },
  deliveryAddress: { type: String },
  
  // Dirección de envío estructurada
  shippingAddress: {
    name: String,
    phone: String,
    address: String,
    city: String,
    references: String
  },
  
  // Productos del pedido
  products: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    nombre: String,
    marca: String,
    imageUrl: String,
    quantity: { type: Number, required: true },
    precio: { type: Number, required: true },
    subtotal: { type: Number }
  }],
  
  // Totales
  subtotal: { type: Number, required: true },
  shippingCost: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
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

OrderSchema.pre('save', async function(next) {
  this.updatedAt = Date.now();
  if (!this.orderNumber) {
    this.orderNumber = await getNextOrderNumber();
  }
  next();
});

const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;
