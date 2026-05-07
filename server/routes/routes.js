// routes/routes.js
const CategoryController = require('../controllers/CategoryController');
const UserController = require('../controllers/user.controllers');
const ProductController = require('../controllers/product.controller');
const SuppliersController = require('../controllers/suppliers.controller');
const OrderController = require('../controllers/order.controller');
const InventoryController = require('../controllers/inventory.controller');
const validarToken = require('../middlewares/validarToken');
const verificarRol = require('../middlewares/verificarRol');
const express = require('express');
const router = express.Router();
const upload = require('../configuration/multerConfig');

module.exports = (app) => {
    // RUTAS PÚBLICAS (sin token)
    app.get('/api/products/public/home', ProductController.getPublicHome);
    app.get('/api/products/public', ProductController.getPublicProducts);
    app.get('/api/search-products', ProductController.searchGlobal); // Ya no requiere token
    app.get('/api/categories', CategoryController.getCategories); // Pública

    // ===== LOGIN Y USUARIOS =====
    app.post("/api/login", UserController.login);
    app.post("/api/agregar/usuario", UserController.agregarUsuario);

    // ===== RUTAS ADMIN (con token) =====
    app.post("/api/agregar/producto", validarToken, verificarRol('admin'), upload.single('imageUrl'), ProductController.agregarProducto);
    app.put("/api/actualizar/product/:id", validarToken, verificarRol('admin'), upload.fields([{ name: 'imageUrl', maxCount: 1 }, { name: 'additionalImages', maxCount: 10 }]), ProductController.updateProduct);
    app.delete("/api/remover/product/:id", validarToken, verificarRol('admin'), ProductController.removerProducto);
    app.delete('/api/categories/:id', validarToken, verificarRol('admin'), CategoryController.deleteCategory);
    app.post('/api/categories', validarToken, verificarRol('admin'), CategoryController.addCategory);
    app.put('/api/categories/:id', validarToken, verificarRol('admin'), CategoryController.updateCategory);
    
    // Rutas solo accesibles para admin
    app.get("/api/usuarios", validarToken, verificarRol('admin'), UserController.todosLosUsuarios);
    app.delete("/api/remover/usuario", validarToken, verificarRol('admin'), UserController.removerUsuario);

    // ===== PRODUCTOS (públicos y admin) =====
    app.get('/api/product/:id', ProductController.getProduct); // Pública
    app.get('/api/productos', ProductController.todosLosProductos); // Pública
    app.get('/api/products', ProductController.categoriaProductos); // Pública

    // ===== PROVEEDORES (solo admin) =====
    app.post('/api/add/suppliers', validarToken, verificarRol('admin'), SuppliersController.addSuppliers);
    app.put('/api/edit/supplier/:id', validarToken, verificarRol('admin'), SuppliersController.editSupplier);
    app.delete('/api/delete/supplier/:id', validarToken, verificarRol('admin'), SuppliersController.deleteSuppliers);
    app.get('/api/suppliers', validarToken, verificarRol('admin'), SuppliersController.allSuppliers);
    app.get("/api/supplier/:id", validarToken, verificarRol('admin'), SuppliersController.getSupplier);

    // ===== PEDIDOS =====
    // Crear pedido (público - desde el checkout)
    app.post('/api/orders', OrderController.createOrder);
    
    // Reducir stock al crear pedido (público)
    app.post('/api/orders/reduce-stock', OrderController.reduceStock);
    
    // Obtener todos los pedidos (admin)
    app.get('/api/orders', validarToken, verificarRol('admin'), OrderController.getAllOrders);
    
    // Obtener pedido por ID (admin)
    app.get('/api/orders/:id', validarToken, verificarRol('admin'), OrderController.getOrderById);
    
    // Actualizar estado del pedido (admin)
    app.put('/api/orders/:id/status', validarToken, verificarRol('admin'), OrderController.updateOrderStatus);
    
    // Eliminar pedido (admin)
    app.delete('/api/orders/:id', validarToken, verificarRol('admin'), OrderController.deleteOrder);
    
    // Obtener pedidos por estado (admin)
    app.get('/api/orders/status/:status', validarToken, verificarRol('admin'), OrderController.getOrdersByStatus);

    // ===== INVENTARIO (solo admin) =====
    app.get('/api/inventory', validarToken, verificarRol('admin'), InventoryController.getInventory);
    app.put('/api/inventory/:id', validarToken, verificarRol('admin'), InventoryController.updateStock);
    app.get('/api/inventory/low-stock', validarToken, verificarRol('admin'), InventoryController.getLowStockProducts);
    app.post('/api/inventory/bulk-adjust', validarToken, verificarRol('admin'), InventoryController.bulkStockAdjustment);
};

// Updated: 05/05/2026 21:10:26
