import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import './SearchBar.css';
import { API_URL } from '../../config';

const SearchBar = ({ setSearchResultados, setSearchActive }) => {
  const [consulta, setConsulta] = useState("");
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const rol = localStorage.getItem("rol");
    setUserRole(rol);
  }, []);

  // Búsqueda avanzada con debounce
  const performSearch = useCallback(async (searchTerm) => {
    if (!searchTerm.trim()) {
      setSearchActive(false);
      setSearchResultados([]);
      return;
    }

    setLoading(true);
    console.log("🔍 Buscando:", searchTerm);
    
    try {
      // Usar endpoint de búsqueda global
      const res = await axios.get(
        `${API_URL}/api/search-products?category=${encodeURIComponent(searchTerm)}`
      );
      console.log("✅ Resultados búsqueda:", res.data.length);
      setSearchResultados(res.data);
      setSearchActive(true);
    } catch (err) {
      console.error("🔴 Error en búsqueda:", err);
      // Si falla, intentar búsqueda por categoría
      try {
        console.log("🔄 Intentando búsqueda por categoría...");
        const localRes = await axios.get(
          `${API_URL}/api/products?category=${encodeURIComponent(searchTerm)}`
        );
        console.log("✅ Resultados categoría:", localRes.data.length);
        setSearchResultados(localRes.data);
        setSearchActive(true);
      } catch (fallbackErr) {
        console.error("🔴 Fallback search also failed:", fallbackErr);
        setSearchResultados([]);
      }
    } finally {
      setLoading(false);
    }
  }, [setSearchResultados, setSearchActive]);

  // Debounce de 300ms para búsqueda en tiempo real
  useEffect(() => {
    const timer = setTimeout(() => {
      if (consulta.trim()) {
        performSearch(consulta);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [consulta, performSearch]);

  const productSearch = async (e) => {
    e.preventDefault();
    performSearch(consulta);
  };

  const resetSearch = () => {
    setConsulta("");
    setSearchActive(false);
    setSearchResultados([]);
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
            placeholder="🔎 Buscar productos (nombre, marca, categoría)..."
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
            className={loading ? "searching" : ""}
          />
          <button type="submit" disabled={loading}>
            {loading ? "⏳" : "🔍"}
          </button>
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