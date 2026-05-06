import { useEffect, useState, useCallback } from "react";
import axios from "axios"; 
import { Link, useNavigate, useParams } from "react-router-dom";
import '../Products/Products.css';
import Modal from "../../components/Modal/Modal";
import { API_URL } from '../../config';
import { useCart } from '../../context/CartContext';

export const Products = () => {
    const { category } = useParams();
    const decodedCategory = decodeURIComponent(category || '');
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchActive, setSearchActive] = useState(false); 
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [currentProductID, setCurrentProduct] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [sortBy, setSortBy] = useState('relevance');
    const [priceFilter, setPriceFilter] = useState('all');
    const { addToCart } = useCart();

    // 🔥 Función central para traer productos (PÚBLICO)
    const getProducts = useCallback(async () => {
        try {
            let url = `${API_URL}/api/products/public`;
            if (decodedCategory) {
                url += `?category=${decodedCategory}`;
            }
            const res = await axios.get(url);
            setProducts(res.data);
            setFilteredProducts(res.data);
        } catch (err) {
            console.error(err);
        }
    }, [decodedCategory]);

    // 🔥 Se ejecuta al montar y cuando cambia categoría
    useEffect(() => {
        const roleFromStorage = localStorage.getItem('rol');
        setUserRole(roleFromStorage);

        if (!searchActive) {
            getProducts();
        }
    }, [decodedCategory, searchActive, getProducts]);

    // 🔥 Filtrar y ordenar productos
    useEffect(() => {
        let result = [...products];

        // Filtro por precio
        if (priceFilter === 'low') {
            result = result.filter(p => Number(p.precio) < 500000);
        } else if (priceFilter === 'mid') {
            result = result.filter(p => Number(p.precio) >= 500000 && Number(p.precio) < 1500000);
        } else if (priceFilter === 'high') {
            result = result.filter(p => Number(p.precio) >= 1500000);
        }

        // Ordenamiento
        if (sortBy === 'price-asc') {
            result.sort((a, b) => Number(a.precio) - Number(b.precio));
        } else if (sortBy === 'price-desc') {
            result.sort((a, b) => Number(b.precio) - Number(a.precio));
        } else if (sortBy === 'name') {
            result.sort((a, b) => a.nombre.localeCompare(b.nombre));
        }

        setFilteredProducts(result);
    }, [products, priceFilter, sortBy]);

    // 🔥 Delete profesional con refresh automático
    const deleteProduct = async (productID) => {
        const token = localStorage.getItem("token");
        console.log("🟡 [DELETE] Token:", token ? "EXISTS" : "NULL");
        console.log("🟡 [DELETE] ProductID:", productID);
        
        if (!token) {
            console.error("🔴 [DELETE] No hay token!");
            alert("No hay sesión activa. Por favor inicia sesión.");
            return;
        }

        try {
            console.log("🟡 [DELETE] Enviando solicitud...");
            const res = await axios.delete(
                `${API_URL}/api/remover/product/${productID}`,
                {
                    headers: { 
                        token_usuario: token,
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log("✅ [DELETE] Respuesta:", res.data);
            getProducts();
        } catch (error) {
            console.error('🔴 [DELETE] Error completo:', error);
            console.error('🔴 [DELETE] Response:', error.response);
            if (error.response) {
                console.error('🔴 [DELETE] Status:', error.response.status);
                console.error('🔴 [DELETE] Data:', error.response.data);
                alert(`Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
            } else if (error.request) {
                alert("No se recibió respuesta del servidor");
            } else {
                alert("Error de configuración: " + error.message);
            }
            if (error.response && error.response.status === 401) {
                navigate('/login');
            }
        }
    };

    const handleDeleteClick = (productID) => {
        setCurrentProduct(productID);
        setShowModal(true);
    };

    const handleConfirmDelete = () => {
        deleteProduct(currentProductID);
        setShowModal(false);
        setCurrentProduct(null);
    };

    return (
        <div className="products-page">
            {/* BREADCRUMBS */}
            <div className="breadcrumbs">
                <Link to="/">Inicio</Link> <span className="separator">/</span> 
                <span>{decodedCategory || 'Todos los productos'}</span>
            </div>

            <div className="products-layout">
                {/* FILTERS SIDEBAR */}
                <aside className="filters-sidebar">
                    <h3>Filtrar por precio</h3>
                    <select 
                        value={priceFilter} 
                        onChange={(e) => setPriceFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">Todos los precios</option>
                        <option value="low">Menos de 500.000 Gs.</option>
                        <option value="mid">500.000 - 1.500.000 Gs.</option>
                        <option value="high">Más de 1.500.000 Gs.</option>
                    </select>

                    <h3>Ordenar por</h3>
                    <select 
                        value={sortBy} 
                        onChange={(e) => setSortBy(e.target.value)}
                        className="filter-select"
                    >
                        <option value="relevance">Relevancia</option>
                        <option value="price-asc">Precio: Menor a Mayor</option>
                        <option value="price-desc">Precio: Mayor a Menor</option>
                        <option value="name">Nombre A-Z</option>
                    </select>

                    <div className="active-filters">
                        <p>{filteredProducts.length} producto(s) encontrado(s)</p>
                    </div>
                </aside>

                {/* PRODUCTS GRID */}
                <div className="products-content">
                    {filteredProducts.length === 0 ? (
                        <div className="no-products">
                            <p>No hay productos en esta categoría</p>
                        </div>
                    ) : (
                        <div className="products-grid">
                            {filteredProducts.map((producto) => (
                                <div key={producto._id} className="product-card">
                                    <Link to={`/product/${producto._id}`} className="product-link">
                                        <div className="product-image-container">
                                            <img 
                                                src={(producto.images && producto.images[0]) || producto.imageUrl || "/img/placeholder.png"} 
                                                alt={producto.nombre}
                                                className="product-image"
                                            />
                                            {producto.isOffer && <span className="badge offer">OFERTA</span>}
                                            {producto.isNew && <span className="badge new">NUEVO</span>}
                                            {producto.images && producto.images.length > 1 && (
                                                <span className="image-count">+{producto.images.length - 1}</span>
                                            )}
                                        </div>
                                        <div className="product-info">
                                            <h3>{producto.nombre}</h3>
                                            <p className="product-brand">{producto.marca}</p>
                                            <p className="product-price">
                                                {Number(producto.precio).toLocaleString("es-PY")} Gs.
                                            </p>
                                            <p className="stock">Stock disponible: {producto.stock || 10}</p>
                                        </div>
                                    </Link>

                                    <div className="product-actions">
                                        <button 
                                            className="add-to-cart-btn"
                                            onClick={() => addToCart(producto)}
                                        >
                                            Agregar al carrito
                                        </button>

                                        {userRole === "admin" && (
                                            <>
                                                <button
                                                    className="btn_delete"
                                                    onClick={() => handleDeleteClick(producto._id)}
                                                >
                                                    Eliminar
                                                </button>

                                                <Link to={`/actualizar/product/${producto._id}`}>
                                                    <button className="btn-update">Actualizar</button>
                                                </Link>
                                            </>
                                        )}

                                        <Link to="/create-payment-intent">
                                            <button className="btn-buy">Comprar ahora</button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Modal
                showModal={showModal}
                setShowModal={setShowModal}
                handleConfirmDelete={handleConfirmDelete}
            />
        </div>
    );
};

export default Products;
