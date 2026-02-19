import { useState, useEffect} from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../UpdateProduct/UpdateProduct.css';

const UpdateProduct = ()=>{
    const{id} = useParams();
    const [category, setCategory] = useState('pcgamer');
    const [nombre, setNombre] = useState("");
    const [marca, setMarca] = useState("");
    const [precio, setPrecio] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const navigate = useNavigate();
    
    useEffect(()=>{
        axios.get(`http://localhost:8000/api/product/${id}`,{
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
    }, [id]);

    const actualizarProducto = e => {
        e.preventDefault();

        axios.put(`http://localhost:8000/api/actulizar/product/${id}`, {
            category,
            nombre,
            marca,
            precio,
            descripcion
        },{
            headers:{
                token_usuario: localStorage.getItem("token")
            }
        })
            .then(res => console.log(res))
            .catch(err => {
                console.error("Error al cargar producto", err);
                if (err.response && err.response.status === 401) {
                    navigate('/login');
                }
            });
    };



    return(
        <>
        <div className="update-cont">
    <h2>Update Product</h2>

    <form onSubmit={actualizarProducto}>

        <p>
            <label>Categoria:</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="pcgamer">Pc Gamer</option>
                <option value="notebookgamer">Notebook Gamer</option>
                <option value="consolas">Consolas</option>
                <option value="mouse">Mouse</option>
                <option value="teclado">Teclado</option>
                <option value="monitor">Monitor</option>
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
            <label>Descripcion</label>
            <input
                type="text"
                name="descripcion"
                onChange={(e) => setDescripcion(e.target.value)}
                value={descripcion}
            />
        </p>

        <button type="submit">Update</button>

    </form>
</div>

        </>
    )

}

export default UpdateProduct;