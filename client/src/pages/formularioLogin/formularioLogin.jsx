import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { decode as jwtDecode } from "jwt-decode";
import '../formularioLogin/formularioLogin.css';
import backgroundImage1 from '../../assets/images/pexels-rdne-7915437.jpg';
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

      if (res.status === 200) {
        const datos = res.data;
        console.log("Inicio de sesión exitoso", datos);

        // Guardar token y rol
        localStorage.setItem("token", datos.token);
        const decodificar = jwtDecode(datos.token);
        localStorage.setItem("rol", decodificar.rol);

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
    <div className="contLogin" style={{ backgroundImage: `url(${backgroundImage1})` }}>
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
        <button type="submit">Login</button>
        {error && <span className="error">{error}</span>}
      </form>
    </div>
  );
};

export default FormularioLogin;