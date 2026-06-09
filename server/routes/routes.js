// routes/routes.js
const CategoryController = require('../controllers/CategoryController');
const UserController = require('../controllers/user.controllers');
const ProductController = require('../controllers/product.controller');
const SuppliersController = require('../controllers/suppliers.controller');
const OrderController = require('../controllers/order.controller');
const InventoryController = require('../controllers/inventory.controller');
const WishlistController = require('../controllers/wishlistController');
const validarToken = require('../middlewares/validarToken');
const verificarRol = require('../middlewares/verificarRol');
const express = require('express');
const router = express.Router();
const upload = require('../configuration/multerConfig');

module.exports = (app) => {
    // RUTAS PÚBLICAS (sin token)
    app.get('/api/products/public/home', ProductController.getPublicHome);
    app.get('/api/products/public', ProductController.getPublicProducts);
    app.get('/api/search-products', ProductController.searchGlobal);
    
    // ===== CATEGORÍAS PÚBLICAS =====
    app.get('/api/categories', CategoryController.getCategories); // Lista plana
    app.get('/api/categories/tree', CategoryController.getCategoryTree); // Árbol jerárquico
    app.get('/api/categories/main', CategoryController.getMainCategories); // Solo principales
    app.get('/api/categories/parent/:parentId', CategoryController.getSubcategories); // Subcategorías
    app.get('/api/categories/:id', CategoryController.getCategoryById); // Por ID con hijos

    // ===== LOGIN Y USUARIOS =====
    app.post("/api/login", UserController.login);
    app.post("/api/agregar/usuario", UserController.agregarUsuario);
    app.post("/api/auth/google", UserController.googleAuth);
    app.get("/api/verify-token", validarToken, (req, res) => {
      res.json({ 
        valid: true, 
        user: req.infoUsuario 
      });
    });

    // ===== PRODUCTOS (públicos y admin) =====
    app.get('/api/product/:id', ProductController.getProduct); // Pública
    app.get('/api/productos', ProductController.todosLosProductos); // Pública
    app.get('/api/products', ProductController.categoriaProductos); // Pública

    // ===== PRODUCTOS ADMIN (con token) =====
    app.post("/api/agregar/producto", validarToken, verificarRol('admin'), upload.single('imageUrl'), ProductController.agregarProducto);
    app.put("/api/actualizar/product/:id", validarToken, verificarRol('admin'), upload.fields([{ name: 'imageUrl', maxCount: 1 }, { name: 'additionalImages', maxCount: 10 }]), ProductController.updateProduct);
    app.delete("/api/remover/product/:id", validarToken, verificarRol('admin'), ProductController.removerProducto);

    // ===== SEED TEMPORAL — eliminar después de usar =====
    app.post('/api/seed-categories', async (req, res) => {
      const Category = require('../models/Category');
      if (req.headers['x-seed-Secret'] !== 'gm-seed-2026') {
        return res.status(401).json({ error: 'No autorizado' });
      }
      const categories = [
        { name: 'Electrónica', nivel: 1, orden: 1 },
        { name: 'Computación', nivel: 1, orden: 2 },
        { name: 'Gaming', nivel: 1, orden: 3 },
        { name: 'Audio', nivel: 1, orden: 4 },
        { name: 'Periféricos', nivel: 1, orden: 5 },
        { name: 'Smartphones', nivel: 1, orden: 6 },
        { name: 'Accesorios', nivel: 1, orden: 7 },
        { name: 'Televisores', nivel: 2, orden: 1, parent: 'Electrónica' },
        { name: 'Monitores', nivel: 2, orden: 2, parent: 'Electrónica' },
        { name: 'Proyectores', nivel: 2, orden: 3, parent: 'Electrónica' },
        { name: 'Notebooks', nivel: 2, orden: 1, parent: 'Computación' },
        { name: 'PC de Escritorio', nivel: 2, orden: 2, parent: 'Computación' },
        { name: 'Componentes', nivel: 2, orden: 3, parent: 'Computación' },
        { name: 'Impresoras', nivel: 2, orden: 4, parent: 'Computación' },
        { name: 'Sillas Gamer', nivel: 2, orden: 1, parent: 'Gaming' },
        { name: 'Mesas Gamer', nivel: 2, orden: 2, parent: 'Gaming' },
        { name: 'Accesorios Gaming', nivel: 2, orden: 3, parent: 'Gaming' },
        { name: 'Juegos', nivel: 2, orden: 4, parent: 'Gaming' },
        { name: 'Consolas', nivel: 2, orden: 5, parent: 'Gaming' },
        { name: 'Auriculares', nivel: 2, orden: 1, parent: 'Audio' },
        { name: 'Parlantes', nivel: 2, orden: 2, parent: 'Audio' },
        { name: 'Micrófonos', nivel: 2, orden: 3, parent: 'Audio' },
        { name: 'Soundbars', nivel: 2, orden: 4, parent: 'Audio' },
        { name: 'Mouse', nivel: 2, orden: 1, parent: 'Periféricos' },
        { name: 'Teclados', nivel: 2, orden: 2, parent: 'Periféricos' },
        { name: 'Mousepads', nivel: 2, orden: 3, parent: 'Periféricos' },
        { name: 'Webcams', nivel: 2, orden: 4, parent: 'Periféricos' },
        { name: 'Celulares', nivel: 2, orden: 1, parent: 'Smartphones' },
        { name: 'Tablets', nivel: 2, orden: 2, parent: 'Smartphones' },
        { name: 'Smartwatches', nivel: 2, orden: 3, parent: 'Smartphones' },
        { name: 'Cargadores', nivel: 2, orden: 1, parent: 'Accesorios' },
        { name: 'Cables', nivel: 2, orden: 2, parent: 'Accesorios' },
        { name: 'Fundas y Cases', nivel: 2, orden: 3, parent: 'Accesorios' },
        { name: 'Protectores de Pantalla', nivel: 2, orden: 4, parent: 'Accesorios' },
        { name: 'Baterías Externas', nivel: 2, orden: 5, parent: 'Accesorios' },
        { name: 'Mouse Gamer', nivel: 3, orden: 1, parent: 'Mouse' },
        { name: 'Mouse Inalámbrico', nivel: 3, orden: 2, parent: 'Mouse' },
        { name: 'Mouse Ergonómico', nivel: 3, orden: 3, parent: 'Mouse' },
        { name: 'Teclado Mecánico', nivel: 3, orden: 1, parent: 'Teclados' },
        { name: 'Teclado Membrana', nivel: 3, orden: 2, parent: 'Teclados' },
        { name: 'Teclado Inalámbrico', nivel: 3, orden: 3, parent: 'Teclados' },
        { name: 'Procesadores', nivel: 3, orden: 1, parent: 'Componentes' },
        { name: 'Tarjetas Gráficas', nivel: 3, orden: 2, parent: 'Componentes' },
        { name: 'Memorias RAM', nivel: 3, orden: 3, parent: 'Componentes' },
        { name: 'Discos Duros', nivel: 3, orden: 4, parent: 'Componentes' },
        { name: 'Gabinetes', nivel: 3, orden: 5, parent: 'Componentes' },
        { name: 'PlayStation', nivel: 3, orden: 1, parent: 'Consolas' },
        { name: 'Xbox', nivel: 3, orden: 2, parent: 'Consolas' },
        { name: 'Nintendo', nivel: 3, orden: 3, parent: 'Consolas' },
      ];
      try {
        await Category.deleteMany({});
        const inserted = {};
        for (const cat of categories) {
          const { parent, ...rest } = cat;
          const doc = new Category(rest);
          const saved = await doc.save();
          inserted[cat.name] = saved._id;
        }
        for (const cat of categories) {
          if (cat.parent && inserted[cat.parent]) {
            await Category.findByIdAndUpdate(inserted[cat.name], { parentId: inserted[cat.parent] });
          }
        }
        res.json({ success: true, count: categories.length });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // ===== CATEGORÍAS ADMIN (con token) =====
    app.post('/api/categories', validarToken, verificarRol('admin'), CategoryController.addCategory);
    app.put('/api/categories/:id', validarToken, verificarRol('admin'), CategoryController.updateCategory);
    app.delete('/api/categories/:id', validarToken, verificarRol('admin'), CategoryController.deleteCategory);
    app.delete('/api/categories/:id/reassign', validarToken, verificarRol('admin'), CategoryController.deleteCategoryAndReassign);
    
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

    // ===== WISHLIST / FAVORITOS (requiere autenticación) =====
    app.post('/api/wishlist', validarToken, WishlistController.addToWishlist);
    app.get('/api/wishlist', validarToken, WishlistController.getWishlist);
    app.delete('/api/wishlist/:productId', validarToken, WishlistController.removeFromWishlist);
    app.get('/api/wishlist/check/:productId', validarToken, WishlistController.checkWishlist);
};

// Updated: 05/05/2026 21:10:26
