import { useState, useEffect} from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../UpdateProduct/UpdateProduct.css';
import { API_URL } from '../../config';
const UpdateProduct = ()=>{
    const{id} = useParams();
    const [category, setCategory] = useState('');
    const [nombre, setNombre] = useState("");
    const [marca, setMarca] = useState("");
    const [precio, setPrecio] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    
    useEffect(()=>{
        axios.get(`${API_URL}/api/product/${id}`,{
            headers: {
                token_usuario: localStorage.getItem("token")
            }
        })
        .then(res =>{
            setCategory(res.data.category);
            setNombre(res.data.nombre);
            setMarca(res.data.marca);
            setPrecio(res.data.precio);
            setDescripcion(res.data.descripcion);
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

    const actualizarProducto = async (e) => {
    e.preventDefault();

    try {
        await axios.put(
            `${API_URL}/api/actualizar/product/${id}`,
            {
                category,
                nombre,
                marca,
                precio,
                descripcion
            },
            {
                headers: {
                    token_usuario: localStorage.getItem("token")
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



    return(
        <>
        <div className="update-cont">
    <h2>Actualizar Producto</h2>

    <form onSubmit={actualizarProducto}>

        <p>
           <select value={category} onChange={(e) => setCategory(e.target.value)}>
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
        </p>

        <p>
            <label>Nombre:</label>
            <input
                type="text"
                name="nombre"
                onChange={(e)=> setNombre(e.target.value)}
                value={nombre}
            />
        </p>

        <p>
            <label>Marca:</label>
            <input
                type="text"
                name="marca"
                onChange={(e)=> setMarca(e.target.value)}
                value={marca}
            />
        </p>

        <p>
            <label>Precio:</label>
            <input
                type="number"
                name="precio"
                onChange={(e)=> setPrecio(e.target.value)}
                value={precio}
            />
        </p>

        <p>
            <label htmlFor="descripcion">Descripción del producto:</label>
<textarea
  id="descripcion"
  name="descripcion"
  placeholder="Ej: Tipo de pantalla: VA LCD de 23.8&quot;. Resolución: Full HD..."
  rows={6}      // Altura inicial del textarea
  cols={50}     // Ancho aproximado (puedes controlar mejor con CSS)
  value={descripcion}
  onChange={(e) => setDescripcion(e.target.value)}
  className="descripcion-textarea"
/>
        </p>

        <button type="submit">Actualizar</button>

    </form>
</div>

        </>
    )

}

export default UpdateProduct;