import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../formProduct/formProduct.css";
import { API_URL } from '../../config';

const FormProduct = () => {
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [nombre, setNombre] = useState("");
  const [marca, setMarca] = useState("");
  const [precio, setPrecio] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [imageUrlText, setImageUrlText] = useState("");
  const [additionalImages, setAdditionalImages] = useState([]);
  const [additionalImagesText, setAdditionalImagesText] = useState("");
  const [stockMinimo, setStockMinimo] = useState("5");
  const [sku, setSku] = useState("");
  const [errors, setErrors] = useState({});
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!category) newErrors.category = "Category is required";
    if (!nombre) newErrors.nombre = "Name is required";
    if (!marca) newErrors.marca = "Brand is required";
    if (!precio) newErrors.precio = "Price is required";
    if (!descripcion) newErrors.descripcion = "Description is required";
    
    // Validate that there's at least one image
    const hasMainImage = imageUrl || imageUrlText;
    const hasAdditionalImages = additionalImages.length > 0 || additionalImagesText;
    
    if (!hasMainImage && !hasAdditionalImages) {
      newErrors.image = "Se requiere al menos una imagen (archivo o link)";
    }
    return newErrors;
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${API_URL}/api/categories`,
          token ? { headers: { token_usuario: token } } : {}
        );
        setCategories(res.data);
        if (res.data.length > 0) {
          setCategory(res.data[0].name);
        }
      } catch (error) {
        console.error("Error cargando categorías", error);
      }
    };
    fetchCategories();
  }, []);

  const handleImageChange = (e) => {
    setImageUrl(e.target.files[0]);
    setImageUrlText(""); // Si sube archivo, limpiamos el link
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setImageUrlText(url);
    setImageUrl(null); // Si pone link, limpiamos el archivo
    
    // Preview logic - only preview if looks like a URL
    if (url && url.match(/^https?:\/\/.+/)) {
      setPreviewUrl(url);
      setPreviewLoading(true);
    } else {
      setPreviewUrl("");
      setPreviewLoading(false);
    }
  };

  const handlePreviewLoad = () => {
    setPreviewLoading(false);
  };

  const handleAdditionalImagesChange = (e) => {
    setAdditionalImages(Array.from(e.target.files));
  };

  const handleAdditionalImagesTextChange = (e) => {
    setAdditionalImagesText(e.target.value);
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
    formData.append("lowStockThreshold", stockMinimo || "5");
    if (sku) formData.append("sku", sku);
    
    // Main image
    if (imageUrl) {
      formData.append("imageUrl", imageUrl);
    }
    if (imageUrlText) {
      formData.append("imageUrlText", imageUrlText);
    }
    
    // Additional images
    if (additionalImages.length > 0) {
      additionalImages.forEach(file => {
        formData.append("additionalImages", file);
      });
    }
    
    if (additionalImagesText) {
      formData.append("images", additionalImagesText);
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No hay token disponible. Inicia sesión primero.");
      
      await axios.post(
        `${API_URL}/api/agregar/producto`,
        formData,
        {
          headers: {
            "token_usuario": token,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      navigate(`/category/${encodeURIComponent(category)}`);
      
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
    <div className="form-container">
      <div className="form-wrapper">
        <div className="form-header">
          <h2 className="form-title">Agregar Producto</h2>
          <p className="form-subtitle">Completá los datos para agregar un nuevo producto al catálogo</p>
        </div>

        <form onSubmit={procesaForm} className="product-form">

          {/* Información Básica */}
          <div className="form-group">
            <label className="form-label">Categoría</label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="form-select"
            >
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))
              ) : (
                <option>Cargando categorías...</option>
              )}
            </select>
            {errors.category && <span className="error-message">{errors.category}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Nombre del Producto</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="form-input"
              placeholder="Ej: PlayStation 5 Edición Digital"
            />
            {errors.nombre && <span className="error-message">{errors.nombre}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Marca</label>
            <input
              type="text"
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              className="form-input"
              placeholder="Ej: Sony, Microsoft, Nintendo"
            />
            {errors.marca && <span className="error-message">{errors.marca}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Precio (Gs.)</label>
            <input
              type="number"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              className="form-input"
              placeholder="Ej: 4500000"
            />
            {errors.precio && <span className="error-message">{errors.precio}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Stock mínimo</label>
            <input
              type="number"
              value={stockMinimo}
              onChange={(e) => setStockMinimo(e.target.value)}
              className="form-input"
              placeholder="Ej: 5"
            />
            <span className="help-text">Alerta cuando el stock baje de este número</span>
          </div>

          <div className="form-group">
            <label className="form-label">SKU (Código único)</label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="form-input"
              placeholder="Ej: PS5-DIGITAL-001"
            />
            <span className="help-text">Código único para identificar el producto</span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="descripcion">Descripción del Producto</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="form-textarea"
              placeholder={"Diseño ergonómico y compacto\n• Mouse inalámbrico con conectividad Lightspeed\n• Resolución ajustable de 100 a 44,000 DPI\n• Tiempo de respuesta de 1 ms"}
              rows={8}
            />
            <span className="help-text">Usá Enter para salto de línea. Podés usar • para viñetas.</span>
            {errors.descripcion && <span className="error-message">{errors.descripcion}</span>}
          </div>

          {/* Sección de Imágenes */}
          <div className="image-section">
            <h3 className="image-section-title">Imágenes del Producto</h3>
            
            <div className="image-options">
              {/* Imagen Principal */}
              <div className="image-option">
                <label className="image-option-label">Imagen Principal</label>
                <input 
                  type="file" 
                  name="imageUrl" 
                  onChange={handleImageChange} 
                  accept="image/*" 
                  className="form-file-input" 
                />
                <div style={{ textAlign: 'center', color: '#888', fontSize: '12px', fontWeight: 'bold', margin: '8px 0' }}>O</div>
                <input 
                  type="text" 
                  name="imageUrlText" 
                  value={imageUrlText} 
                  onChange={handleImageUrlChange} 
                  placeholder="https://ejemplo.com/imagen.jpg" 
                  className="form-input"
                />
                
                {/* Preview for URL */}
                {previewUrl && (
                  <div className="image-preview-box">
                    <p style={{ fontSize: '12px', color: previewLoading ? '#f59e0b' : '#10b981', marginBottom: '8px' }}>
                      {previewLoading ? '⏳ Cargando vista previa...' : '✓ Vista previa de la imagen:'}
                    </p>
                    <div className="preview-container">
                      {previewLoading && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8' }}>
                          <div style={{ 
                            width: '20px', 
                            height: '20px', 
                            border: '2px solid #e2e8f0',
                            borderTop: '2px solid #8b5cf6',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                          }} />
                          <span style={{ fontSize: '12px' }}>Cargando...</span>
                        </div>
                      )}
                      <img 
                        src={previewUrl} 
                        alt="Vista previa"
                        onLoad={handlePreviewLoad}
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '200px', 
                          objectFit: 'contain',
                          borderRadius: '8px',
                          border: '2px solid #10b981',
                          display: previewLoading ? 'none' : 'block'
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="divider">IMÁGENES ADICIONALES (OPCIONAL)</div>

              {/* Imágenes Adicionales */}
              <div className="image-option">
                <label className="image-option-label">Seleccionar múltiples imágenes</label>
                <input 
                  type="file" 
                  name="additionalImages" 
                  onChange={handleAdditionalImagesChange} 
                  accept="image/*" 
                  multiple 
                  className="form-file-input" 
                />
                {additionalImages.length > 0 && (
                  <div className="image-preview">
                    {additionalImages.length} imagen(es) seleccionada(s)
                  </div>
                )}
              </div>

              <div style={{ textAlign: 'center', color: '#888', fontSize: '12px', fontWeight: 'bold', margin: '8px 0' }}>O</div>

              <div className="image-option">
                <label className="image-option-label">Pegar URLs de imágenes (separadas por coma)</label>
                <input 
                  type="text" 
                  name="additionalImagesText" 
                  value={additionalImagesText} 
                  onChange={handleAdditionalImagesTextChange} 
                  placeholder="https://ejemplo.com/img1.jpg, https://ejemplo.com/img2.jpg" 
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {errors.image && <span className="error-message">{errors.image}</span>}

          <button type="submit" className="btn-submit">
            ✓ Guardar Producto
          </button>
        </form>
      </div>
    </div>
  );
};

export default FormProduct;
