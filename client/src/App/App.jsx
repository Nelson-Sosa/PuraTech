import '../pages/formularioLogin/formularioLogin';
import { Routes, Route} from "react-router-dom";
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

const App = ()=> {
  const [login, setLogin] = useState(false);
  return (
    <div>
    <Routes>
  <Route path="/" element={<Home />} />
  <Route path="/login" element={<FormularioLogin setLogin={setLogin} />} />
  <Route path="/register" element={<FormRegistro />} />
  
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
    </div>
  );
}

export default App;


