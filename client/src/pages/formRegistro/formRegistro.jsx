    import { useState } from "react";
    import axios from "axios";
    import { useNavigate } from "react-router-dom";
    import '../formRegistro/formRegistro.css';

    const FormRegistro = () =>{
        const [nombre, setNombre] = useState('');
        const [apellido, setApellido] = useState('');
        const [edad, setEdad] = useState('');
        const [correo, setCorreo] = useState('');
        const [contraseña, setContraseña] = useState();
        const [confirContraseña, setConfirContraseña] = useState();
        const [error, setError] = useState({})
        const navegar = useNavigate();

        const handleSubmit = async (e) =>{
            e.preventDefault();
            const newError = {};
            
            if(nombre.length < 3){
                newError.nombre = "Username must be at least 3 characters long"
            }else if(!/^[a-zA-Z0-9]+$/.test(nombre)){
                newError.nombre = "Username can only contain alphanumeric characters"
            }
            if(apellido.length < 3){
                newError.apellido = "Last name must be at least 3 characters long"
            }else if(!/^[a-zA-Z0-9]+$/.test(apellido)){
                newError.apellido = "Last name  can only contain alphanumeric characters"
            }
            if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)){
                newError.correo = "Please enter a valid email address"
            }
            if(confirContraseña !== contraseña){
                alert("Passwords do not match")
            }
            setError(newError);

            if(Object.keys(newError).length === 0){

            try{
                await axios.post('http://localhost:8000/api/agregar/usuario',{
                    nombre,
                    apellido,
                    edad,
                    correo,
                    contraseña
                });
                navegar('/login');
            }
            catch(err){
                console.error(err);
                alert('Error registering user')
            }
            
            }
  
        };

        return(
            <div className="conte">
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Nombre:</label>
                        <input 
                        type="text"
                        id="nombre"
                        value={nombre}
                        onChange={(e) =>setNombre(e.target.value)}/>
                        {error.nombre && <div className="error"> {error.nombre} </div>}
                    </div>
                    <div>
                        <label>Apellido:</label>
                        <input type="text"
                            id="apellido"
                            value={apellido}
                            onChange={(e) =>setApellido(e.target.value)} />
                            {error.apellido && <div className="error"> {error.apellido} </div>}
                    </div>
                    <div>
                        <label>Edad:</label>
                        <input type="number"
                                id="number"
                                value={edad}
                                onChange={(e) =>setEdad(e.target.value)} />
                                {error.edad && <div className="error"> {error.edad} </div>}
                    </div>
                    <div>
                        <label>Correo:</label>
                        <input type="correo"
                                id="correo"
                                value={correo}
                                onChange={(e) =>setCorreo(e.target.value)} />
                                {error.correo && <div className="error"> {error.correo} </div>}
                    </div>
                    <div>
                        <label>Contraseña:</label>
                        <input type="password"
                            id="contraseña"
                            value={contraseña}
                            onChange={(e) =>setContraseña(e.target.value)} />
                    </div>
                    <div>
                        <label>Confirmar Contraseña</label>
                        <input type="password"
                        id="confirmarContraseña"
                        value={confirContraseña}
                        onChange={(e) =>setConfirContraseña(e.target.value)}/>
                    </div>
                    <button>Registro</button>
                </form>
            </div>
        )

    }

    export default FormRegistro;