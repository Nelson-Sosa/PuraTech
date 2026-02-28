import { useEffect, useState } from "react";
import axios from "axios";
import CategoryForm from "../../components/Categories/CategoryForm";
import './Categories.css';
import { API_URL} from '../../config';
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
      const res = await axios.get(`${API_URL}/api/categories`, {
        headers: { token_usuario: localStorage.getItem("token") },
      });
      setCategories(res.data);
    } catch (err) {
      console.error("Error al cargar categorías", err);
      setError("No se pudieron cargar las categorías");
    }
  };

  const handleCategoryAdded = (newCategory) => {
    setCategories((prev) => [...prev, newCategory]);
  };

  const handleDeleteCategory = async (id) => {
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
    <div className="categories-container">
      <h1>Categorías</h1>

      {/* Solo admins pueden agregar categorías */}
      {userRole === "admin" && (
        <CategoryForm onCategoryAdded={handleCategoryAdded} />
      )}

      {error && <p className="error">{error}</p>}

      <ul className="categories-list">
  {categories.map((cat) => (
    <li key={cat._id}>
      {cat.name}  {/* ✅ usa 'name' */}
      {userRole === "admin" && (
        <button
          className="btndelete"
          onClick={() => handleDeleteCategory(cat._id)}
        >
          Eliminar
        </button>
      )}
    </li>
  ))}
</ul>
    </div>
  );
};

export default Categories;