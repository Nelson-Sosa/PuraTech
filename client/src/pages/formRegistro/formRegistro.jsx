import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../formRegistro/formRegistro.css';
import { API_URL } from '../../config';

const FormRegistro = () => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [edad, setEdad] = useState('');
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [confirContraseña, setConfirContraseña] = useState('');
  const [rol, setRol] = useState('usuario');
  const [error, setError] = useState({});
  const navegar = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newError = {};

    // Validaciones
    if (nombre.length < 3) newError.nombre = "Nombre debe tener al menos 3 caracteres";
    if (!/^[a-zA-Z0-9]+$/.test(nombre)) newError.nombre = "Nombre solo puede contener letras y números";

    if (apellido.length < 3) newError.apellido = "Apellido debe tener al menos 3 caracteres";
    if (!/^[a-zA-Z0-9]+$/.test(apellido)) newError.apellido = "Apellido solo puede contener letras y números";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) newError.correo = "Correo inválido";

    if (contraseña.length < 5) newError.contraseña = "Contraseña debe tener al menos 5 caracteres";
    if (contraseña !== confirContraseña) newError.confirContraseña = "Las contraseñas no coinciden";

    setError(newError);

    if (Object.keys(newError).length === 0) {
      try {
        await axios.post(`${API_URL}/api/agregar/usuario`, {
          nombre,
          apellido,
          edad,
          correo,
          contraseña,
          rol
        });

        alert("Usuario registrado correctamente");
        navegar('/login');
      } catch (err) {
        console.error("Error al registrar usuario:", err.response?.data || err.message);
        alert('Error registrando usuario: ' + (err.response?.data?.error || err.response?.data?.mensaje || err.message));
      }
    }
  };

  return (
    <div className="contRegistro">
      <div className="registro-card">
        <h1>Crea tu cuenta</h1>
        <p className="registro-subtitle">Únete a la mayor comunidad gamer</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Nombre</label>
              <input type="text" placeholder="Ej. Juan" value={nombre} onChange={(e) => setNombre(e.target.value)} />
              {error.nombre && <div className="error-text">{error.nombre}</div>}
            </div>

            <div className="form-group">
              <label>Apellido</label>
              <input type="text" placeholder="Ej. Pérez" value={apellido} onChange={(e) => setApellido(e.target.value)} />
              {error.apellido && <div className="error-text">{error.apellido}</div>}
            </div>
          </div>

          <div className="form-group">
            <label>Edad</label>
            <input type="number" placeholder="Tu edad" value={edad} onChange={(e) => setEdad(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Correo Electrónico</label>
            <input type="email" placeholder="nombre@ejemplo.com" value={correo} onChange={(e) => setCorreo(e.target.value)} />
            {error.correo && <div className="error-text">{error.correo}</div>}
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input type="password" placeholder="Mínimo 5 caracteres" value={contraseña} onChange={(e) => setContraseña(e.target.value)} />
            {error.contraseña && <div className="error-text">{error.contraseña}</div>}
          </div>

          <div className="form-group">
            <label>Confirmar Contraseña</label>
            <input type="password" placeholder="Repite tu contraseña" value={confirContraseña} onChange={(e) => setConfirContraseña(e.target.value)} />
            {error.confirContraseña && <div className="error-text">{error.confirContraseña}</div>}
          </div>

          <div className="form-group">
            <label>Rol</label>
            <select value={rol} onChange={(e) => setRol(e.target.value)}>
              <option value="usuario">Usuario Estándar</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <button className="btn-registro" type="submit">Registrarse Ahora</button>
          
          <div className="form-footer">
            ¿Ya tienes una cuenta? <span onClick={() => navegar('/login')}>Inicia sesión</span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormRegistro;