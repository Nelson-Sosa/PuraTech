import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../UpdateProduct/UpdateProduct.css';
import { API_URL } from '../../config';

const UpdateProduct = () => {
    const { id } = useParams();
    const [category, setCategory] = useState('');
    const [nombre, setNombre] = useState("");
    const [marca, setMarca] = useState("");
    const [precio, setPrecio] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [currentImages, setCurrentImages] = useState([]);
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [newImageUrlText, setNewImageUrlText] = useState("");
    const [newAdditionalImages, setNewAdditionalImages] = useState([]);
    const [newAdditionalImagesText, setNewAdditionalImagesText] = useState("");

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
            
            // Cargar imágenes actuales
            const images = [];
            if (res.data.imageUrl) images.push(res.data.imageUrl);
            if (res.data.images && res.data.images.length > 0) {
                res.data.images.forEach(img => {
                    if (!images.includes(img)) images.push(img);
                });
            }
            setCurrentImages(images);
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

    const handleNewImageChange = (e) => {
        setNewAdditionalImages(Array.from(e.target.files));
    };

    const handleNewImageUrlChange = (e) => {
        setNewImageUrlText(e.target.value);
    };

    const handleNewAdditionalImagesTextChange = (e) => {
        setNewAdditionalImagesText(e.target.value);
    };

    const actualizarProducto = async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData();
            formData.append("category", category);
            formData.append("nombre", nombre);
            formData.append("marca", marca);
            formData.append("precio", precio);
            formData.append("descripcion", descripcion);
            
            // Agregar nuevas imágenes
            if (newAdditionalImages.length > 0) {
                newAdditionalImages.forEach(file => {
                    formData.append("additionalImages", file);
                });
            }
            
            if (newAdditionalImagesText) {
                formData.append("images", newAdditionalImagesText);
            }

            await axios.put(
                `${API_URL}/api/actualizar/product/${id}`,
                formData,
                {
                    headers: {
                        token_usuario: localStorage.getItem("token"),
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            // 🔥 Redirige correctamente a la categoría
            navigate(`/category/${encodeURIComponent(category)}`);

        } catch (err) {
            console.error("Error al actualizar producto", err);
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

                        {/* Imágenes Actuales */}
                        <div className="image-section">
                            <h3 className="image-section-title">Imágenes Actuales</h3>
                            {currentImages.length > 0 ? (
                                <div className="thumbnail-grid" style={{ marginBottom: '20px' }}>
                                    {currentImages.map((img, index) => (
                                        <div key={index} className="thumbnail active">
                                            <img src={img} alt={`Imagen ${index + 1}`} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    No hay imágenes cargadas
                                </p>
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
                                    />
                                    {newAdditionalImages.length > 0 && (
                                        <div className="image-preview">
                                            {newAdditionalImages.length} imagen(es) seleccionada(s)
                                        </div>
                                    )}
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
                                    />
                                </div>
                            </div>
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