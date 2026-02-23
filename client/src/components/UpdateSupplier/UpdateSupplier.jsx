import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import '../UpdateSupplier/UpdateSupplier.css';

const UpdateSupplier = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [ruc, setRuc] = useState("");
  const [correo, setCorreo] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [codigoPostal, setCodigoPostal] = useState("");

  // ⚡ Carga el proveedor al montar el componente
  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/supplier/${id}`, {
          headers: { token_usuario: localStorage.getItem("token") }
        });
        const s = res.data;
        setNombre(s.nombre);
        setApellido(s.apellido);
        setRuc(s.ruc);
        setCorreo(s.correo);
        setCiudad(s.ciudad);
        setCodigoPostal(s.codigoPostal);
      } catch (err) {
        console.error("Error al cargar proveedor", err);
        if (err.response && err.response.status === 401) navigate('/login');
      }
    };

    fetchSupplier();
  }, [id, navigate]);

  // ⚡ Actualiza proveedor
  const handleUpdateSupplier = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:8000/api/edit/supplier/${id}`,
        { nombre, apellido, ruc, correo, ciudad, codigoPostal },
        { headers: { token_usuario: localStorage.getItem("token") } }
      );

      // 🔥 Redirige y pasa mensaje de éxito
      navigate("/suppliers", { state: { success: "Proveedor actualizado correctamente" } });
    } catch (err) {
      console.error("Error al actualizar proveedor", err);
      if (err.response && err.response.status === 401) navigate('/login');
      else alert(err.response?.data?.mensaje || "Error al actualizar proveedor");
    }
  };

  return (
    <div className="contenedor">
      <h2 className="titulo-rgb">Actualizar Proveedor</h2>

      <form onSubmit={handleUpdateSupplier}>
        <div className="form-group">
          <label>Nombre</label>
          <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Apellido</label>
          <input type="text" value={apellido} onChange={e => setApellido(e.target.value)} />
        </div>

        <div className="form-group">
          <label>RUC</label>
          <input type="text" value={ruc} onChange={e => setRuc(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Correo</label>
          <input type="text" value={correo} onChange={e => setCorreo(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Ciudad</label>
          <input type="text" value={ciudad} onChange={e => setCiudad(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Código Postal</label>
          <input type="number" value={codigoPostal} onChange={e => setCodigoPostal(e.target.value)} />
        </div>

        <button type="submit" className="btn-rgb">Actualizar</button>
      </form>
    </div>
  );
};

export default UpdateSupplier;