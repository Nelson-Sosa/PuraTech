import { useState} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import '../SupplierForm/SupplierForm.css';
import { API_URL } from '../../config';
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
            await axios.post(`${API_URL}/api/add/suppliers`, {
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
        return (
          <div className="supplier-container">
            <div className="form-wrapper">
              <Link to="/suppliers" className="back-link">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span>Ver Proveedores</span>
              </Link>

              <form className="supplier-form" onSubmit={fetchSupplier}>
                <div className="form-header">
                  <div className="icon-badge">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <h2 className="form-title">Nuevo Proveedor</h2>
                  <p className="form-subtitle">Registra la información de contacto de tu proveedor</p>
                </div>

                <div className="form-grid">
                  <div className="input-group">
                    <label htmlFor="nombre">Nombre</label>
                    <input
                      id="nombre"
                      type="text"
                      placeholder="Nombre del contacto"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      required
                      autoComplete="off"
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="apellido">Apellido</label>
                    <input
                      id="apellido"
                      type="text"
                      placeholder="Apellido del contacto"
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                      required
                      autoComplete="off"
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="ruc">RUC / Identificación</label>
                    <input
                      id="ruc"
                      type="text"
                      placeholder="Ej: 80012345-6"
                      value={ruc}
                      onChange={(e) => setRuc(e.target.value)}
                      required
                      autoComplete="off"
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="telefono">Teléfono</label>
                    <input
                      id="telefono"
                      type="number"
                      placeholder="Número de contacto"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      required
                      autoComplete="off"
                    />
                  </div>

                  <div className="input-group full-width">
                    <label htmlFor="correo">Correo Electrónico</label>
                    <input
                      id="correo"
                      type="email"
                      placeholder="ejemplo@correo.com"
                      value={correo}
                      onChange={(e) => setCorreo(e.target.value)}
                      required
                      autoComplete="off"
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="ciudad">Ciudad</label>
                    <input
                      id="ciudad"
                      type="text"
                      placeholder="Ciudad base"
                      value={ciudad}
                      onChange={(e) => setCiudad(e.target.value)}
                      required
                      autoComplete="off"
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="codigoPostal">Código Postal</label>
                    <input
                      id="codigoPostal"
                      type="number"
                      placeholder="C.P."
                      value={codigoPostal}
                      onChange={(e) => setCodigoPostal(e.target.value)}
                      required
                      autoComplete="off"
                    />
                  </div>
                </div>

                <button type="submit" className="submit-button">
                  <span>Registrar Proveedor</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        );
      };
