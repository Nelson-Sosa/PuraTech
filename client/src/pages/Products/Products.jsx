import { useEffect, useState } from "react";
import axios from "axios"; 
import { Link, useNavigate, useParams } from "react-router-dom";
import SearchBar from "../../components/SearchBar/SearchBar";
import CustomNavigate from "../CustomNavigate/CustomNavigate";
import '../Products/Products.css';
import Modal from "../../components/Modal/Modal";

export const Products = ({ RemoverFromDom }) => {
    const { category } = useParams();
    const [product, setProduct] = useState([]);
    const [searchActive, setSearchActive] = useState(false); 
    const navegar = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [currentProductID, setCurrentProduct] = useState(null);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const roleFromStorage = localStorage.getItem('rol');
        setUserRole(roleFromStorage);
    }, []);

    const deleteProduct = (productID) => {
        axios.delete(`http://localhost:8000/api/remover/product/${productID}`, {
            headers: { token_usuario: localStorage.getItem("token") }
        })
        .then(() => {
            if (RemoverFromDom) RemoverFromDom(productID);
        })
        .catch(error => {
            console.error('Error al eliminar producto', error);
            if (error.response && error.response.status === 401) navegar('/login');
        });
    }

    const handleDeleteClick = (productID) => {
        setCurrentProduct(productID);
        setShowModal(true);
    }

    const handleConfirmDelete = () => {
        deleteProduct(currentProductID);
        setShowModal(false);
        setCurrentProduct(null);
    }

    // ⚡ Trae los productos de la categoría solo si no hay búsqueda activa
    useEffect(() => {
        if (searchActive) return; 
        const fetchProducts = async () => {
            try {
                const res = await axios.get(`http://localhost:8000/api/products?category=${category}`, {
                    headers: { token_usuario: localStorage.getItem("token") }
                });
                setProduct(res.data);
            } catch (err) {
                console.error(err);
                if (err.response && err.response.status === 401) navegar('/login');
            }
        };
        fetchProducts();
    }, [category, searchActive]);

    return (
        <>
        <header className="header-container">
            <SearchBar 
                setSearchResultados={setProduct} 
                setSearchActive={setSearchActive} 
            />
            <CustomNavigate />
        </header>

        <div className="products-wrapper">
            <h1 className="category-title">{searchActive ? "Resultados de búsqueda" : category}</h1>
            <div className="products-grid">
            {Array.isArray(product) && product.map((producto) => (
                <div className="product-card" key={producto._id}>
                    <div className="image-container">
                        <img src={`http://localhost:8000${producto.imageUrl}`} alt={producto.nombre} />
                    </div>
                    <div className="product-info">
                        <h2>{producto.marca}</h2>
                        <p className="price">{producto.precio} Gs.</p>
                        <p className="description">{producto.descripcion}</p>
                    </div>
                    <div className="product-actions">
                        {userRole === "admin" && (
                            <>
                            <button className="btn-delete" onClick={() => handleDeleteClick(producto._id)}>Delete</button>
                            <Link to={`/actualizar/product/${producto._id}`}>
                                <button className="btn-update">Update</button>
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
        </div>

        <Modal
            show={showModal}
            onClose={() => setShowModal(false)}
            onConfirm={handleConfirmDelete}
        >
            <p>¿Are you sure you want to remove this product?</p>
        </Modal>
        </>
    );
};