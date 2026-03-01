// src/components/formularioLogin/FormularioLogin.jsx
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../formularioLogin/formularioLogin.css';
import backgroundImage1 from '../../assets/images/pexels-rdne-7915437.jpg';
import jwtDecode from "jwt-decode";
import { API_URL } from '../../config';

const FormularioLogin = ({ setLogin }) => {
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [error, setError] = useState("");
  const navegacion = useNavigate();

  const procesaLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${API_URL}/api/login`, {
        correo,
        contraseña
      });

      const datos = res.data;
      if (res.status === 200) {
        console.log("Inicio de sesión exitoso", datos);

        localStorage.setItem("token", datos.token);

        const decodificar = jwtDecode(datos.token); // ← funciona ahora
        const userRole = decodificar.rol;
        localStorage.setItem("rol", userRole); // Guardar el rol en localStorage

        setLogin(true);
        setError("");
        navegacion("/category/Tablet");
      }
    } catch (err) {
      const errorMessage = err.response
        ? (typeof err.response.data === 'string'
          ? err.response.data
          : err.response.data.mensaje || JSON.stringify(err.response.data))
        : err.message;

      setError(errorMessage);
      console.error("Error durante el inicio de sesión", errorMessage);
    }
  };

  return (
    <div 
  className="contLogin"
>
      <h1>Login</h1>
      <form onSubmit={procesaLogin}>
        <div>
          <label htmlFor="correo">Correo:</label>
          <input
            type="text"
            id="correo"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="contraseña">Contraseña:</label>
          <input
            type="password"  
            id="contraseña"
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
          />
        </div>
        <button>Login</button>
        {error && <span className="error">{error}</span>}
      </form>
    </div>
  );
};

export default FormularioLogin;