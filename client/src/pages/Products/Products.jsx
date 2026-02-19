import { useEffect, useState } from "react";
import axios from "axios"; 
import { Link, useNavigate } from "react-router-dom";
import SearchBar from "../../components/SearchBar/SearchBar";
import CustomNavigate from "../CustomNavigate/CustomNavigate";
import { useParams } from "react-router-dom";
import '../Products/Products.css';
import Modal from "../../components/Modal/Modal";

export const Products = ({ RemoverFromDom }) => {
    const { category } = useParams();
    const [product, setProduct] = useState([]);
    const navegar = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [currentProductID, setCurrentProduct] = useState(null);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        // Recuperar el rol del usuario desde el localStorage cuando el componente se monte
        const roleFromStorage = localStorage.getItem('rol');
        setUserRole(roleFromStorage);
        console.log("Rol recuperado:", roleFromStorage); // Log para verificar el rol
    }, []);

    const deleteProduct = (productID) => {
        axios.delete('http://localhost:8000/api/remover/product/' + productID, {
            headers: {
                token_usuario: localStorage.getItem("token")
            }
        })
        .then(res => {
            if (RemoverFromDom) {
                RemoverFromDom(productID);
            }
        })
        .catch(error => {
            console.error('Error al eliminar producto', error);
            if (error.response && error.response.status === 401) {
                navegar('/login');
            }
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

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get(`http://localhost:8000/api/products?category=${category}`, {
                    headers: {
                        token_usuario: localStorage.getItem("token")
                    }
                });
                if (res.status === 200) {
                    setProduct(res.data);
                    console.log("Productos recuperados:", res.data); // Log para verificar los productos
                }
            } catch (err) {
                console.error("Ocurrió un error:", err.message);
                if (err.response && err.response.status === 401) {
                    navegar('/login');
                }
            }
        };
        fetchProducts();
    }, [category]);

    return (
        <>
            <div>
                <SearchBar setSearchResultados={setProduct} />
                <CustomNavigate />
                <div className="prod-cont">
                    <div className="sub">
                        <h1>{category}</h1>
                        <ul>
                            {Array.isArray(product) && product.map((producto, idx) => {
                                return (
                                    <li key={idx}>
                                        <strong></strong> {producto.marca} <br />
                                        <strong>Precio:</strong> {producto.precio}<strong>Gs.</strong> <br />
                                        <strong>Descripción:</strong> {producto.descripcion} <br />
                                        <img className="prod-img" src={`http://localhost:8000${producto.imageUrl}`} alt={producto.nombre} />
                                        <div>
                                            {userRole === "admin" && (
                                                <div>
                                                    <button
                                                        className="btnD"
                                                        onClick={() => handleDeleteClick(producto._id)}
                                                    >
                                                        Delete
                                                    </button>
                                                    <Link to={`/actualizar/product/${producto._id}`}>
                                                        <button className="btnU">Update</button>
                                                    </Link>
                                                </div>
                                            )}
                                            <Link to='/create-payment-intent'>
                                                <button className="btn-pagar">Solicitar</button>
                                            </Link>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
                <Modal show={showModal}
                    onClose={() => setShowModal(false)}
                    onConfirm={handleConfirmDelete}>
                    <p>¿Are you sure you want to remove this product?</p>
                </Modal>
            </div>
        </>
    );
};
