import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import '../Suppliers/Suppliers.css';
import Modal from "../../components/Modal/Modal";
import { API_URL} from '../../config';
const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [currentSupplierID, setCurrentSupplierID] = useState(null);

  // 🔥 Elimina proveedor y actualiza el state automáticamente
  const deleteSupplier = async (supplierID) => {
    try {
      await axios.delete(`${API_URL}/api/delete/supplier/${supplierID}`, {
        headers: { token_usuario: localStorage.getItem("token") }
      });
      // ⚡ Elimina del state para refrescar la lista automáticamente
      setSuppliers(suppliers.filter(s => s._id !== supplierID));
    } catch (error) {
      console.error("Error al eliminar proveedor", error);
      if (error.response && error.response.status === 401) navigate('/login');
    }
  };

  const handleDeleteClick = (supplierID) => {
    setCurrentSupplierID(supplierID);
    setShowModal(true);
  };

  const handleConfirmDelete = () => {
    deleteSupplier(currentSupplierID);
    setShowModal(false);
  };

  // 🔥 Trae los proveedores al montar
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/api/suppliers`, 
          token ? { headers: { token_usuario: token } } : {}
        );
        if (res.status === 200) setSuppliers(res.data);
      } catch (err) {
        console.error("Ocurrió un error:", err.message);
        if (err.response && err.response.status === 401) navigate('/login');
      }
    };
    fetchSuppliers();
  }, [navigate]);

  return (
    <div className="cont-supplier">
      <Link to="/add/suppliers" className="btn-proveedor">Agregar Proveedor</Link>
      <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>RUC</th>
            <th>Teléfono</th>
            <th>Correo</th>
            <th>Ciudad</th>
            <th>Código Postal</th>
            <th>Acciones</th>
          </tr>
        </thead>
      <tbody>
        {suppliers.map((sup, idx) => (
          <tr key={idx}>
            <td data-label="Nombre">{sup.nombre}</td>
            <td data-label="Apellido">{sup.apellido}</td>
            <td data-label="RUC">{sup.ruc}</td>
            <td data-label="Teléfono">{sup.telefono}</td>
            <td data-label="Correo">{sup.correo}</td>
            <td data-label="Ciudad">{sup.ciudad}</td>
            <td data-label="Código Postal">{sup.codigoPostal}</td>
           <td data-label="Acciones">
                  <div className="actions">
                    <button className="btn-delete" onClick={() => handleDeleteClick(sup._id)}>Eliminar</button>
    
                    <Link to={`/edit/supplier/${sup._id}`} className="btn-edit">
                              Editar
                    </Link>
                  </div>
                  </td>
          </tr>
        ))}
      </tbody>
      </table>
</div>
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirmDelete}
      >
        <p>¿Estas seguro de que quieres eliminar este proveedor?</p>
      </Modal>
    </div>
  );
};

export default Suppliers;
