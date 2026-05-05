// routes/routes.js
const CategoryController = require('../controllers/CategoryController');
const UserController = require('../controllers/user.controllers');
const ProductController = require('../controllers/product.controller');
const SuppliersController = require('../controllers/suppliers.controller');
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
    app.put("/api/actualizar/product/:id", validarToken, verificarRol('admin'), ProductController.updateProduct);
    app.delete("/api/remover/product/:id", validarToken, verificarRol('admin'), ProductController.removerProducto);
    app.delete('/api/categories/:id', validarToken, verificarRol('admin'), CategoryController.deleteCategory);
    app.post('/api/categories', validarToken, verificarRol('admin'), CategoryController.addCategory);
    
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

    // ===== PAGOS =====
    app.post('/api/create-payment-intent', ProductController.createPaymentIntent);
    
    // ===== META DE VENTAS =====
    // TEMPORALMENTE COMENTADO - Función checkSalesMeta no existe aún
    // app.get('/api/sales-meta', ProductController.checkSalesMeta);
};
