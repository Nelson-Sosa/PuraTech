import { useState} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import '../SupplierForm/SupplierForm.css';

export const SupplierForm = ()=>{
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [ruc, setRuc  ] = useState('');
    const [telefono, setTelefono] = useState('');
    const [correo, setCorreo] = useState('');
    const [ciudad, setCiudad] = useState('');
    const [codigoPostal, setCodigoPostal] = useState('');
    const navegar = useNavigate();

    
        const fetchSupplier = async (e)=>{
            e.preventDefault();
            await axios.post('http://localhost:8000/api/add/suppliers', {
                nombre,
                apellido,
                ruc,
                telefono,
                correo,
                ciudad,
                codigoPostal
            }, {
                headers: {
                    token_usuario: localStorage.getItem("token")
                }
            })
            

            .then(res=>{
                if(res.status ===200){
                    setNombre("");
                    setApellido("");
                    setRuc("");
                    setTelefono("");
                    setCorreo("");
                    setCiudad("");
                    setCodigoPostal("");

                    // 🔥 Redirige y pasa mensaje de éxito
                  navegar("/suppliers", {
                    state: { success: "Proveedor agregado correctamente" },
                    });
                }
            })
            
            .catch(err =>{
                console.error("Error al cargar proveedor");
                if(err.response && err.response.status === 401){
                    navegar('/login');
                }
            })
            }
        return(
            <div className="contenedor">

  <Link to="/suppliers" className="btn-rgb" style={{ marginBottom: "20px", textDecoration: "none", textAlign: "center" }}>
    Lista de Proveedores
  </Link>

  <h2 className="titulo-rgb">Agregar Proveedor</h2>

  <form onSubmit={fetchSupplier}>

    <div className="form-group">
      <label>Nombre:</label>
      <input
        type="text"
        name="nombre"
        onChange={(e) => setNombre(e.target.value)}
        value={nombre}
        required
      />
    </div>

    <div className="form-group">
      <label>Apellido:</label>
      <input
        type="text"
        name="apellido"
        onChange={(e) => setApellido(e.target.value)}
        value={apellido}
        required
      />
    </div>

    <div className="form-group">
      <label>RUC:</label>
      <input
        type="text"
        name="ruc"
        onChange={(e) => setRuc(e.target.value)}
        value={ruc}
        required
      />
    </div>

    <div className="form-group">
      <label>Teléfono:</label>
      <input
        type="number"
        name="telefono"
        onChange={(e) => setTelefono(e.target.value)}
        value={telefono}
        required
      />
    </div>

    <div className="form-group">
      <label>Correo:</label>
      <input
        type="email"
        name="correo"
        onChange={(e) => setCorreo(e.target.value)}
        value={correo}
        required
      />
    </div>

    <div className="form-group">
      <label>Ciudad:</label>
      <input
        type="text"
        name="ciudad"
        onChange={(e) => setCiudad(e.target.value)}
        value={ciudad}
        required
      />
    </div>

    <div className="form-group">
      <label>Código Postal:</label>
      <input
        type="number"
        name="codigoPostal"
        onChange={(e) => setCodigoPostal(e.target.value)}
        value={codigoPostal}
        required
      />
    </div>

    <button type="submit" className="btn-rgb">
      Guardar
    </button>

  </form>
</div>

        )
            
        }
