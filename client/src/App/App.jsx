import '../pages/formularioLogin/formularioLogin';
import { Routes, Route, useLocation } from "react-router-dom";
import FormularioLogin from '../pages/formularioLogin/formularioLogin';
import Home from '../pages/home/home';
import { Products } from '../pages/Products/Products';
import ProductDetail from '../pages/ProductDetail/ProductDetail';
import { useState } from 'react';
import FormProduct from '../components/formProduct/formProduct';
import FormRegistro from '../pages/formRegistro/formRegistro';
import UpdateProduct from '../components/UpdateProduct/UpdateProduct';
import { SupplierForm } from '../components/SupplierForm/SupplierForm';
import Suppliers from '../pages/Suppliers/Suppliers';
import UpdateSupplier from '../components/UpdateSupplier/UpdateSupplier';
import PrivateRoute from '../components/ProtectedRoute/ProtectedRoute';
import CategoryForm from "../components/Categories/CategoryForm";
import Categories from "../pages/Categories/Categories";
import Orders from '../pages/Orders/Orders';
import Clients from '../pages/Clients/Clients';
import Inventory from '../pages/Inventory/Inventory';
import Cart from '../pages/Cart/Cart';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider, useWishlist } from '../context/WishlistContext';
import { ToastProvider } from '../components/Toast/ToastContext';
import Navbar from '../components/Navbar/Navbar';
import DebugAuth from '../pages/CustomNavigate/DebugAuth';
import Wishlist from '../pages/Wishlist/Wishlist';
import MisPedidos from '../pages/MisPedidos/MisPedidos';
import MiPerfil from '../pages/MiPerfil/MiPerfil';
import Configuracion from '../pages/Configuracion/Configuracion';
import OrderConfirmation from '../pages/OrderConfirmation/OrderConfirmation';
import AuthModal from '../components/AuthModal/AuthModal';
import AdminLayout from '../components/AdminSidebar/AdminLayout';

const AdminRoute = ({ component: Component }) => (
  <PrivateRoute
    component={() => (
      <AdminLayout>
        <Component />
      </AdminLayout>
    )}
  />
);

const adminPaths = [
  "/agregar/product", "/actualizar/product", "/add/suppliers",
  "/edit/supplier", "/add/category", "/categories",
  "/orders", "/clients", "/inventory",
];

const isAdminPath = (pathname) =>
  adminPaths.some((p) => pathname.startsWith(p));

const AppContent = () => {
  const { authModalOpen, setAuthModalOpen } = useWishlist();
  const [login, setLogin] = useState(false);
  const location = useLocation();

  return (
    <div>
      {!isAdminPath(location.pathname) && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<FormularioLogin setLogin={setLogin} />} />
        <Route path="/register" element={<FormRegistro />} />
        <Route path="/debug-auth" element={<DebugAuth />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/mis-pedidos" element={<PrivateRoute component={MisPedidos} />} />
        <Route path="/mi-cuenta/perfil" element={<PrivateRoute component={MiPerfil} />} />
        <Route path="/mi-cuenta/configuracion" element={<PrivateRoute component={Configuracion} />} />
        <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmation />} />
        
        {/* Rutas públicas */}
        <Route path="/products" element={<Products />} />
        <Route path="/category/:category" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        
        {/* Rutas protegidas */}
        <Route path="/suppliers" element={<PrivateRoute component={Suppliers} />} />
        
        {/* Rutas protegidas para admin */}
        <Route path="/agregar/product" element={<AdminRoute component={FormProduct} />} />
        <Route path="/actualizar/product/:id" element={<AdminRoute component={UpdateProduct} />} />
        <Route path="/add/suppliers" element={<AdminRoute component={SupplierForm} />} />
        <Route path="/edit/supplier/:id" element={<AdminRoute component={UpdateSupplier} />} />
        <Route path="/add/category" element={<AdminRoute component={CategoryForm} />} />
        <Route path="/categories" element={<AdminRoute component={Categories} />} />
        <Route path="/orders" element={<AdminRoute component={Orders} />} />
        <Route path="/clients" element={<AdminRoute component={Clients} />} />
        <Route path="/inventory" element={<AdminRoute component={Inventory} />} />
      </Routes>
      
      {/* BOTÓN FLOTANTE DE WHATSAPP */}
      <a
        href="https://wa.me/595983986775?text=%C2%A1Hola%20PuraTech!%20Quisiera%20realizar%20una%20consulta%20sobre%20sus%20productos."
        className="whatsapp-float"
        target="_blank"
        rel="noopener noreferrer"
        title="Contactanos por WhatsApp"
      >
        <img 
          src="/img/whatsapp-symbol-logo.svg" 
          alt="WhatsApp"
        />
      </a>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};

const App = () => {
  return (
    <ToastProvider>
      <CartProvider>
        <WishlistProvider>
          <AppContent />
        </WishlistProvider>
      </CartProvider>
    </ToastProvider>
  );
};

export default App;
