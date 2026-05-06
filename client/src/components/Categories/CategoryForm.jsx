import { useState } from "react";
import axios from "axios";
import './CategoryForm.css';
import { API_URL } from '../../config';

const CategoryForm = ({ onCategoryAdded }) => {
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setError("Debes ingresar un nombre de categoría");
      return;
    }

    try {
      const res = await axios.post(
        `${API_URL}/api/categories`,
        { name: nombre },  // ✅ Aquí cambia 'nombre' por 'name'
        { headers: { token_usuario: localStorage.getItem("token") } }
      );

      if (res.status === 200 || res.status === 201) {
        setNombre("");
        setError("");
        if (onCategoryAdded) onCategoryAdded(res.data);
      }
    } catch (err) {
      console.error("Error al agregar categoría", err);
      if (err.response) {
        setError(err.response.data.mensaje || "Error al agregar categoría");
      } else {
        setError("Error de conexión al servidor");
      }
    }
  };

  return (
    <div className="category-container">
      <form className="category-form" onSubmit={handleSubmit}>
        <div className="form-header">
          <div className="icon-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          <h2 className="form-title">Nueva Categoría</h2>
          <p className="form-subtitle">Crea una nueva sección para tus productos</p>
        </div>

        <div className="input-group">
          <label htmlFor="category-name">Nombre de la Categoría</label>
          <input
            id="category-name"
            type="text"
            placeholder="Ej: Accesorios, Consolas..."
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            autoComplete="off"
          />
        </div>

        <button type="submit" className="submit-button">
          <span>Añadir Categoría</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>

        {error && (
          <div className="error-container">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}
      </form>
    </div>
  );
};

export default CategoryForm;