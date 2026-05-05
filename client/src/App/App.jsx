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
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28">
            <path fill="white" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.198.297-.767.966-.969 1.164-.177.199-.256.392-.273.592-.052.199-.052.392-.252.588-.252.792-.052.199-.447.69-.87.715-.442.152-.296.177-.582.177-.823 0-.346-.024-.67-.103-.993-.133-.37-.039-.617-.148-.89-.313-.297-.176-.473-.215-.697-.215-.223 0-.455.024-.67.103-.215.078-.447.177-.855.27-.433.129-.715.199-.994.073-.279.124-.529.199-.813.075-.285.049-.529-.024-.715-.074-.186-.215-.443-.364-.689-.513-.245-.07-.455-.103-.685-.103-.223 0-.455.024-.67.103-.215.078-.447.177-.855.27-.433.129-.715.199-.994.073-.279.124-.529.199-.813.075-.285.049-.529-.024-.715C6.255 4.902 3.6 3.338.84 3.6c-1.746.263-3.221 1.535-3.419 3.323-.148 1.488-.615 5.314-3.213 6.803-.616.447-1.124.67-1.785.67-.446 0-.893-.148-1.339-.278-.223-.093-.446-.223-.67-.148-.223.049-.446.223-.67.37-.223.67-.149 1.044-.744 1.339-1.181.295-.437.446-.744.67-1.181.223-.223.295-.024.446.223.223.37.024.67-.148.893-.37 1.181-.67 1.487-1.181 1.712-1.786 2.24-2.905.967-1.119.37-2.348.223-3.567-.148-1.219-.371-2.348-1.045-3.567-1.786-1.219-.744-2.348-1.786-3.567-3.044-1.219-1.044-2.348-1.786-3.567-2.905-1.219-.744-2.348-1.786-3.567-3.044-1.219-.89-2.348-1.337-3.567-1.786z"/>
          </svg>
        </a>
    </div>
    </CartProvider>
  );
};

export default App;
