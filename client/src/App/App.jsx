import '../pages/formularioLogin/formularioLogin';
import { Routes, Route, Link} from "react-router-dom";
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

const App = ()=> {
  const [login, setLogin] = useState(false);

  return (
    <div>
    <Routes>
  <Route path="/" element={<Home />} />
  <Route path="/login" element={<FormularioLogin setLogin={setLogin} />} />
  <Route path="/register" element={<FormRegistro />} />
  
  {/* Ruta protegida */}
  <Route path="/category/:category" element={<PrivateRoute component={Products} />} />
  <Route path="/agregar/product" element={<PrivateRoute component={FormProduct} />} />
  <Route path="/actualizar/product/:id" element={<PrivateRoute component={UpdateProduct} />} />
  <Route path="/add/suppliers" element={<PrivateRoute component={SupplierForm} />} />
  <Route path="/suppliers" element={<Suppliers />} />
  <Route path="/edit/supplier/:id" element={<UpdateSupplier />} />
  <Route path="/create-payment-intent" element={<Checkout />} />
    </Routes>
    </div>
  );
}

export default App;


