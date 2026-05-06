import { useEffect, useState } from "react";
import axios from "axios";
import './Categories.css';
import { API_URL } from '../../config';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const roleFromStorage = localStorage.getItem("rol");
    setUserRole(roleFromStorage);
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/categories`, 
        token ? { headers: { token_usuario: token } } : {}
      );
      setCategories(res.data);
    } catch (err) {
      console.error("Error al cargar categorías", err);
      setError("No se pudieron cargar las categorías");
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar esta categoría?")) return;
    try {
      await axios.delete(`${API_URL}/api/categories/${id}`, {
        headers: { token_usuario: localStorage.getItem("token") },
      });
      setCategories((prev) => prev.filter((cat) => cat._id !== id));
    } catch (err) {
      console.error("Error al eliminar categoría", err);
      setError("No se pudo eliminar la categoría");
    }
  };

  return (
    <div className="categories-page">
      <div className="categories-container">
        <header className="page-header">
          <h1>Lista de Categorías</h1>
          <p>Administra las secciones de tu tienda</p>
        </header>

        {error && <div className="error-message">{error}</div>}

        <div className="categories-grid-wrapper">
          {categories.length > 0 ? (
            <ul className="categories-list">
              {categories.map((cat) => (
                <li key={cat._id} className="category-item">
                  <div className="category-info">
                    <span className="category-name">{cat.name}</span>
                    <span className="category-count">Disponibles</span>
                  </div>
                  {userRole === "admin" && (
                    <button
                      className="btndelete"
                      onClick={() => handleDeleteCategory(cat._id)}
                      title="Eliminar categoría"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                      <span>Eliminar</span>
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              <p>No hay categorías cargadas aún.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Categories;