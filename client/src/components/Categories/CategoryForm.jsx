import { useState, useEffect } from "react";
import axios from "axios";
import './CategoryForm.css';
import { API_URL } from '../../config';

const CategoryForm = ({ onCategoryAdded, editingCategory, onCancelEdit }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parentId: "",
    orden: 0
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isEditing = !!editingCategory;

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name || "",
        description: editingCategory.description || "",
        parentId: editingCategory.parentId || "",
        orden: editingCategory.orden || 0
      });
    } else {
      setFormData({
        name: "",
        description: "",
        parentId: "",
        orden: 0
      });
    }
  }, [editingCategory]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/categories`);
      setCategories(res.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  const getParentOptions = () => {
    return categories.filter(cat => {
      if (editingCategory && cat._id === editingCategory._id) return false;
      return cat.nivel < 3;
    });
  };

  const getNivelPreview = () => {
    if (!formData.parentId) return 1;
    const parent = categories.find(c => c._id === formData.parentId);
    return parent ? parent.nivel + 1 : 1;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name.trim()) {
      setError("Debes ingresar un nombre de categoría");
      return;
    }

    const nivelPreview = getNivelPreview();
    if (nivelPreview > 3) {
      setError("Máximo 3 niveles de profundidad");
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        parentId: formData.parentId || null,
        orden: formData.orden || 0
      };

      let res;
      if (isEditing) {
        res = await axios.put(
          `${API_URL}/api/categories/${editingCategory._id}`,
          payload,
          { headers: { token_usuario: localStorage.getItem("token") } }
        );
      } else {
        res = await axios.post(
          `${API_URL}/api/categories`,
          payload,
          { headers: { token_usuario: localStorage.getItem("token") } }
        );
      }

      if (res.status === 200 || res.status === 201) {
        setSuccess(isEditing ? "Categoría actualizada correctamente" : "Categoría creada correctamente");
        if (!isEditing) {
          setFormData({ name: "", description: "", parentId: "", orden: 0 });
        }
        if (onCategoryAdded) onCategoryAdded(res.data);
        if (isEditing && onCancelEdit) {
          setTimeout(() => onCancelEdit(), 1500);
        }
        fetchCategories();
      }
    } catch (err) {
      console.error("Error al guardar categoría", err);
      setError(err.response?.data?.mensaje || "Error al guardar categoría");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getIndentText = (nivel) => {
    return "  ".repeat(nivel - 1);
  };

  return (
    <div className="category-container">
      <form className="category-form" onSubmit={handleSubmit}>
        <div className="form-header">
          <div className="icon-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isEditing ? <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /> : <path d="M12 5v14M5 12h14" />}
            </svg>
          </div>
          <h2 className="form-title">{isEditing ? "Editar Categoría" : "Nueva Categoría"}</h2>
          <p className="form-subtitle">
            {isEditing ? "Modifica los datos de la categoría" : "Crea una nueva categoría o subcategoría"}
          </p>
        </div>

        <div className="form-body">
          <div className="input-group">
            <label htmlFor="category-name">
              Nombre de la Categoría <span className="required">*</span>
            </label>
            <input
              id="category-name"
              name="name"
              type="text"
              placeholder="Ej: Electrónica, PlayStation, Gaming..."
              value={formData.name}
              onChange={handleChange}
              autoComplete="off"
            />
          </div>

          <div className="input-group">
            <label htmlFor="category-description">Descripción</label>
            <textarea
              id="category-description"
              name="description"
              placeholder="Descripción opcional de la categoría..."
              value={formData.description}
              onChange={handleChange}
              rows={2}
            />
          </div>

          <div className="input-group">
            <label htmlFor="category-parent">
              Categoría Padre
              <span className="help-text"> (dejar vacío para categoría principal)</span>
            </label>
            <select
              id="category-parent"
              name="parentId"
              value={formData.parentId}
              onChange={handleChange}
            >
              <option value="">— Categoría Principal (Nivel 1) —</option>
              {loading ? (
                <option disabled>Cargando...</option>
              ) : (
                (() => {
                  const opts = getParentOptions();
                  let sepShown = false;
                  const items = [];
                  for (const cat of opts) {
                    const prev = opts[opts.indexOf(cat) - 1];
                    if (!sepShown && prev && prev.nivel === 1 && cat.nivel === 2) {
                      items.push(<option key="sep" disabled>──────── Subcategorías ────────</option>);
                      sepShown = true;
                    }
                    items.push(
                      <option key={cat._id} value={cat._id}>
                        {getIndentText(cat.nivel)}{"└ "}{cat.name} {cat.nivel === 1 ? "🔹" : "🔸"}
                      </option>
                    );
                  }
                  return items;
                })()
              )}
            </select>
            <span className="input-hint">
              Nivel resultante: <strong>{getNivelPreview()}</strong> 
              {getNivelPreview() === 3 && " (máximo)"}
            </span>
          </div>

          <div className="input-group">
            <label htmlFor="category-order">Orden de aparición</label>
            <input
              id="category-order"
              name="orden"
              type="number"
              min="0"
              placeholder="0"
              value={formData.orden}
              onChange={handleChange}
            />
            <span className="input-hint">Las categorías se ordenan ascendentemente por este número</span>
          </div>
        </div>

        <div className="form-actions">
          {isEditing && (
            <button type="button" className="cancel-button" onClick={onCancelEdit}>
              Cancelar
            </button>
          )}
          <button type="submit" className="submit-button">
            <span>{isEditing ? "Guardar Cambios" : "Crear Categoría"}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>

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

        {success && (
          <div className="success-container">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>{success}</span>
          </div>
        )}
      </form>
    </div>
  );
};

export default CategoryForm;