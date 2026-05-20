import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import './Categories.css';
import { API_URL } from '../../config';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [categoryTree, setCategoryTree] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [error, setError] = useState("");
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [editingCategory, setEditingCategory] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parentId: "",
    orden: 0
  });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const roleFromStorage = localStorage.getItem("rol");
    setUserRole(roleFromStorage);
    fetchCategories();
    fetchCategoryTree();
  }, []);

  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name || "",
        description: editingCategory.description || "",
        parentId: editingCategory.parentId || "",
        orden: editingCategory.orden || 0
      });
      setShowForm(true);
    }
  }, [editingCategory]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/categories`);
      setCategories(res.data);
    } catch (err) {
      console.error("Error al cargar categorías:", err);
      setError("No se pudieron cargar las categorías");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryTree = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/categories/tree`);
      setCategoryTree(res.data);
    } catch (err) {
      console.error("Error al cargar árbol de categorías:", err);
    }
  };

  const getCategoryById = (id) => categories.find(c => c._id === id);

  const toggleExpand = (id) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getParentOptions = () => {
    if (!editingCategory) return categories.filter(c => c.nivel < 3);
    return categories.filter(c => {
      if (c._id === editingCategory._id) return false;
      if (c.nivel >= 3) return false;
      if (editingCategory.nivel === 1 && c.nivel >= 1) return false;
      return true;
    });
  };

  const getNivelPreview = () => {
    if (!formData.parentId) return 1;
    const parent = getCategoryById(formData.parentId);
    return parent ? parent.nivel + 1 : 1;
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!formData.name.trim()) {
      setFormError("El nombre es requerido");
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        parentId: formData.parentId || null,
        orden: parseInt(formData.orden) || 0
      };

      const headers = { token_usuario: localStorage.getItem("token") };

      if (editingCategory) {
        await axios.put(`${API_URL}/api/categories/${editingCategory._id}`, payload, { headers });
        setFormSuccess("Categoría actualizada correctamente");
      } else {
        await axios.post(`${API_URL}/api/categories`, payload, { headers });
        setFormSuccess("Categoría creada correctamente");
        setFormData({ name: "", description: "", parentId: "", orden: 0 });
      }

      fetchCategories();
      fetchCategoryTree();
      
      setTimeout(() => {
        setShowForm(false);
        setEditingCategory(null);
        setFormSuccess("");
      }, 1500);
    } catch (err) {
      console.error("Error al guardar:", err);
      setFormError(err.response?.data?.mensaje || "Error al guardar categoría");
    }
  };

  const handleEditClick = (cat) => {
    setEditingCategory(cat);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setShowForm(false);
    setFormData({ name: "", description: "", parentId: "", orden: 0 });
    setFormError("");
    setFormSuccess("");
  };

  const handleDeleteCategory = async (id, hasChildren) => {
    if (hasChildren) {
      alert("No puedes eliminar una categoría con subcategorías. Elimina las subcategorías primero.");
      return;
    }
    if (!window.confirm("¿Estás seguro de eliminar esta categoría?")) return;
    
    try {
      await axios.delete(`${API_URL}/api/categories/${id}`, {
        headers: { token_usuario: localStorage.getItem("token") },
      });
      fetchCategories();
      fetchCategoryTree();
    } catch (err) {
      console.error("Error al eliminar:", err);
      alert(err.response?.data?.mensaje || "No se pudo eliminar la categoría");
    }
  };

  const renderCategory = (category, level = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedIds.has(category._id);

    return (
      <li key={category._id} className="category-item-wrapper">
        <div 
          className={`category-row nivel-${category.nivel}`}
          style={{ paddingLeft: `${20 + level * 24}px` }}
        >
          {hasChildren ? (
            <button 
              className={`expand-btn ${isExpanded ? 'expanded' : ''}`}
              onClick={() => toggleExpand(category._id)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          ) : (
            <span className="expand-placeholder" />
          )}

          <span className="category-icon">
            {category.nivel === 1 ? "📂" : category.nivel === 2 ? "📁" : "🏷️"}
          </span>

          <div className="category-details">
            <span className="category-name">{category.name}</span>
            {category.parentId && (
              <span className="category-parent">
                ⊂ {getCategoryById(category.parentId)?.name || ""}
              </span>
            )}
          </div>

          <div className="category-meta">
            <span className={`level-badge nivel-${category.nivel}`}>
              Nivel {category.nivel}
            </span>
          </div>

          {userRole === "admin" && (
            <div className="category-actions">
              <button
                className="btn-edit-category"
                onClick={() => handleEditClick(category)}
                title="Editar"
              >
                ✏️
              </button>
              <button
                className="btn-delete-category"
                onClick={() => handleDeleteCategory(category._id, hasChildren)}
                title={hasChildren ? "Tiene subcategorías" : "Eliminar"}
                disabled={hasChildren}
              >
                🗑️
              </button>
            </div>
          )}
        </div>

        {hasChildren && isExpanded && (
          <ul className="category-children">
            {category.children.map(child => renderCategory(child, level + 1))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <div className="categories-page">
      <div className="categories-container">
        <header className="page-header">
          <div className="header-content">
            <h1>Gestión de Categorías</h1>
            <p>Organiza tu tienda con categorías jerárquicas</p>
          </div>
          {!showForm && (
            <button 
              className="btn-add-category"
              onClick={() => setShowForm(true)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Nueva Categoría
            </button>
          )}
        </header>

        {showForm && (
          <div className="category-form-section">
            <form className="inline-category-form" onSubmit={handleFormSubmit}>
              <div className="form-header-inline">
                <h3>{editingCategory ? "Editar Categoría" : "Nueva Categoría"}</h3>
                {editingCategory && (
                  <button type="button" className="btn-close-form" onClick={handleCancelEdit}>
                    ✕
                  </button>
                )}
              </div>

              <div className="form-row">
                <div className="form-group flex-2">
                  <label>Nombre *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="Ej: Electrónica, PlayStation..."
                  />
                </div>

                <div className="form-group flex-1">
                  <label>Categoría Padre</label>
                  <select
                    name="parentId"
                    value={formData.parentId}
                    onChange={handleFormChange}
                  >
                    <option value="">— Principal (Nivel 1) —</option>
                    {getParentOptions().map(cat => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name} (Nivel {cat.nivel})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Descripción</label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    placeholder="Descripción opcional..."
                  />
                </div>

                <div className="form-group">
                  <label>Orden</label>
                  <input
                    type="number"
                    name="orden"
                    value={formData.orden}
                    onChange={handleFormChange}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-info">
                <span className="nivel-preview">
                  Nivel resultante: <strong>{getNivelPreview()}</strong>
                  {getNivelPreview() === 3 && " (máximo)"}
                </span>
              </div>

              {formError && <div className="form-error">{formError}</div>}
              {formSuccess && <div className="form-success">{formSuccess}</div>}

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={handleCancelEdit}>
                  Cancelar
                </button>
                <button type="submit" className="btn-submit">
                  {editingCategory ? "Guardar Cambios" : "Crear Categoría"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="categories-layout">
          <div className="categories-tree-section">
            <div className="tree-header">
              <h2>Estructura de Categorías</h2>
              <span className="category-count">{categories.length} categorías</span>
            </div>

            {!loading && categoryTree.length > 0 ? (
              <div className="categories-tree">
                <ul className="tree-root">
                  {categoryTree.map(category => renderCategory(category))}
                </ul>
              </div>
            ) : !loading ? (
              <div className="empty-state">
                <span className="empty-icon">📂</span>
                <p>No hay categorías creadas</p>
                <button className="btn-create-first" onClick={() => setShowForm(true)}>
                  Crear primera categoría
                </button>
              </div>
            ) : (
              <div className="loading-state">Cargando...</div>
            )}
          </div>

          <div className="categories-info-section">
            <h2>Guía de Niveles</h2>
            <div className="level-guide">
              <div className="level-item">
                <span className="level-icon">📂</span>
                <div>
                  <strong>Nivel 1</strong>
                  <small>Categoría principal</small>
                </div>
              </div>
              <div className="level-item">
                <span className="level-icon">📁</span>
                <div>
                  <strong>Nivel 2</strong>
                  <small>Subcategoría</small>
                </div>
              </div>
              <div className="level-item">
                <span className="level-icon">🏷️</span>
                <div>
                  <strong>Nivel 3</strong>
                  <small>Subcategoría final</small>
                </div>
              </div>
            </div>
            <p className="guide-note">
              Máximo 3 niveles de profundidad para mantener una navegación clara.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;
