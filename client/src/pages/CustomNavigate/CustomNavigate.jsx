import React from "react";
import { Link } from "react-router-dom";
import './CustomNavigate.css';

const CustomNavigate = () => {
  return (
    <div className="cont-nav">
      <Link to="/category/Pc Gamer">Pc Gamer</Link>
      <Link to="/category/Notebook Gamer">Notebook Gamer</Link>
      <Link to="/category/Consolas">Consolas</Link>
      <Link to="/category/Mouse">Mouse</Link>
      <Link to="/category/Teclado">Teclado</Link>
      <Link to="/category/Monitor">Monitor</Link>
    </div>
  );
};

export default CustomNavigate;
