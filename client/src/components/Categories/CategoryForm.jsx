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
    <h2 className="form-title">Agregar Categoría</h2>

    <input
      type="text"
      placeholder="Nombre de categoría"
      value={nombre}
      onChange={(e) => setNombre(e.target.value)}
    />

    <button type="submit">Agregar</button>

    {error && <div className="error">{error}</div>}
  </form>
</div>
  );
};

export default CategoryForm;