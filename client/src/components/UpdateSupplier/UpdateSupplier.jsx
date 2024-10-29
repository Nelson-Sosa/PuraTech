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
        <>
        <div className="update-conte">
            <h2>Update Suppler</h2>
            <form onSubmit={UpdateSupplier}>
                <p>
                <label>Nombre:</label>
                <input type="text"
                        name="nombre"
                        onChange={(e)=> setNombre(e.target.value)}
                        value={nombre} />
                </p>
                <p>
                    <label>Apellido:</label>
                    <input type="text"
                           name="apellido"
                           onChange={(e)=> setApellido(e.target.value)}
                           value={apellido} />
                </p>
                <p>
                    <label>Ruc:</label>
                    <input type="text"
                           name="ruc"
                           onChange={(e)=> setRuc(e.target.value)}
                           value={ruc} />
                </p>
                <p>
                    <label>Correo:</label>
                    <input type="text"
                          name="correo"
                          onChange={(e) => setCorreo(e.target.value)}
                          value={correo} />
                </p>
                <p>
                    <label>Ciudad:</label>
                    <input type="text"
                            name="ciudad"
                            onChange={(e) => setCiudad(e.target.value)}
                            value={ciudad}
                             />
                </p>
                <p>
                    <label>Codigo Postal:</label>
                    <input type="number"
                           name="codigoPostal"
                           onChange={(e) => setCodigoPostal(e.target.value)}
                           value={codigoPostal} />
                           
                </p>
                <button className="btn-edit1">Upadate</button>
            </form>
        </div>
        </>
    )

}

export default UpdateSupplier;