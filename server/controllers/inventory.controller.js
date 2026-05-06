const Product = require('../models/product.models');

// Obtener todos los productos con información de stock
module.exports.getInventory = async (req, res) => {
  try {
    const products = await Product.find().sort({ stock: 1 });
    
    const inventory = products.map(p => ({
      _id: p._id,
      nombre: p.nombre,
      marca: p.marca,
      category: p.category,
      stock: p.stock,
      lowStockThreshold: p.lowStockThreshold,
      isLowStock: p.stock <= p.lowStockThreshold,
      isOutOfStock: p.stock <= 0,
      precio: p.precio,
      imageUrl: p.imageUrl
    }));

    // Estadísticas
    const stats = {
      totalProducts: products.length,
      totalStock: products.reduce((sum, p) => sum + p.stock, 0),
      lowStock: products.filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold).length,
      outOfStock: products.filter(p => p.stock <= 0).length,
      inStock: products.filter(p => p.stock > p.lowStockThreshold).length
    };

    res.json({ inventory, stats });
  } catch (error) {
    console.error("Error getting inventory:", error);
    res.status(500).json({ error: 'Error al obtener inventario' });
  }
};

// Actualizar stock de un producto
module.exports.updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock, lowStockThreshold } = req.body;

    const updates = {};
    if (stock !== undefined) updates.stock = stock;
    if (lowStockThreshold !== undefined) updates.lowStockThreshold = lowStockThreshold;

    const product = await Product.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    console.log(`✅ Stock actualizado: ${product.nombre} - Stock: ${product.stock}`);
    res.json(product);
  } catch (error) {
    console.error("Error updating stock:", error);
    res.status(500).json({ error: 'Error al actualizar stock' });
  }
};

// Reducir stock automáticamente al hacer pedido
module.exports.reduceStock = async (items) => {
  try {
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (product) {
        const newStock = Math.max(0, product.stock - item.quantity);
        await Product.findByIdAndUpdate(item.productId, { stock: newStock });
        console.log(`✅ Stock reducido: ${product.nombre} - Nuevo stock: ${newStock}`);
      }
    }
    return true;
  } catch (error) {
    console.error("Error reducing stock:", error);
    return false;
  }
};

// Obtener productos con stock bajo
module.exports.getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find({
      $expr: { $lte: ['$stock', '$lowStockThreshold'] }
    }).sort({ stock: 1 });

    res.json(products);
  } catch (error) {
    console.error("Error getting low stock products:", error);
    res.status(500).json({ error: 'Error al obtener productos con stock bajo' });
  }
};

// Ajuste masivo de stock
module.exports.bulkStockAdjustment = async (req, res) => {
  try {
    const { adjustments } = req.body; // Array de { productId, newStock }

    const results = [];
    for (const adj of adjustments) {
      const product = await Product.findByIdAndUpdate(
        adj.productId,
        { stock: adj.newStock },
        { new: true }
      );
      if (product) {
        results.push({ productId: adj.productId, success: true, stock: product.stock });
      } else {
        results.push({ productId: adj.productId, success: false });
      }
    }

    res.json({ message: "Ajuste de stock completado", results });
  } catch (error) {
    console.error("Error en ajuste masivo:", error);
    res.status(500).json({ error: 'Error en ajuste masivo de stock' });
  }
};