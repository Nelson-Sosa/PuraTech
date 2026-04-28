import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./CustomNavigate.css";
import { API_URL} from '../../config';
const CustomNavigate = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${API_URL}/api/categories`,
          token ? { headers: { token_usuario: token } } : {}
        );
        setCategories(res.data);
      } catch (error) {
        console.error("Error cargando categorías", error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="cont-nav">
      {categories.length > 0 ? (
        categories.map((cat) => (
          <Link
            key={cat._id}
            to={`/category/${encodeURIComponent(cat.name)}`}
          >
            {cat.name}
          </Link>
        ))
      ) : (
        <span>Cargando categorías...</span>
      )}
    </div>
  );
};

export default CustomNavigate;