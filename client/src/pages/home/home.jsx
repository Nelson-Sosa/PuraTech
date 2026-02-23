import { Link } from "react-router-dom";
import '../home/home.css'
const home = () =>{
    return(
        <>
        <div className="cont">
            <h1>Bienvenido!</h1>
            <nav className="imagenes">
                <img src="/img/gamer.png" alt="gamer" />
                <img src="/img/Caballero.png"/>
                <img src="/img/pc.png" alt="gamer" />
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