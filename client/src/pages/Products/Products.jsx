import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import '../Products/Products.css';
import Modal from "../../components/Modal/Modal";
import { API_URL } from '../../config';
import { useCart } from '../../context/CartContext';

// ── Macro-Categoría Periféricos ──
const PERIPHERAL_MAPPING = {
    'perifericos': ['mouse', 'teclado', 'auricular', 'headset', 'mousepad', 'alfombrilla', 'parlante', 'periféricos'],
    'periféricos': ['mouse', 'teclado', 'auricular', 'headset', 'mousepad', 'alfombrilla', 'parlante', 'periféricos']
};

const SUB_CATEGORY_ICONS = [
    { id: 'all', label: 'Todo', icon: '🎮', categories: [] },
    { id: 'mouse', label: 'Mouses', icon: '🖱️', categories: ['mouse'] },
    { id: 'teclado', label: 'Teclados', icon: '⌨️', categories: ['teclado'] },
    { id: 'auricular', label: 'Audio', icon: '🎧', categories: ['auricular', 'headset', 'parlante'] },
    { id: 'mousepad', label: 'Pads', icon: '🟦', categories: ['mousepad', 'alfombrilla'] },
];

export const Products = () => {
    const { category } = useParams();
    const decodedCategory = decodeURIComponent(category || '').toLowerCase();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [activeSubFilter, setActiveSubFilter] = useState('all');
    const [searchActive, setSearchActive] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [currentProductID, setCurrentProduct] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [sortBy, setSortBy] = useState('relevance');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [availableBrands, setAvailableBrands] = useState([]);
    const [onlyWithStock, setOnlyWithStock] = useState(false);
    const { addToCart } = useCart();

    const isPeripheralHub = decodedCategory === 'perifericos' || decodedCategory === 'periféricos';

    // 🔥 Función central para traer productos (PÚBLICO)
    const getProducts = useCallback(async () => {
        setLoading(true);
        try {
            let url = `${API_URL}/api/products/public`;
            
            if (decodedCategory) {
                if (isPeripheralHub) {
                    // Si es el HUB, traer todo y luego filtramos localmente o por búsqueda múltiple
                    url = `${API_URL}/api/products/public`;
                } else {
                    url = `${API_URL}/api/search-products?category=${encodeURIComponent(decodedCategory)}`;
                }
            }

            const res = await axios.get(url);
            let data = res.data;

            // Lógica específica para el Hub de Periféricos
            if (isPeripheralHub) {
                const peripheralTerms = PERIPHERAL_MAPPING['perifericos'];
                data = data.filter(p => 
                    peripheralTerms.some(term => 
                        p.category?.toLowerCase().includes(term) || 
                        p.nombre?.toLowerCase().includes(term)
                    )
                );
            }

            setProducts(data);
            setFilteredProducts(data);
        } catch (err) {
            console.error(err);
            // Fallback
            try {
                const fallback = await axios.get(`${API_URL}/api/products/public`);
                const term = decodedCategory;
                const filtered = fallback.data.filter(p => 
                    p.nombre?.toLowerCase().includes(term) ||
                    p.marca?.toLowerCase().includes(term) ||
                    p.category?.toLowerCase().includes(term)
                );
                setProducts(filtered);
                setFilteredProducts(filtered);
            } catch (fallbackErr) {
                console.error(fallbackErr);
            }
        } finally {
            setLoading(false);
        }
    }, [decodedCategory, isPeripheralHub]);

    // 🔥 Se ejecuta al montar y cuando cambia categoría
    useEffect(() => {
        const roleFromStorage = localStorage.getItem('rol');
        setUserRole(roleFromStorage);
        if (!searchActive) {
            getProducts();
        }
        setActiveSubFilter('all'); // Reset sub-filter when category changes
    }, [decodedCategory, searchActive, getProducts]);

    // 🔥 Extraer marcas únicas
    useEffect(() => {
        if (products.length > 0) {
            const brands = [...new Set(products.map(p => p.marca).filter(Boolean))].sort();
            setAvailableBrands(brands);
        }
    }, [products]);

    // 🔥 Filtrar y ordenar productos
    useEffect(() => {
        let result = [...products];

        // Sub-filtro de Hub (si aplica)
        if (isPeripheralHub && activeSubFilter !== 'all') {
            const targetCategories = SUB_CATEGORY_ICONS.find(i => i.id === activeSubFilter)?.categories || [];
            result = result.filter(p => 
                targetCategories.some(cat => 
                    p.category?.toLowerCase().includes(cat) || 
                    p.nombre?.toLowerCase().includes(cat)
                )
            );
        }

        // Filtro por precio
        if (minPrice !== '') result = result.filter(p => Number(p.precio) >= Number(minPrice));
        if (maxPrice !== '') result = result.filter(p => Number(p.precio) <= Number(maxPrice));

        // Filtro por marca
        if (selectedBrands.length > 0) result = result.filter(p => selectedBrands.includes(p.marca));

        // Filtro por disponibilidad de stock
        if (onlyWithStock) {
            result = result.filter(p => Number(p.stock) > 0);
        }

        // Ordenamiento
        if (sortBy === 'price-asc') result.sort((a, b) => Number(a.precio) - Number(b.precio));
        else if (sortBy === 'price-desc') result.sort((a, b) => Number(b.precio) - Number(a.precio));
        else if (sortBy === 'name') result.sort((a, b) => a.nombre.localeCompare(b.nombre));

        setFilteredProducts(result);
    }, [products, minPrice, maxPrice, sortBy, selectedBrands, activeSubFilter, isPeripheralHub, onlyWithStock]);

    const toggleBrand = (brand) => {
        setSelectedBrands(prev => 
            prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
        );
    };

    const deleteProduct = async (productID) => {
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
            await axios.delete(`${API_URL}/api/remover/product/${productID}`, {
                headers: { token_usuario: token }
            });
            getProducts();
        } catch (error) {
            console.error(error);
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
                <span>{isPeripheralHub ? 'Mundo Periféricos' : (decodedCategory || 'Todos los productos')}</span>
            </div>

            {/* CATEGORY HUB RIBBON (Only for Peripherals) */}
            {isPeripheralHub && (
                <div className="category-hub-ribbon">
                    <div className="hub-header">
                        <h2>Explora por Categoría</h2>
                        <p>Los mejores complementos para tu setup</p>
                    </div>
                    <div className="sub-category-grid">
                        {SUB_CATEGORY_ICONS.map(item => (
                            <button 
                                key={item.id}
                                className={`sub-cat-pill ${activeSubFilter === item.id ? 'active' : ''}`}
                                onClick={() => setActiveSubFilter(item.id)}
                            >
                                <span className="sub-cat-icon">{item.icon}</span>
                                <span className="sub-cat-label">{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

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

                    <div className="filter-group">
                        <h3>Disponibilidad</h3>
                        <label className="checkbox-container">
                            <input 
                                type="checkbox" 
                                checked={onlyWithStock}
                                onChange={(e) => setOnlyWithStock(e.target.checked)}
                            />
                            <span className="checkmark"></span>
                            Solo productos con stock
                        </label>
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
                <main className="products-content">
                    {loading ? (
                        <div className="products-grid">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                <div key={i} className="skeleton-card">
                                    <div className="skeleton-img skeleton"></div>
                                    <div className="skeleton-text skeleton"></div>
                                    <div className="skeleton-text skeleton" style={{ width: '60%' }}></div>
                                    <div className="skeleton-price skeleton"></div>
                                    <div className="skeleton-btn skeleton"></div>
                                </div>
                            ))}
                        </div>
                    ) : filteredProducts.length === 0 ? (
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
                                            <span className="category-badge">{producto.category}</span>
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
                </main>
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
