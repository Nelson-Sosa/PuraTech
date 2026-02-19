import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../formProduct/formProduct.css";

const FormProduct = () => {
  const [category, setCategory] = useState("Pc Gamer");
  const [nombre, setNombre] = useState("");
  const [marca, setMarca] = useState("");
  const [precio, setPrecio] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!category) newErrors.category = "Category is required";
    if (!nombre) newErrors.nombre = "Name is required";
    if (!marca) newErrors.marca = "Brand is required";
    if (!precio) newErrors.precio = "Price is required";
    if (!descripcion) newErrors.descripcion = "Description is required";
    if (!imageUrl) newErrors.imageUrl = "Image is required";
    return newErrors;
  };

  const handleImageChange = (e) => {
    setImageUrl(e.target.files[0]);
  };

  const procesaForm = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const formData = new FormData();
    formData.append("category", category);
    formData.append("nombre", nombre);
    formData.append("marca", marca);
    formData.append("precio", precio);
    formData.append("descripcion", descripcion);
    formData.append("imageUrl", imageUrl);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No hay token disponible. Inicia sesión primero.");

      const res = await axios.post(
        "http://localhost:8000/api/agregar/producto",
        formData,
        {
          headers: {
            "token_usuario": token,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.status === 201) {
        alert("Producto agregado exitosamente");
        setCategory("Pc Gamer");
        setNombre("");
        setMarca("");
        setPrecio("");
        setDescripcion("");
        setImageUrl(null);
        setErrors({});
      }
    } catch (err) {
      console.error("Error al cargar producto", err);
      if (err.response) {
        if (err.response.status === 401) {
          navigate("/login");
        } else if (err.response.status === 403) {
          alert("No tienes permisos para realizar esta acción.");
        } else {
          alert(err.response.data.mensaje || "Error al agregar producto");
        }
      } else {
        alert(err.message);
      }
    }
  };

  return (
    <div className="contenedor">
  <h2 className="titulo-rgb">Add Product</h2>

  <form onSubmit={procesaForm}>
    
    <div className="form-group">
      <label>Categoria</label>
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="Pc Gamer">Pc Gamer</option>
        <option value="Notebook Gamer">Notebook Gamer</option>
        <option value="Consolas">Consolas</option>
        <option value="Mouse">Mouse</option>
        <option value="Teclado">Teclado</option>
        <option value="Monitor">Monitor</option>
      </select>
      {errors.category && <span className="error">{errors.category}</span>}
    </div>

    <div className="form-group">
      <label>Nombre</label>
      <input
        type="text"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />
      {errors.nombre && <span className="error">{errors.nombre}</span>}
    </div>

    <div className="form-group">
      <label>Marca</label>
      <input
        type="text"
        value={marca}
        onChange={(e) => setMarca(e.target.value)}
      />
      {errors.marca && <span className="error">{errors.marca}</span>}
    </div>

    <div className="form-group">
      <label>Precio</label>
      <input
        type="number"
        value={precio}
        onChange={(e) => setPrecio(e.target.value)}
      />
      {errors.precio && <span className="error">{errors.precio}</span>}
    </div>

    <div className="form-group">
      <label>Descripcion</label>
      <input
        type="text"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
      />
      {errors.descripcion && <span className="error">{errors.descripcion}</span>}
    </div>

    <div className="form-group">
      <label>Imagen</label>
      <input type="file" onChange={handleImageChange} />
      {errors.imageUrl && <span className="error">{errors.imageUrl}</span>}
    </div>

    <button type="submit" className="btn-rgb">
      Add Product
    </button>
  </form>
</div>

  );
};

export default FormProduct;
