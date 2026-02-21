import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../formRegistro/formRegistro.css';

const FormRegistro = () => {
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [edad, setEdad] = useState('');
    const [correo, setCorreo] = useState('');
    const [contraseña, setContraseña] = useState('');
    const [confirContraseña, setConfirContraseña] = useState('');
    const [rol, setRol] = useState('usuario'); // default usuario
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
                await axios.post('http://localhost:8000/api/agregar/usuario', {
                    nombre,
                    apellido,
                    edad,
                    correo,
                    contraseña,
                    rol // Se envía rol al backend
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
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Nombre:</label>
                    <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} />
                    {error.nombre && <div className="error">{error.nombre}</div>}
                </div>

                <div>
                    <label>Apellido:</label>
                    <input type="text" value={apellido} onChange={(e) => setApellido(e.target.value)} />
                    {error.apellido && <div className="error">{error.apellido}</div>}
                </div>

                <div>
                    <label>Edad:</label>
                    <input type="number" value={edad} onChange={(e) => setEdad(e.target.value)} />
                </div>

                <div>
                    <label>Correo:</label>
                    <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} />
                    {error.correo && <div className="error">{error.correo}</div>}
                </div>

                <div>
                    <label>Contraseña:</label>
                    <input type="password" value={contraseña} onChange={(e) => setContraseña(e.target.value)} />
                    {error.contraseña && <div className="error">{error.contraseña}</div>}
                </div>

                <div>
                    <label>Confirmar Contraseña:</label>
                    <input type="password" value={confirContraseña} onChange={(e) => setConfirContraseña(e.target.value)} />
                    {error.confirContraseña && <div className="error">{error.confirContraseña}</div>}
                </div>

                <div>
                    <label>Rol:</label>
                    <select value={rol} onChange={(e) => setRol(e.target.value)}>
                        <option value="usuario">Usuario</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
              <button className="btn-registro" type="submit">
                    Registro
               </button>


            </form>
            
        </div>
    );
}

export default FormRegistro;
