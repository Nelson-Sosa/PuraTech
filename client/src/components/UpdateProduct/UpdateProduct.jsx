import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../UpdateProduct/UpdateProduct.css';
import { API_URL } from '../../config';
import { removeBackground as imglyRemoveBackground } from "@imgly/background-removal";

const UpdateProduct = () => {
    const { id } = useParams();
    const [category, setCategory] = useState('');
    const [nombre, setNombre] = useState("");
    const [marca, setMarca] = useState("");
    const [precio, setPrecio] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [isOffer, setIsOffer] = useState(false);
    const [isNew, setIsNew] = useState(true);
    const [precioAnterior, setPrecioAnterior] = useState("");
    const [fechaInicioOferta, setFechaInicioOferta] = useState("");
    const [fechaFinOferta, setFechaFinOferta] = useState("");
    const [currentImages, setCurrentImages] = useState([]);
    const [deletedImages, setDeletedImages] = useState([]);
    const [replaceImageIndex, setReplaceImageIndex] = useState(null);
    const [replaceImageFile, setReplaceImageFile] = useState(null);
    const [replaceImageUrl, setReplaceImageUrl] = useState("");
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [newImageUrlText, setNewImageUrlText] = useState("");
    const [newAdditionalImages, setNewAdditionalImages] = useState([]);
    const [newAdditionalImagesText, setNewAdditionalImagesText] = useState("");
    const [mainImageFile, setMainImageFile] = useState(null);
    const [isProcessingAI, setIsProcessingAI] = useState(false);
    const [progressText, setProgressText] = useState("");
    const [processedImageFile, setProcessedImageFile] = useState(null);
    const [processedPreviewUrl, setProcessedPreviewUrl] = useState(null);
    const [isProcessingNewImages, setIsProcessingNewImages] = useState(false);
    const [newImagesProgress, setNewImagesProgress] = useState("");
    const [newImagesPreviews, setNewImagesPreviews] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        axios.get(`${API_URL}/api/product/${id}`, token ? {
            headers: {
                token_usuario: token
            }
        } : {})
        .then(res => {
            setCategory(res.data.category);
            setNombre(res.data.nombre);
            setMarca(res.data.marca);
            setPrecio(res.data.precio);
            setDescripcion(res.data.descripcion);
            setIsOffer(res.data.isOffer || false);
            setIsNew(res.data.isNew !== undefined ? res.data.isNew : true);
            setPrecioAnterior(res.data.precioAnterior || "");
            
            // Formatear fechas para input datetime-local si existen
            if (res.data.fechaInicioOferta) {
                const start = new Date(res.data.fechaInicioOferta);
                setFechaInicioOferta(start.toISOString().slice(0, 16));
            }
            if (res.data.fechaFinOferta) {
                const end = new Date(res.data.fechaFinOferta);
                setFechaFinOferta(end.toISOString().slice(0, 16));
            }
            
            // Cargar imágenes actuales
            const images = [];
            if (res.data.imageUrl) images.push(res.data.imageUrl);
            if (res.data.images && res.data.images.length > 0) {
                res.data.images.forEach(img => {
                    if (!images.includes(img)) images.push(img);
                });
            }
            setCurrentImages(images);
            setDeletedImages([]); // Reset deleted images
        })
        .catch(err => {
            console.error("Error al cargar producto", err);
            if (err.response && err.response.status === 401) {
                navigate('/login');
            }
        });
    }, [id, navigate]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get(
                    `${API_URL}/api/categories`,
                    {
                        headers: {
                            token_usuario: localStorage.getItem("token")
                        }
                    }
                );
                setCategories(res.data);
            } catch (error) {
                console.error("Error cargando categorías", error);
            }
        };

        fetchCategories();
    }, []);

    const handleNewImageChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        
        console.log(`🤖 [AI] Procesando ${files.length} archivo(s)...`);
        setIsProcessingNewImages(true);
        setNewImagesProgress(`Procesando 0/${files.length} imágenes...`);
        
        const processedFiles = [];
        const previews = [];
        
        for (let i = 0; i < files.length; i++) {
            setNewImagesProgress(`🤖 Eliminando fondo ${i + 1}/${files.length}...`);
            try {
                console.log(`🤖 [AI] Procesando archivo ${i + 1}: ${files[i].name}`);
                
                // Pasar el archivo directamente a la IA (evita re-codificación Canvas)
                const resultBlob = await imglyRemoveBackground(files[i], {
                    model: "large",
                    output: { format: "image/png", quality: 1.0 },
                    progress: (key, current, total) => {
                        if (key.includes("compute")) {
                            setNewImagesProgress(`🤖 Eliminando fondo ${i + 1}/${files.length}...`);
                        }
                    }
                });
                
                // 3. Esperar a que la GPU libere recursos antes de la siguiente imagen
                await new Promise(resolve => setTimeout(resolve, 500));
                
                console.log(`✅ [AI] Archivo ${i + 1} procesado, blob size: ${resultBlob.size}`);
                const fileName = files[i].name.replace(/\.[^/.]+$/, "") + "_transparent.png";
                const file = new File([resultBlob], fileName, { type: "image/png" });
                processedFiles.push(file);
                previews.push(URL.createObjectURL(resultBlob));
            } catch (err) {
                console.error(`❌ [AI] Error en archivo ${i + 1}:`, err);
                processedFiles.push(files[i]);
                previews.push(URL.createObjectURL(files[i]));
            }
        }
        
        setNewAdditionalImages(prev => [...prev, ...processedFiles]);
        setNewImagesPreviews(prev => [...prev, ...previews]);
        setNewImagesProgress(`✅ ${processedFiles.length} imagen(es) procesada(s)`);
        setIsProcessingNewImages(false);
        console.log(`✅ [AI] Todas las imágenes procesadas:`, processedFiles.length);
    };

    const handleNewImageUrlChange = (e) => {
        setNewImageUrlText(e.target.value);
    };

    const handleNewAdditionalImagesTextChange = async (e) => {
        const text = e.target.value;
        setNewAdditionalImagesText(text);
        
        // Procesar URLs con IA cuando se pegan (separadas por coma)
        const urls = text.split(',').map(u => u.trim()).filter(u => u.match(/^https?:\/\/.+/));
        if (urls.length === 0) {
            setNewImagesPreviews([]);
            return;
        }
        
        console.log(`🤖 [AI] Procesando ${urls.length} URL(s)...`);
        setIsProcessingNewImages(true);
        setNewImagesProgress(`🤖 Procesando ${urls.length} URL(s)...`);
        setNewImagesProgress(`🤖 Procesando ${urls.length} URL(s)...`);
        
        const processedFiles = [];
        const previews = [];
        const processedUrls = [];
        
        for (let i = 0; i < urls.length; i++) {
            setNewImagesProgress(`🤖 Eliminando fondo URL ${i + 1}/${urls.length}...`);
            try {
                const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(urls[i])}`;
                const blob = await imglyRemoveBackground(proxyUrl, {
                    model: "large",
                    output: { format: "image/webp", quality: 1.0 },
                    progress: (key) => {
                        if (key.includes("compute")) {
                            setNewImagesProgress(`🤖 Eliminando fondo URL ${i + 1}/${urls.length}...`);
                        }
                    }
                });
                
                await new Promise(resolve => setTimeout(resolve, 300));
                
                console.log(`✅ [AI] URL ${i + 1} procesada, blob size: ${blob.size}`);
                const file = new File([blob], `url_image_${i + 1}_transparent.webp`, { type: "image/webp" });
                processedFiles.push(file);
                previews.push(URL.createObjectURL(blob));
            } catch (err) {
                console.error(`❌ [AI] Error en URL ${i + 1}:`, err);
                // Fallback: dejar la URL original sin procesar
                processedUrls.push(urls[i]);
                previews.push(urls[i]);
            }
        }
        
        // Si hay archivos procesados, agregarlos como archivos
        if (processedFiles.length > 0) {
            setNewAdditionalImages(prev => [...prev, ...processedFiles]);
            // Limpiar las URLs procesadas exitosamente del texto
            setNewAdditionalImagesText(processedUrls.join(', '));
        }
        
        setNewImagesPreviews(prev => [...prev, ...previews]);
        setNewImagesProgress(`✅ ${previews.length} imagen(es) procesada(s)`);
        setIsProcessingNewImages(false);
    };

    const handleDeleteImage = (imageToDelete) => {
        setCurrentImages(prev => prev.filter(img => img !== imageToDelete));
        setDeletedImages(prev => [...prev, imageToDelete]);
    };

    const handleReplaceImage = (index) => {
        setReplaceImageIndex(index);
        setReplaceImageFile(null);
        setReplaceImageUrl("");
        setProcessedImageFile(null);
        setProcessedPreviewUrl(null);
        setIsProcessingAI(false);
    };

    const processImageAI = async (source) => {
        setIsProcessingAI(true);
        setProgressText("Preparando IA...");
        setProcessedImageFile(null);
        try {
            const isFile = typeof source !== 'string';
            const imageSource = isFile ? source : `https://api.allorigins.win/raw?url=${encodeURIComponent(source)}`;
            const blob = await imglyRemoveBackground(imageSource, {
                model: "large",
                output: { format: "image/png", quality: 1.0 },
                progress: (key, current, total) => {
                    console.log(`AI Progress - ${key}: ${current}/${total}`);
                    if (key.includes("fetch")) {
                        setProgressText(`Descargando IA: ${Math.round((current / total) * 100)}%`);
                    } else if (key.includes("compute")) {
                        setProgressText("Recortando fondo mágicamente...");
                    }
                }
            });
            console.log("AI Success: background removed, blob size:", blob.size);

            const fileName = typeof source === 'string' ? "transparent_image.png" : source.name.replace(/\.[^/.]+$/, "") + "_transparent.png";
            const file = new File([blob], fileName, { type: "image/png" });

            setProcessedImageFile(file);
            setProcessedPreviewUrl(URL.createObjectURL(blob));
            setProgressText("✅ ¡Fondo eliminado correctamente!");
        } catch (err) {
            console.error("AI Error - nombre:", err.name, "mensaje:", err.message, "stack:", err.stack);
            setProgressText("Error al procesar con IA, se usará la imagen original");
            // Fallback: processedImageFile queda null, confirmReplaceImage usará replaceImageFile
        } finally {
            setIsProcessingAI(false);
        }
    };

    const handleReplaceImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setReplaceImageFile(file);
        setReplaceImageUrl("");
        processImageAI(file);
    };

    const handleReplaceImageUrlChange = (e) => {
        const url = e.target.value;
        setReplaceImageUrl(url);
        setReplaceImageFile(null);
        if (url && url.match(/^https?:\/\/.+/)) {
            processImageAI(url);
        }
    };

    const confirmReplaceImage = () => {
        if (replaceImageIndex === null) return;
        
        const newImages = [...currentImages];
        const oldImage = newImages[replaceImageIndex];
        const fileToUse = processedImageFile || replaceImageFile;
        
// Si es la imagen principal (índice 0), usar req.file o imageUrlText
        if (replaceImageIndex === 0) {
            setDeletedImages(prev => [...prev, oldImage]);
            
            if (fileToUse) {
                setMainImageFile(fileToUse);
                newImages[replaceImageIndex] = URL.createObjectURL(fileToUse);
            } else if (replaceImageUrl) {
                setNewImageUrlText(replaceImageUrl);
                newImages[replaceImageIndex] = replaceImageUrl;
            }
        } else {
            // Imágenes adicionales (índice > 0)
            if (fileToUse) {
                setDeletedImages(prev => [...prev, oldImage]);
                setNewAdditionalImages(prev => [...prev, fileToUse]);
                newImages[replaceImageIndex] = URL.createObjectURL(fileToUse);
            } else if (replaceImageUrl) {
                setDeletedImages(prev => [...prev, oldImage]);
                newImages[replaceImageIndex] = replaceImageUrl;
                setNewAdditionalImagesText(prev => prev ? prev + ',' + replaceImageUrl : replaceImageUrl);
            }
        }
        
        setCurrentImages(newImages);
        setReplaceImageIndex(null);
        setReplaceImageFile(null);
        setReplaceImageUrl("");
        setProcessedImageFile(null);
    };

    const actualizarProducto = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");
        console.log("🟡 [UPDATE] Token:", token ? "EXISTS" : "NULL");
        console.log("🟡 [UPDATE] Product ID:", id);

        if (!token) {
            console.error("🔴 [UPDATE] No hay token!");
            alert("No hay sesión activa. Por favor inicia sesión.");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("category", category);
            formData.append("nombre", nombre);
            formData.append("marca", marca);
            formData.append("precio", precio);
            formData.append("descripcion", descripcion);
            formData.append("isOffer", isOffer);
            formData.append("isNew", isNew);
            if (precioAnterior) formData.append("precioAnterior", precioAnterior);
            if (fechaInicioOferta) formData.append("fechaInicioOferta", fechaInicioOferta);
            if (fechaFinOferta) formData.append("fechaFinOferta", fechaFinOferta);
            
            console.log("🟡 [UPDATE] Datos a enviar:");
            console.log("  - category:", category);
            console.log("  - nombre:", nombre);
            console.log("  - marca:", marca);
            console.log("  - precio:", precio);
            console.log("  - descripcion:", descripcion);
            
            // Enviar imágenes eliminadas
            if (deletedImages.length > 0) {
                formData.append("deletedImages", JSON.stringify(deletedImages));
                console.log("🟡 [UPDATE] deletedImages:", deletedImages);
            }
            
            // Agregar nuevas imágenes
            if (newAdditionalImages.length > 0) {
                newAdditionalImages.forEach(file => {
                    formData.append("additionalImages", file);
                });
            }
            
            if (newAdditionalImagesText) {
                formData.append("images", newAdditionalImagesText);
                console.log("🟡 [UPDATE] images text:", newAdditionalImagesText);
            }
            
            // Nueva imagen principal por URL
            if (newImageUrlText) {
                formData.append("imageUrlText", newImageUrlText);
                console.log("🟡 [UPDATE] imageUrlText:", newImageUrlText);
            }
            
            // Nueva imagen principal por archivo (para req.file)
            if (mainImageFile) {
                formData.append("imageUrl", mainImageFile);
                console.log("🟡 [UPDATE] mainImageFile:", mainImageFile.name);
            }

            console.log("🟡 [UPDATE] Enviando solicitud...");
            const res = await axios.put(
                `${API_URL}/api/actualizar/product/${id}`,
                formData,
                {
                    headers: {
                        token_usuario: token,
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            console.log("✅ [UPDATE] Respuesta del servidor:", res.data);
            console.log("✅ [UPDATE] Nombre actualizado:", res.data.nombre);
            console.log("✅ [UPDATE] Precio actualizado:", res.data.precio);
            navigate(`/category/${encodeURIComponent(category)}`);

        } catch (err) {
            console.error("🔴 [UPDATE] Error completo:", err);
            console.error("🔴 [UPDATE] Response:", err.response);
            if (err.response) {
                alert(`Error: ${err.response.status} - ${JSON.stringify(err.response.data)}`);
            }
            if (err.response && err.response.status === 401) {
                navigate('/login');
            }
        }
    };

    return (
        <>
            <div className="form-container">
                <div className="form-wrapper">
                    <div className="form-header">
                        <h2 className="form-title">Actualizar Producto</h2>
                        <p className="form-subtitle">Editá los datos del producto y agregá nuevas imágenes</p>
                    </div>

                    <form onSubmit={actualizarProducto} className="product-form">

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
                        </div>

                        <div className="form-group">
                            <label className="form-label">Nombre del Producto</label>
                            <input
                                type="text"
                                name="nombre"
                                onChange={(e) => setNombre(e.target.value)}
                                value={nombre}
                                className="form-input"
                                placeholder="Ej: PlayStation 5 Edición Digital"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Marca</label>
                            <input
                                type="text"
                                name="marca"
                                onChange={(e) => setMarca(e.target.value)}
                                value={marca}
                                className="form-input"
                                placeholder="Ej: Sony, Microsoft, Nintendo"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Precio (Gs.)</label>
                            <input
                                type="number"
                                name="precio"
                                onChange={(e) => setPrecio(e.target.value)}
                                value={precio}
                                className="form-input"
                                placeholder="Ej: 4500000"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="descripcion">Descripción del Producto</label>
                            <textarea
                                id="descripcion"
                                name="descripcion"
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                className="form-textarea"
                                placeholder="Ej: Tipo de pantalla: VA LCD de 23.8&quot;. Resolución: Full HD..."
                                rows={6}
                            />
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

                        <div className="divider">MULTIMEDIA</div>

                        {/* Imágenes Actuales */}
                        <div className="image-section">
                            <h3 className="image-section-title">Imágenes Actuales</h3>
                            {currentImages.length > 0 ? (
                                <div className="thumbnail-grid" style={{ marginBottom: '20px' }}>
                                    {currentImages.map((img, index) => (
                                        <div key={index} className="thumbnail active">
                                            <img src={img} alt={`Imagen ${index + 1}`} />
                                            <div className="image-actions">
                                                <button 
                                                    type="button"
                                                    className="image-action-btn replace"
                                                    onClick={() => handleReplaceImage(index)}
                                                    title="Reemplazar imagen"
                                                >
                                                    🔄
                                                </button>
                                                <button 
                                                    type="button"
                                                    className="image-action-btn delete"
                                                    onClick={() => handleDeleteImage(img)}
                                                    title="Eliminar imagen"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    No hay imágenes cargadas
                                </p>
                            )}
                            
                            {/* Replace Image Section */}
                            {replaceImageIndex !== null && (
                                <div className="image-section" style={{ marginTop: '16px' }}>
                                    <h4 style={{ fontSize: '0.95rem', marginBottom: '12px' }}>
                                        Reemplazando imagen {replaceImageIndex + 1}
                                    </h4>
                                    {isProcessingAI && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '8px', marginBottom: '12px' }}>
                                            <div style={{ width: '20px', height: '20px', border: '3px solid #e2e8f0', borderTop: '3px solid #8b5cf6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                            <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>{progressText}</span>
                                        </div>
                                    )}
                                    {/* Preview de imagen procesada */}
                                    {processedPreviewUrl && !isProcessingAI && (
                                        <div style={{ marginBottom: '12px', padding: '12px', background: 'repeating-conic-gradient(#e2e8f0 0% 25%, #f8fafc 0% 50%) 50% / 16px 16px', borderRadius: '8px', border: '2px dashed #10b981' }}>
                                            <p style={{ fontSize: '12px', color: '#10b981', fontWeight: 'bold', marginBottom: '8px', background: 'rgba(255,255,255,0.85)', display: 'inline-block', padding: '2px 8px', borderRadius: '4px' }}>✅ Fondo eliminado</p>
                                            <img src={processedPreviewUrl} alt="Preview sin fondo" style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'contain', display: 'block' }} />
                                        </div>
                                    )}
                                    <div className="image-options">
                                        <div className="image-option">
                                            <label className="image-option-label">Seleccionar nuevo archivo</label>
                                            <input
                                                type="file"
                                                onChange={handleReplaceImageChange}
                                                accept="image/*"
                                                className="form-file-input"
                                                disabled={isProcessingAI}
                                            />
                                        </div>
                                        <div className="divider">O</div>
                                        <div className="image-option">
                                            <label className="image-option-label">Pegar nueva URL</label>
                                            <input
                                                type="text"
                                                value={replaceImageUrl}
                                                onChange={handleReplaceImageUrlChange}
                                                placeholder="https://ejemplo.com/nueva-imagen.jpg"
                                                className="form-input"
                                                disabled={isProcessingAI}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            className="btn-submit"
                                            style={{ marginTop: '12px', opacity: isProcessingAI ? 0.5 : 1 }}
                                            onClick={confirmReplaceImage}
                                            disabled={isProcessingAI}
                                        >
                                            {isProcessingAI ? '⏳ Procesando...' : '✓ Confirmar Reemplazo'}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn-view-categories"
                                            style={{ marginTop: '8px' }}
                                            onClick={() => {
                                                setReplaceImageIndex(null);
                                                setReplaceImageFile(null);
                                                setReplaceImageUrl("");
                                                setProcessedImageFile(null);
                                                setProcessedPreviewUrl(null);
                                                setIsProcessingAI(false);
                                            }}
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Agregar Nuevas Imágenes */}
                        <div className="image-section">
                            <h3 className="image-section-title">Agregar Nuevas Imágenes</h3>

                            <div className="image-options">
                                <div className="image-option">
                                    <label className="image-option-label">Seleccionar múltiples imágenes</label>
                                    <input
                                        type="file"
                                        name="additionalImages"
                                        onChange={handleNewImageChange}
                                        accept="image/*"
                                        multiple
                                        className="form-file-input"
                                        disabled={isProcessingNewImages}
                                    />
                                </div>

                                <div className="divider">O</div>

                                <div className="image-option">
                                    <label className="image-option-label">Pegar URLs de imágenes (separadas por coma)</label>
                                    <input
                                        type="text"
                                        name="newImagesText"
                                        value={newAdditionalImagesText}
                                        onChange={handleNewAdditionalImagesTextChange}
                                        placeholder="https://ejemplo.com/img1.jpg, https://ejemplo.com/img2.jpg"
                                        className="form-input"
                                        disabled={isProcessingNewImages}
                                    />
                                </div>
                            </div>

                            {/* AI Processing Status - shown for both files and URLs */}
                            {isProcessingNewImages && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px', marginTop: '16px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                                    <div style={{ width: '24px', height: '24px', border: '3px solid #e2e8f0', borderTop: '3px solid #8b5cf6', borderRadius: '50%', animation: 'spin 1s linear infinite', flexShrink: 0 }} />
                                    <div>
                                        <span style={{ color: '#8b5cf6', fontSize: '0.9rem', fontWeight: 'bold', display: 'block' }}>{newImagesProgress}</span>
                                        <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>La primera vez puede tardar unos segundos</span>
                                    </div>
                                </div>
                            )}

                            {/* Processed Images Preview */}
                            {newAdditionalImages.length > 0 && !isProcessingNewImages && (
                                <div style={{ marginTop: '16px' }}>
                                    <p style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 'bold', marginBottom: '8px' }}>
                                        ✅ {newAdditionalImages.length} imagen(es) procesada(s) sin fondo
                                    </p>
                                </div>
                            )}
                            {newImagesPreviews.length > 0 && !isProcessingNewImages && (
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                                    {newImagesPreviews.map((prev, idx) => (
                                        <div key={idx} style={{ background: 'repeating-conic-gradient(#e2e8f0 0% 25%, #f8fafc 0% 50%) 50% / 12px 12px', borderRadius: '8px', border: '2px dashed #10b981', padding: '4px' }}>
                                            <img src={prev} alt={`Preview ${idx + 1}`} style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button type="submit" className="btn-submit">
                            ✓ Actualizar Producto
                        </button>
                    </form>
                </div>
            </div>
        </>
    )
}

export default UpdateProduct;