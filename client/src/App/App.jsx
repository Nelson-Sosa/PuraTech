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
      
      {/* BOTÓN FLOTANTE DE WHATSAPP */}
      <a
        href="https://wa.me/595983986775"
        className="whatsapp-float"
        target="_blank"
        rel="noopener noreferrer"
        title="Contactanos por WhatsApp"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28">
          <path fill="white" d="M17.472 14.382c-1.947 0-3.623-.421-5.022-1.272l-5.565 1.737 1.737-5.565c-.851-1.399-1.272-3.075-1.272-5.022 0-5.514 4.486-10 10-10s10 4.486 10 10c0 1.947-.421 3.623-1.272 5.022z" />
        </svg>
      </a>
    </div>
    </CartProvider>
  );
};

export default App;
