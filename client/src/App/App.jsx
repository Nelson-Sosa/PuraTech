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
import Cart from '../pages/Cart/Cart';
import { CartProvider } from '../context/CartContext';
import Navbar from '../components/Navbar/Navbar';

const App = () => {
  const [login, setLogin] = useState(false);
  
  return (
    <CartProvider>
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<FormularioLogin setLogin={setLogin} />} />
        <Route path="/register" element={<FormRegistro />} />
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
      </Routes>
      
      {/* BOTÓN FLOTANTE DE WHATSAPP */}
      <a
        href="https://wa.me/595983986775"
        className="whatsapp-float"
        target="_blank"
        rel="noopener noreferrer"
        title="Contactanos por WhatsApp"
      >
        <img 
          src="/img/whatsapp-symbol-logo.svg" 
          alt="WhatsApp"
          style={{ width: '28px', height: '28px', filter: 'brightness(0) invert(1)' }}
        />
      </a>
    </div>
    </CartProvider>
  );
};

export default App;
