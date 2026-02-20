import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import './SearchBar.css';

const SearchBar = ({ setSearchResultados, setSearchActive }) => {
  const [consulta, setConsulta] = useState("");

  const productSearch = async (e) => {
    e.preventDefault();
    if (!consulta.trim()) return;

    try {
      const res = await axios.get(
        `http://localhost:8000/api/search-products?category=${consulta}`,
        { headers: { token_usuario: localStorage.getItem("token") } }
      );
      setSearchResultados(res.data);
      setSearchActive(true); // ⚡ activa búsqueda
    } catch (err) {
      console.error(err);
    }
  };

  // ⚡ Resetear búsqueda
  const resetSearch = () => {
    setConsulta("");
    setSearchActive(false);
  };

  return (
    <div className="searchBarContain">
      <div className="logo-container">
        <img src="/img/GameMastersLogo-.png" alt="Logo" />
      </div>

      <form className="search-form" onSubmit={productSearch}>
        <label className="lab">Search products</label>
        <div className="search-input-container">
          <input
            type="search"
            placeholder="Scan the marketplace..."
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
          />
          <button type="submit">🔍</button>
          {consulta && <button type="button" onClick={resetSearch}>✖</button>}
        </div>
      </form>

      <div className="btn-cont">
        <Link to="/agregar/product" className="btn">Add Product</Link>
        <Link to="/add/suppliers" className="btn">Add Supplier</Link>
      </div>
    </div>
  );
};

export default SearchBar;