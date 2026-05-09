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
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [availableBrands, setAvailableBrands] = useState([]);
    const { addToCart } = useCart();

    // 🔥 Función central para traer productos (PÚBLICO)
    const getProducts = useCallback(async () => {
        try {
            let url = `${API_URL}/api/products/public`;
            if (decodedCategory) {
                // Si la categoría no coincide exactamente, usar búsqueda global
                url = `${API_URL}/api/search-products?category=${encodeURIComponent(decodedCategory)}`;
            }
            const res = await axios.get(url);
            setProducts(res.data);
            setFilteredProducts(res.data);
        } catch (err) {
            console.error(err);
            // Fallback: buscar todos los productos
            try {
                const fallback = await axios.get(`${API_URL}/api/products/public`);
                const filtered = fallback.data.filter(p => 
                    p.nombre?.toLowerCase().includes(decodedCategory.toLowerCase()) ||
                    p.marca?.toLowerCase().includes(decodedCategory.toLowerCase()) ||
                    p.category?.toLowerCase().includes(decodedCategory.toLowerCase())
                );
                setProducts(filtered);
                setFilteredProducts(filtered);
            } catch (fallbackErr) {
                console.error(fallbackErr);
            }
        }
    }, [decodedCategory]);

    // 🔥 Se ejecuta al montar y cuando cambia categoría
    useEffect(() => {
        const roleFromStorage = localStorage.getItem('rol');
        console.log("🔵 [USE EFFECT] Role from storage:", roleFromStorage);
        console.log("🔵 [USE EFFECT] Token from storage:", localStorage.getItem("token") ? "EXISTS" : "NULL");
        setUserRole(roleFromStorage);

        if (!searchActive) {
            getProducts();
        }
    }, [decodedCategory, searchActive, getProducts]);

    // 🔥 Extraer marcas únicas de los productos
    useEffect(() => {
        if (products.length > 0) {
            const brands = [...new Set(products.map(p => p.marca).filter(Boolean))].sort();
            setAvailableBrands(brands);
        }
    }, [products]);

    // 🔥 Filtrar y ordenar productos
    useEffect(() => {
        let result = [...products];

        // Filtro por precio (Min - Max)
        if (minPrice !== '') {
            result = result.filter(p => Number(p.precio) >= Number(minPrice));
        }
        if (maxPrice !== '') {
            result = result.filter(p => Number(p.precio) <= Number(maxPrice));
        }

        // Filtro por marca
        if (selectedBrands.length > 0) {
            result = result.filter(p => selectedBrands.includes(p.marca));
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
    }, [products, minPrice, maxPrice, sortBy, selectedBrands]);

    const toggleBrand = (brand) => {
        setSelectedBrands(prev => 
            prev.includes(brand) 
                ? prev.filter(b => b !== brand) 
                : [...prev, brand]
        );
    };

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
        console.log("🔵 [handleDeleteClick] Called with ID:", productID);
        console.log("🔵 [handleDeleteClick] currentProductID state before:", currentProductID);
        setCurrentProduct(productID);
        console.log("🔵 [handleDeleteClick] currentProductID state after:", productID);
        setShowModal(true);
        console.log("🔵 [handleDeleteClick] Modal should show now");
    };

    const handleConfirmDelete = () => {
        console.log("🔵 [handleConfirmDelete] currentProductID:", currentProductID);
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
                    <h3>Rango de precio (Gs.)</h3>
                    <div className="price-range-filter">
                        <div className="price-input-group">
                            <input 
                                type="number" 
                                placeholder="Min" 
                                value={minPrice} 
                                onChange={(e) => setMinPrice(e.target.value)}
                                className="price-input"
                            />
                            <span className="price-dash">-</span>
                            <input 
                                type="number" 
                                placeholder="Max" 
                                value={maxPrice} 
                                onChange={(e) => setMaxPrice(e.target.value)}
                                className="price-input"
                            />
                        </div>
                    </div>

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

                    {availableBrands.length > 0 && (
                        <>
                            <h3>Filtrar por marca</h3>
                            <div className="brand-filters">
                                {availableBrands.map(brand => (
                                    <label key={brand} className="brand-checkbox-label">
                                        <input 
                                            type="checkbox" 
                                            checked={selectedBrands.includes(brand)}
                                            onChange={() => toggleBrand(brand)}
                                        />
                                        <span>{brand}</span>
                                    </label>
                                ))}
                            </div>
                        </>
                    )}

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
                                        
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Modal
                show={showModal}
                onClose={() => setShowModal(false)}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
};

export default Products;
