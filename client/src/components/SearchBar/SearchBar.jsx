import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import './SearchBar.css';
import { API_URL } from '../../config';

const SearchBar = ({ setSearchResultados, setSearchActive }) => {
  const [consulta, setConsulta] = useState("");
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const rol = localStorage.getItem("rol");
    setUserRole(rol);
  }, []);

  const productSearch = async (e) => {
    e.preventDefault();
    if (!consulta.trim()) return;

    try {
      const res = await axios.get(
        `${API_URL}/api/products/public?category=${consulta}`
      );
      setSearchResultados(res.data);
      setSearchActive(true);
    } catch (err) {
      console.error(err);
    }
  };

  const resetSearch = () => {
    setConsulta("");
    setSearchActive(false);
  };

  return (
    <div className="searchBarContain">
      <div className="logo-container">
        <img src="/img/GameMastersLogo-.webp" alt="Logo" />
      </div>

      <form className="search-form" onSubmit={productSearch}>
        <label className="lab">Buscar Productos</label>
        <div className="search-input-container">
          <input
            type="search"
            placeholder="🔎 Buscar productos..."
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
          />
          <button type="submit">🔍</button>
          {consulta && <button type="button" onClick={resetSearch}>✖</button>}
        </div>
      </form>

      {/* ✅ Mostrar botones solo para admin */}
      {userRole === "admin" && (
        <div className="btn-cont">
          <Link to="/agregar/product" className="btn">Agregar Producto</Link>
          <Link to="/add/suppliers" className="btn">Agregar Proveedor</Link>
          <Link to="/add/category" className="btn">Agregar Categoría</Link> {/* Nuevo botón */}
        </div>
      )}
    </div>
  );
};

export default SearchBar;