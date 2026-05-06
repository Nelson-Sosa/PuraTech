const Order = require('../models/order.model');

// Crear nuevo pedido
module.exports.createOrder = async (req, res) => {
  try {
    const { 
      customerName, 
      customerPhone, 
      customerEmail, 
      deliveryAddress,
      products,
      subtotal,
      shippingCost,
      total,
      notes,
      whatsappMessage
    } = req.body;

    const newOrder = new Order({
      customerName,
      customerPhone,
      customerEmail,
      deliveryAddress,
      products,
      subtotal,
      shippingCost,
      total,
      notes,
      whatsappMessage,
      paymentMethod: 'whatsapp',
      status: 'pending'
    });

    const savedOrder = await newOrder.save();
    
    console.log("✅ [createOrder] Pedido creado:", savedOrder._id);
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error("🔴 [createOrder] Error:", error);
    res.status(500).json({ error: 'Error al crear el pedido' });
  }
};

// Obtener todos los pedidos (Admin)
module.exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
};

// Obtener un pedido por ID
module.exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el pedido' });
  }
};

// Actualizar estado del pedido
module.exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    console.log("🔍 [updateOrderStatus] Estado anterior:", order.status);
    console.log("🔍 [updateOrderStatus] Nuevo estado:", status);
    console.log("🔍 [updateOrderStatus] Productos:", JSON.stringify(order.products));

    const previousStatus = order.status;
    const Product = require('../models/product.models');

    // Si el pedido cambia a "confirmed" o "preparing", reducir stock
    if ((status === 'confirmed' || status === 'preparing') && previousStatus === 'pending') {
      console.log("📦 [updateOrderStatus] Reduciendo stock por confirmación...");
      
      for (const item of order.products) {
        console.log("🔍 [updateOrderStatus] Procesando item:", item);
        
        // Intentar con el ID como string o como ObjectId
        const productId = item.productId;
        
        if (productId) {
          const product = await Product.findById(productId);
          console.log("🔍 [updateOrderStatus] Producto encontrado:", product ? product.nombre : "NO ENCONTRADO");
          
          if (product) {
            const newStock = Math.max(0, product.stock - item.quantity);
            await Product.findByIdAndUpdate(productId, { stock: newStock });
            console.log(`✅ Stock reducido: ${product.nombre} (${product.stock} -> ${newStock})`);
          } else {
            console.log("⚠️ Producto no encontrado con ID:", productId);
          }
        } else {
          console.log("⚠️ Item sin productId:", item);
        }
      }
    } else {
      console.log("⚠️ [updateOrderStatus] No se reduce stock - previousStatus:", previousStatus, "status:", status);
    }

    // Si el pedido se cancela, NO se restaura el stock (política de la tienda)
    // Si necesitas restaurar, puedes agregar lógica aquí
    
    // Actualizar estado
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true }
    );

    console.log("✅ [updateOrderStatus] Pedido actualizado:", updatedOrder._id, "Nuevo estado:", status);
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el pedido' });
  }
};

// Eliminar pedido
module.exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    res.json({ message: 'Pedido eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el pedido' });
  }
};

// Reducir stock al crear pedido
module.exports.reduceStock = async (req, res) => {
  try {
    const Product = require('../models/product.models');
    const { items } = req.body;
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Items inválidos' });
    }

    const results = [];
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (product) {
        const newStock = Math.max(0, product.stock - item.quantity);
        await Product.findByIdAndUpdate(item.productId, { stock: newStock });
        results.push({ productId: item.productId, oldStock: product.stock, newStock });
        console.log(`✅ Stock reducido: ${product.nombre} (${product.stock} -> ${newStock})`);
      }
    }

    res.json({ message: 'Stock reducido correctamente', results });
  } catch (error) {
    console.error("🔴 Error reduciendo stock:", error);
    res.status(500).json({ error: 'Error al reducir stock' });
  }
};

// Obtener pedidos por estado
module.exports.getOrdersByStatus = async (req, res) => {
  try {
    const { status } = req.query;
    const orders = await Order.find({ status }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener pedidos por estado' });
  }
};