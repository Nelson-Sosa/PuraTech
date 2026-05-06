import { useEffect, useState } from "react";
import axios from "axios";
import './Categories.css';
import { API_URL } from '../../config';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

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

  const handleEditClick = (cat) => {
    setEditingId(cat._id);
    setEditName(cat.name);
  };

  const handleSaveEdit = async (id) => {
    if (!editName.trim()) {
      setError("El nombre no puede estar vacío");
      return;
    }
    try {
      const res = await axios.put(`${API_URL}/api/categories/${id}`, 
        { name: editName },
        { headers: { token_usuario: localStorage.getItem("token") } }
      );
      setCategories((prev) => prev.map((cat) => cat._id === id ? res.data : cat));
      setEditingId(null);
      setEditName("");
      setError("");
    } catch (err) {
      console.error("Error al editar categoría", err);
      setError("No se pudo editar la categoría");
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
                <li key={cat._id} className={`category-item ${editingId === cat._id ? 'editing' : ''}`}>
                  {editingId === cat._id ? (
                    <div className="edit-mode">
                      <input 
                        type="text" 
                        value={editName} 
                        onChange={(e) => setEditName(e.target.value)}
                        className="edit-input"
                        autoFocus
                      />
                      <div className="edit-actions">
                        <button className="btnsave" onClick={() => handleSaveEdit(cat._id)}>Guardar</button>
                        <button className="btncancel" onClick={() => setEditingId(null)}>Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="category-info">
                        <span className="category-name" title={cat.name}>{cat.name}</span>
                        <span className="category-count">Disponibles</span>
                      </div>
                      {userRole === "admin" && (
                        <div className="category-actions">
                          <button
                            className="btnedit"
                            onClick={() => handleEditClick(cat)}
                            title="Editar categoría"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            <span>Editar</span>
                          </button>
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
                        </div>
                      )}
                    </>
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