import { useEffect, useState, useCallback } from "react";
import axios from "axios"; 
import { Link, useNavigate, useParams } from "react-router-dom";
import SearchBar from "../../components/SearchBar/SearchBar";
import CustomNavigate from "../CustomNavigate/CustomNavigate";
import '../Products/Products.css';
import Modal from "../../components/Modal/Modal";
import { useLocation } from "react-router-dom";
import { API_URL} from '../../config';

export const Products = () => {
    const { category } = useParams();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchActive, setSearchActive] = useState(false); 
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [currentProductID, setCurrentProduct] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const location = useLocation();
    const [sortBy, setSortBy] = useState('relevance');
    const [priceFilter, setPriceFilter] = useState('all');

    // 🔥 Función central para traer productos
    const getProducts = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(
                `${API_URL}/api/products?category=${category}`,
                token ? { headers: { token_usuario: token } } : {}
            );
            setProducts(res.data);
            setFilteredProducts(res.data);
        } catch (err) {
            console.error(err);
            if (err.response && err.response.status === 401) {
                navigate('/login');
            }
        }
    }, [category, navigate]);

    // 🔥 Se ejecuta al montar y cuando cambia categoría
    useEffect(() => {
        const roleFromStorage = localStorage.getItem('rol');
        setUserRole(roleFromStorage);

        if (!searchActive) {
            getProducts();
        }
        if (location.state?.success) {
            alert(location.state.success);
        }
    }, [category, searchActive, location.state, getProducts]);

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
        try {
            await axios.delete(
                `${API_URL}/api/remover/product/${productID}`,
                {
                    headers: { token_usuario: localStorage.getItem("token") }
                }
            );
            getProducts(); // 🔥 actualiza automáticamente
        } catch (error) {
            console.error('Error al eliminar producto', error);
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
    };

    return (
        <div className="products-page">
            {/* BREADCRUMBS */}
            <div className="breadcrumbs">
                <Link to="/">Inicio</Link> > <span>{category}</span>
            </div>

            <div className="products-layout">
                {/* SIDEBAR FILTROS */}
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

                {/* PRODUCTOS GRID */}
                <div className="products-content">
                    <SearchBar 
                        setSearchResultados={setFilteredProducts} 
                        setSearchActive={setSearchActive} 
                    />
                    <CustomNavigate />

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
                                                src={producto.imageUrl || "/img/placeholder.png"}
                                                alt={producto.nombre}
                                                className="product-image"
                                            />
                                            <button className="quick-view-btn">Vista rápida</button>
                                        </div>
                                        <div className="product-info">
                                            <h3>{producto.marca}</h3>
                                            <h4>{producto.nombre}</h4>
                                            <p className="price">
                                                {Number(producto.precio).toLocaleString("es-PY")} Gs.
                                            </p>
                                        </div>
                                    </Link>

                                    <div className="product-actions">
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
                                            <button className="btn-buy">Solicitar</button>
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
