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
    app.get('/api/search-products', validarToken, ProductController.searchGlobal);

    // ===== CATEGORÍAS =====
// Solo admin puede agregar o eliminar categorías
app.get('/api/categories', validarToken, CategoryController.getCategories);
app.post('/api/categories', validarToken, verificarRol('admin'), CategoryController.addCategory);
app.delete('/api/categories/:id', validarToken, verificarRol('admin'), CategoryController.deleteCategory);

    // ===== LOGIN Y USUARIOS =====
    app.post("/api/login", UserController.login);
    app.post("/api/agregar/usuario", UserController.agregarUsuario);

    // Rutas solo accesibles para admin
    app.get("/api/usuarios", validarToken, verificarRol('admin'), UserController.todosLosUsuarios);
    app.delete("/api/remover/usuario", validarToken, verificarRol('admin'), UserController.removerUsuario);

    // ===== PRODUCTOS =====
    app.post("/api/agregar/producto", validarToken, verificarRol('admin'), upload.single('imageUrl'), ProductController.agregarProducto);
    app.put("/api/actualizar/product/:id", validarToken, verificarRol('admin'), ProductController.updateProduct);
    app.delete("/api/remover/product/:id", validarToken, verificarRol('admin'), ProductController.removerProducto);
    
    
    // Rutas públicas o para cualquier usuario logueado
    app.get('/api/product/:id', validarToken, ProductController.getProduct);
    app.get('/api/productos', validarToken, ProductController.todosLosProductos);
    app.get('/api/products', validarToken, ProductController.categoriaProductos);

    // ===== PROVEEDORES =====
    app.post('/api/add/suppliers', validarToken, verificarRol('admin'), SuppliersController.addSuppliers);
    app.put('/api/edit/supplier/:id', validarToken, verificarRol('admin'), SuppliersController.editSupplier);
    app.delete('/api/delete/supplier/:id', validarToken, verificarRol('admin'), SuppliersController.deleteSuppliers);
    app.get('/api/suppliers', validarToken, verificarRol('admin'), SuppliersController.allSuppliers);
    app.get("/api/supplier/:id", validarToken, verificarRol('admin'), SuppliersController.getSupplier);

    // ===== PAGOS =====
    app.post('/api/create-payment-intent', ProductController.agregarPago);
};
