import { Navigate } from "react-router-dom";

// Componente de Ruta Protegida
const PrivateRoute = ({ component: Component }) => {
    const isAuthenticated = !!localStorage.getItem("token"); // Verifica si el token existe en localStorage
    
    return (
        isAuthenticated ? (
            <Component />
        ) : (
            <Navigate to="/login" /> // Redirige al login si no está autenticado
        )
    );
};

export default PrivateRoute;



