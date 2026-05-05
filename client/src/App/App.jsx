import '../pages/formularioLogin/formularioLogin';
import { Routes, Route } from "react-router-dom";
import FormularioLogin from '../pages/formularioLogin/formularioLogin';
import Home from '../pages/home/home';
import { Products } from '../pages/Products/Products';
import { useState } from 'react';
import FormProduct from '../components/formProduct/formProduct';
import FormRegistro from '../pages/formRegistro/formRegistro';
import UpdateProduct from '../components/UpdateProduct/UpdateProduct';
import { SupplierForm } from '../components/SupplierForm/SupplierForm';
import Suppliers from '../pages/Suppliers/Suppliers';
import UpdateSupplier from '../components/UpdateSupplier/UpdateSupplier';
import Checkout from '../pages/Checkout/Checkout';
import PrivateRoute from '../components/ProtectedRoute/ProtectedRoute';
import CategoryForm from "../components/Categories/CategoryForm";
import Categories from "../pages/Categories/Categories";
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
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/create-payment-intent" element={<Checkout />} />
        
        {/* Rutas protegidas para admin */}
        <Route path="/agregar/product" element={<PrivateRoute component={FormProduct} />} />
        <Route path="/actualizar/product/:id" element={<PrivateRoute component={UpdateProduct} />} />
        <Route path="/add/suppliers" element={<PrivateRoute component={SupplierForm} />} />
        <Route path="/edit/supplier/:id" element={<UpdateSupplier />} />
        <Route path="/add/category" element={<PrivateRoute component={CategoryForm} />} />
        <Route path="/categories" element={<PrivateRoute component={Categories} />} />
      </Routes>
        {/* 🔥 BOTÓN FLOTANTE (SIEMPRE VISIBLE) */}
        <a
          href="https://wa.me/595983986775"
          className="whatsapp-float"
          target="_blank"
          rel="noopener noreferrer"
          title="Contactanos por WhatsApp"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="28" height="28" fill="white">
            <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.8c122.3 0 224.1-99.6 224.1-222 0-59.3-23.1-115-61.8-157zm-157 341.1c-33.6 0-67-9.5-95.8-28.4l-6.9-4.1-69.5 18.2 18.6-67.9-4.5-7.1c-18.5-29.4-28.2-63.7-28.2-98.9 0-101.6 82.6-184.2 184.2-184.2 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.2 130.9 0 101.7-84.9 184.3-186.2 184.3zm101.4-138.2c-5.5-2.8-32.8-16.2-37.9-18.1-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.4 18.1-17.6 21.8-3.2 3.7-6.4 4.2-12 1.4-32.8-16.4-54.3-29.2-76.3-66.1-5.8-9.9 5.8-9.2 16.6-30.6 1.8-4.1 0.9-7.7-.5-10.8-1.4-3.1-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.1 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.3 4.6-12.9 4.6-24 3.2-26.3-1.3-2.3-5-3.7-10.6-6.5z"/>
          </svg>
        </a>
    </div>
    </CartProvider>
  );
};

export default App;
