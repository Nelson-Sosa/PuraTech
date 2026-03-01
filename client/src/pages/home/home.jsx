import { Link } from "react-router-dom";
import '../home/home.css'
const home = () =>{
    return(
        <>
        <div className="cont">
            <h1>Bienvenido!</h1>
            <nav className="imagenes">
                <img src="/img/gamer.webp" alt="gamer" loading="lazy" />
                <img src="/img/Caballero.webp" alt="caballero" loading="lazy" />
                <img src="/img/pc.webp" alt="pc" loading="lazy" />
            </nav>
            <div>
                <nav>
                <Link to="/login"><button>Login</button></Link>
                <Link to="/register"><button>Register</button></Link>
                </nav>
            </div>
        </div>
        </>
    );
}
export default home;