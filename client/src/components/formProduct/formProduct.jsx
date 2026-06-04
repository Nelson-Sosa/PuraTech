import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../formProduct/formProduct.css";
import { API_URL } from '../../config';
import { removeBackground as imglyRemoveBackground } from "@imgly/background-removal";

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
  const [stock, setStock] = useState("");
  const [sku, setSku] = useState("");
  const [isOffer, setIsOffer] = useState(false);
  const [isNew, setIsNew] = useState(true);
  const [precioAnterior, setPrecioAnterior] = useState("");
  const [fechaInicioOferta, setFechaInicioOferta] = useState("");
  const [fechaFinOferta, setFechaFinOferta] = useState("");
  const [errors, setErrors] = useState({});
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [progressText, setProgressText] = useState("");
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
          `${API_URL}/api/categories/tree`,
          token ? { headers: { token_usuario: token } } : {}
        );
        
        // Flatten the tree hierarchically
        const flattenTree = (nodes, result = []) => {
          nodes.forEach(node => {
            result.push(node);
            if (node.children && node.children.length > 0) {
              flattenTree(node.children, result);
            }
          });
          return result;
        };
        
        const flattenedCategories = flattenTree(res.data);
        setCategories(flattenedCategories);
        
        if (flattenedCategories.length > 0) {
          setCategory(flattenedCategories[0].name);
        }
      } catch (error) {
        console.error("Error cargando categorías", error);
      }
    };
    fetchCategories();
  }, []);

  // Helper: decodifica un File en un Canvas limpio y devuelve un Blob PNG fresco
  const fileToFreshBlob = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas toBlob failed'));
        }, 'image/png');
        canvas.width = 0;
        canvas.height = 0;
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const processImageAI = async (source) => {
    setPreviewLoading(true);
    setIsProcessingAI(true);
    setProgressText("Preparando IA...");
    try {
      const isFile = typeof source !== 'string';
      let imageSource;
      if (isFile) {
        // Pre-decodificar archivo en Canvas limpio para evitar degradación de calidad
        const freshBlob = await fileToFreshBlob(source);
        imageSource = URL.createObjectURL(freshBlob);
      } else {
        imageSource = `https://api.allorigins.win/raw?url=${encodeURIComponent(source)}`;
      }
      const blob = await imglyRemoveBackground(imageSource, {
        progress: (key, current, total) => {
          if (key.includes("fetch")) {
            setProgressText(`Descargando IA: ${Math.round((current / total) * 100)}%`);
          } else if (key.includes("compute")) {
            setProgressText("Recortando fondo mágicamente...");
          }
        }
      });
      if (isFile) URL.revokeObjectURL(imageSource);
      
      const fileName = isFile ? source.name.replace(/\.[^/.]+$/, "") + "_transparent.png" : "transparent_image.png";
      const file = new File([blob], fileName, { type: "image/png" });
      
      setImageUrl(file);
      setImageUrlText("");
      setFilePreview(URL.createObjectURL(blob));
      setPreviewUrl("");
    } catch (err) {
      console.error("AI Error:", err);
      alert("Error procesando imagen con IA: " + err.message + (typeof source === 'string' ? ". Podría ser un bloqueo de seguridad (CORS). Intenta descargar la imagen y subirla como archivo." : ""));
      // Fallback
      if (typeof source !== 'string') {
        setImageUrl(source);
        setFilePreview(URL.createObjectURL(source));
      } else {
        setImageUrlText(source);
        setPreviewUrl(source);
      }
    } finally {
      setIsProcessingAI(false);
      setPreviewLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setImageUrl(null);
      setFilePreview(null);
      return;
    }
    setImageUrlText(""); // Si sube archivo, limpiamos el link
    setPreviewUrl("");
    
    // Run AI Background Removal
    processImageAI(file);
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setImageUrlText(url);
    setImageUrl(null); // Si pone link, limpiamos el archivo
    setFilePreview(null);
    setPreviewUrl("");
    
    if (url && url.match(/^https?:\/\/.+/)) {
      // Run AI Background Removal
      processImageAI(url);
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
    if (stock) formData.append("stock", stock);
    if (sku) formData.append("sku", sku);
    formData.append("isOffer", isOffer);
    formData.append("isNew", isNew);
    if (precioAnterior) formData.append("precioAnterior", precioAnterior);
    if (fechaInicioOferta) formData.append("fechaInicioOferta", fechaInicioOferta);
    if (fechaFinOferta) formData.append("fechaFinOferta", fechaFinOferta);
    
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
            <label className="form-label">
              Categoría
              <span className="label-hint">Seleccioná la categoría más específica posible</span>
            </label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="form-select category-select"
            >
              <optgroup label="📂 Nivel 1 - Categorías Principales" className="optgroup-level-1">
                {categories.filter(c => c.nivel === 1).map((cat) => (
                  <option key={cat._id} value={cat.name} className="option-level-1">
                    📂 {cat.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="📁 Nivel 2 - Subcategorías" className="optgroup-level-2">
                {categories.filter(c => c.nivel === 2).map((cat) => (
                  <option key={cat._id} value={cat.name} className="option-level-2">
                    📁 {cat.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="🏷️ Nivel 3 - Subcategoría Final" className="optgroup-level-3">
                {categories.filter(c => c.nivel === 3).map((cat) => (
                  <option key={cat._id} value={cat.name} className="option-level-3">
                    🏷️ {cat.name}
                  </option>
                ))}
              </optgroup>
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
            <label className="form-label">Stock (Cantidad disponible)</label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="form-input"
              placeholder="Ej: 20"
            />
            <span className="help-text">Cantidad de unidades disponibles para venta</span>
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

          <div className="divider">ESTADO Y OFERTAS</div>

          <div className="form-group checkbox-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isNew}
                onChange={(e) => setIsNew(e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
              Marcar como Novedad (Nuevo)
            </label>
          </div>

          <div className="form-group checkbox-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isOffer}
                onChange={(e) => setIsOffer(e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
              Marcar como Oferta
            </label>
          </div>

          {isOffer && (
            <div className="offer-fields" style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px dashed #cbd5e1' }}>
              <div style={{ backgroundColor: '#e0f2fe', padding: '12px', borderRadius: '6px', marginBottom: '16px', border: '1px solid #bae6fd' }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#0369a1' }}>
                  <strong>💡 Nota:</strong> El campo <strong>"Precio (Gs.)"</strong> de arriba será el precio final con descuento. Aquí abajo ingresa el precio original sin rebaja.
                </p>
              </div>
              
              <div className="form-group">
                <label className="form-label">Precio Anterior (Gs.)</label>
                <input
                  type="number"
                  value={precioAnterior}
                  onChange={(e) => setPrecioAnterior(e.target.value)}
                  className="form-input"
                  placeholder="Ej: 5000000"
                />
                <span className="help-text">El precio sin descuento para mostrar tachado</span>
              </div>
              
              <div className="form-group" style={{ display: 'flex', gap: '16px', marginBottom: 0 }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Fecha Inicio (Opcional)</label>
                  <input
                    type="datetime-local"
                    value={fechaInicioOferta}
                    onChange={(e) => setFechaInicioOferta(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Fecha Fin (Opcional)</label>
                  <input
                    type="datetime-local"
                    value={fechaFinOferta}
                    onChange={(e) => setFechaFinOferta(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="divider">DESCRIPCIÓN Y MULTIMEDIA</div>

          <div className="form-group">
            <label className="form-label" htmlFor="descripcion">Descripción del Producto</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const cursorPos = e.target.selectionStart;
                  const textBefore = descripcion.substring(0, cursorPos);
                  const textAfter = descripcion.substring(cursorPos);
                  setDescripcion(textBefore + '\n• ' + textAfter);
                  setTimeout(() => {
                    const textarea = document.getElementById('descripcion');
                    textarea.setSelectionRange(cursorPos + 3, cursorPos + 3);
                  }, 0);
                }
              }}
              onFocus={() => {
                if (!descripcion) {
                  setDescripcion('• ');
                }
              }}
              onPaste={(e) => {
                e.preventDefault();
                const pastedText = e.clipboardData.getData('text');
                const lines = pastedText.split('\n').map(line => line.trim() ? '• ' + line : '').join('\n');
                const cursorPos = e.target.selectionStart;
                const textBefore = descripcion.substring(0, cursorPos);
                const textAfter = descripcion.substring(cursorPos);
                setDescripcion(textBefore + lines + textAfter);
              }}
              className="form-textarea"
              placeholder={"Diseño ergonómico y compacto\n• Mouse inalámbrico\n• Resolución ajustable\n• Tiempo de respuesta de 1 ms"}
              rows={8}
            />
            <span className="help-text">Enter añade automáticamente • para viñetas</span>
            {descripcion && (
              <button 
                type="button" 
                className="btn-convert-bullets"
                onClick={() => {
                  const lines = descripcion.split('\n').map(line => {
                    const trimmed = line.trim();
                    if (trimmed && !trimmed.startsWith('•')) {
                      return '• ' + trimmed;
                    }
                    return line;
                  }).join('\n');
                  setDescripcion(lines);
                }}
              >
                Convertir todo a viñetas
              </button>
            )}
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
                {previewUrl && !isProcessingAI && (
                  <div className="image-preview-box">
                    <p style={{ fontSize: '12px', color: previewLoading ? '#f59e0b' : '#10b981', marginBottom: '8px' }}>
                      {previewLoading ? '⏳ Cargando vista previa original...' : '✓ Vista previa original:'}
                    </p>
                    <div className="preview-container">
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

                {/* AI Processing Status */}
                {isProcessingAI && (
                  <div className="image-preview-box" style={{ background: 'rgba(139, 92, 246, 0.05)', borderColor: '#8b5cf6' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '20px' }}>
                      <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        border: '3px solid #e2e8f0',
                        borderTop: '3px solid #8b5cf6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      <p style={{ fontSize: '14px', color: '#8b5cf6', fontWeight: 'bold' }}>
                        {progressText}
                      </p>
                      <p style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center' }}>
                        La primera vez puede tardar unos segundos mientras descarga el modelo. Las siguientes serán instantáneas.
                      </p>
                    </div>
                  </div>
                )}

                {/* Preview for processed file */}
                {filePreview && !isProcessingAI && (
                  <div className="image-preview-box" style={{ background: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'20\'><rect width=\'10\' height=\'10\' fill=\'%23e2e8f0\'/><rect x=\'10\' y=\'10\' width=\'10\' height=\'10\' fill=\'%23e2e8f0\'/><rect x=\'10\' width=\'10\' height=\'10\' fill=\'%23f8fafc\'/><rect y=\'10\' width=\'10\' height=\'10\' fill=\'%23f8fafc\'/></svg>")' }}>
                    <div style={{ background: 'rgba(255,255,255,0.8)', padding: '4px', marginBottom: '8px', display: 'inline-block', borderRadius: '4px' }}>
                      <p style={{ fontSize: '12px', color: '#10b981', fontWeight: 'bold', margin: 0 }}>
                        ✓ Fondo eliminado mágicamente
                      </p>
                    </div>
                    <div className="preview-container">
                      <img 
                        src={filePreview} 
                        alt="Vista previa sin fondo"
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '200px', 
                          objectFit: 'contain',
                          borderRadius: '8px',
                          border: '2px dashed #10b981'
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
