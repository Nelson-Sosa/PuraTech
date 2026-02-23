import axios from "axios";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import '../formularioLogin/formularioLogin.css';
import backgroundImage1 from '../../assets/images/pexels-rdne-7915437.jpg';
import { jwtDecode } from "jwt-decode";


const FormularioLogin = (props) => {
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const navegacion = useNavigate();
  const [error, setError] = useState();

  const procesaLogin = async (e)=>{
    e.preventDefault();
    
    try{
      const res = await axios.post('http://localhost:8000/api/login',{
              correo,
              contraseña
    });

    const datos = res.data;
    if(res.status === 200){
      console.log("Inicio de sesión exitoso", datos);
      localStorage.setItem("token", datos.token);

      const decodificar = jwtDecode(datos.token);
      const userRole = decodificar.rol;
      
      localStorage.setItem("rol", userRole); // Guardar el rol en localStorage
     
      props.setLogin(true);
      setError("");
      navegacion("/category/Tablet");
    }
  } catch (error) {
    const errorMessage = error.response
      ? (typeof error.response.data === 'string'
        ? error.response.data
        : error.response.data.mensaje || JSON.stringify(error.response.data))
      : error.message;
  
    setError(errorMessage);
    console.error("Error durante el inicio de sesión", errorMessage);
  }

  };

  return (
    <div className="contLogin" style={{ backgroundImage: `url(${backgroundImage1})` }}> 
      <h1>Login</h1>
      <form onSubmit={procesaLogin} className="">
        <div>
          <label htmlFor="correo">mail:</label>
          <input
            type="text"
            id="correo"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="contraseña">password:</label>
          <input
            type="password"  
            id="contraseña"
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
          />
        </div>
        <button> Login </button>
        {error && <span>{error}</span>}
      </form>
    </div>
  );
};

export default FormularioLogin;

