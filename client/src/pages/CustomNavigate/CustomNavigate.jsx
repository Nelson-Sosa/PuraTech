import {Link} from "react-router-dom";
import './CustomNavigate.css';

const CustomNavigate = ()=>{
    
    return(
        <div className="cont-nav" > 
            <nav>
                <Link to='/category/Pc Gamer'>Pc Gamer</Link>
            </nav>
            <nav>
                <Link to='/category/Notebook Gamer'>Notebook Gamer</Link>
            </nav>
            <nav>
                <Link to='/category/Consolas'>Consolas</Link>
            </nav>
            <nav>
                <Link to='/category/Mouse'>Mouse</Link>
            </nav>
            <nav>
                <Link to='/category/Teclado'>Teclado</Link>
            </nav>
            <nav>
                <Link to='/category/Monitor'>Monitor</Link>
            </nav>
        </div>
    )
}

export default CustomNavigate;