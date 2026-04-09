import { useEffect, useState } from "react";
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
    const [product, setProduct] = useState([]);
    const [searchActive, setSearchActive] = useState(false); 
    const navegar = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [currentProductID, setCurrentProduct] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const location = useLocation();


    // 🔥 Función central para traer productos
    const getProducts = async () => {
        try {
            const res = await axios.get(
                `${API_URL}/api/products?category=${category}`,
                {
                    headers: {
                        token_usuario: localStorage.getItem("token")
                    }
                }
            );
            setProduct(res.data);
        } catch (err) {
            console.error(err);
            if (err.response && err.response.status === 401) {
                navegar('/login');
            }
        }
    };

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
                navegar('/login');
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
       <>
  <header className="header-container">
    <SearchBar 
      setSearchResultados={setProduct} 
      setSearchActive={setSearchActive} 
    />
    <CustomNavigate />
  </header>

  <div className="products-wrapper">
    <h1 className="category-title">
      {searchActive ? "Resultados de búsqueda" : category}
    </h1>

    <div className="products-grid">
      {Array.isArray(product) && product.map((producto) => (
        <div className="product-card" key={producto._id}>
          {/* Imagen del producto */}
          <div className="image-container">
  <img
    src={producto.imageUrl || "/img/placeholder.png"}
    alt={producto.nombre}
    className="product-image"
  />
</div>

          {/* Información del producto */}
          <div className="product-info">
            <h2>{producto.marca}</h2>
            <p className="price">
              {Number(producto.precio).toLocaleString("es-PY")} Gs.
            </p>
            <ul className="description-list">
              {producto.descripcion &&
                producto.descripcion.split('. ').map((item, index) => (
                  <li key={index}>{item.trim()}</li>
              ))}
            </ul>
          </div>

          {/* Acciones del producto */}
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
  </div>

  <Modal
    show={showModal}
    onClose={() => setShowModal(false)}
    onConfirm={handleConfirmDelete}
  >
    <p>¿Está seguro de que desea eliminar este producto?</p>
  </Modal>
</>
    );
};