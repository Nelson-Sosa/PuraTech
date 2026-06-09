import '../pages/formularioLogin/formularioLogin';
import { Routes, Route } from "react-router-dom";
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
import { WishlistProvider } from '../context/WishlistContext';
import Navbar from '../components/Navbar/Navbar';
import DebugAuth from '../pages/CustomNavigate/DebugAuth';

const App = () => {
  const [login, setLogin] = useState(false);
  
  return (
    <CartProvider>
    <WishlistProvider>
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<FormularioLogin setLogin={setLogin} />} />
        <Route path="/register" element={<FormRegistro />} />
        <Route path="/debug-auth" element={<DebugAuth />} />
        <Route path="/cart" element={<Cart />} />
        
        {/* Rutas públicas */}
        <Route path="/products" element={<Products />} />
        <Route path="/category/:category" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        
        {/* Rutas protegidas */}
        <Route path="/suppliers" element={<PrivateRoute component={Suppliers} />} />
        
        {/* Rutas protegidas para admin */}
        <Route path="/agregar/product" element={<PrivateRoute component={FormProduct} />} />
        <Route path="/actualizar/product/:id" element={<PrivateRoute component={UpdateProduct} />} />
        <Route path="/add/suppliers" element={<PrivateRoute component={SupplierForm} />} />
        <Route path="/edit/supplier/:id" element={<UpdateSupplier />} />
        <Route path="/add/category" element={<PrivateRoute component={CategoryForm} />} />
        <Route path="/categories" element={<PrivateRoute component={Categories} />} />
        <Route path="/orders" element={<PrivateRoute component={Orders} />} />
        <Route path="/clients" element={<PrivateRoute component={Clients} />} />
        <Route path="/inventory" element={<PrivateRoute component={Inventory} />} />
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
    </div>
    </WishlistProvider>
    </CartProvider>
  );
};

export default App;
