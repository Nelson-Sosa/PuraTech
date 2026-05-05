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

// Componente de botón flotante de WhatsApp
const WhatsAppFloat = () => {
  const handleClick = () => {
    window.open('https://wa.me/595981123456', '_blank');
  };

  return (
    <button 
      className="whatsapp-float" 
      onClick={handleClick} 
      title="Contactanos por WhatsApp"
      aria-label="Contactanos por WhatsApp"
      type="button"
      style={{
        position: 'fixed',
        bottom: '28px',
        right: '28px',
        width: '58px',
        height: '58px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #25d366, #128c7e)',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 6px 20px rgba(37,211,102,0.45)',
        zIndex: 9999,
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.12)';
        e.currentTarget.style.boxShadow = '0 8px 30px rgba(37,211,102,0.6)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(37,211,102,0.45)';
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="white">
        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.32l-.708 2.572 2.686-.708c.88.47 1.804.72 2.771.727 3.179 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.766-5.771zm3.063 7.955c-.182-.09-.99-.487-1.143-.543-.154-.056-.266-.084-.378.084-.111.168-.434.543-.532.655-.098.112-.196.125-.378.042-.182-.084-.77-.283-1.466-.902-.542-.482-.908-1.078-1.014-1.26-.105-.182-.011-.28.079-.37.081-.081.182-.212.273-.318.091-.106.121-.182.182-.303.06-.121.03-.227-.015-.318-.045-.09-.378-.909-.518-1.244-.136-.326-.275-.282-.378-.287-.096-.005-.207-.006-.318-.006-.111 0-.303.042-.462.227-.159.184-.607.593-.607 1.447s.621 1.68.708 1.792c.087.112 1.227 1.874 2.978 2.627.416.18.74.287 1.049.367.308.107.588.09.809-.055.225-.146.99-.404 1.131-.644.143-.24.143-.445.1-.644-.043-.2-.182-.318-.273-.318z"/>
      </svg>
    </button>
  );
};

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
      <WhatsAppFloat />
    </div>
    </CartProvider>
  );
};

export default App;
