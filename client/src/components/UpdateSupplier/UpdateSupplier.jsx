import { useState, useEffect} from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../UpdateSupplier/UpdateSupplier.css';

const UpdateSupplier = ()=>{
    const{id} = useParams();
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [ruc, setRuc] = useState("");
    const [correo, setCorreo] = useState("");
    const [ciudad, setCiudad] = useState("");
    const [codigoPostal, setCodigoPostal] = useState("");
    const navigate = useNavigate();

    useEffect(()=>{
        axios.get(`http://localhost:8000/api/supplier/${id}`,{
            headers: {
                token_usuario: localStorage.getItem("token")
            }
        })
        .then(res =>{
            setNombre(res.data.nombre);
            setApellido(res.data.apellido);
            setRuc(res.data.ruc);
            setCorreo(res.data.correo);
            setCiudad(res.data.ciudad);
            setCodigoPostal(res.data.codigoPostal);
        })
        .catch(err => {
            console.error("Error al cargar proveedor", err);
            if (err.response && err.response.status === 401) {
                navigate('/login');
            }
        });
    }, [id]);
    

    const UpdateSupplier = (e) => {
        e.preventDefault();

        axios.put(`http://localhost:8000/api/edit/supplier/${id}`, {
            nombre,
            apellido,
            ruc,
            correo,
            ciudad,
            codigoPostal
        },{
            headers:{
                token_usuario: localStorage.getItem("token")
            }
        })
            .then(res => console.log(res))
            .catch(err => {
                console.error("Error al cargar proveedor", err);
                if (err.response && err.response.status === 401) {
                    navigate('/login');
                }
            });
    };


    return(
       <div className="contenedor">
  <h2 className="titulo-rgb">Update Supplier</h2>

  <form onSubmit={UpdateSupplier}>

    <div className="form-group">
      <label>Nombre</label>
      <input
        type="text"
        name="nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />
    </div>

    <div className="form-group">
      <label>Apellido</label>
      <input
        type="text"
        name="apellido"
        value={apellido}
        onChange={(e) => setApellido(e.target.value)}
      />
    </div>

    <div className="form-group">
      <label>RUC</label>
      <input
        type="text"
        name="ruc"
        value={ruc}
        onChange={(e) => setRuc(e.target.value)}
      />
    </div>

    <div className="form-group">
      <label>Correo</label>
      <input
        type="text"
        name="correo"
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
      />
    </div>

    <div className="form-group">
      <label>Ciudad</label>
      <input
        type="text"
        name="ciudad"
        value={ciudad}
        onChange={(e) => setCiudad(e.target.value)}
      />
    </div>

    <div className="form-group">
      <label>Código Postal</label>
      <input
        type="number"
        name="codigoPostal"
        value={codigoPostal}
        onChange={(e) => setCodigoPostal(e.target.value)}
      />
    </div>

    <button type="submit" className="btn-rgb">
      Update
    </button>

  </form>
</div>

    )

}

export default UpdateSupplier;