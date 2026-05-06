// middlewares/validarToken.js
const jwt = require('jsonwebtoken');
const SECRETO = "secreto"; // tu secreto actual

const validarToken = (req, res, next) => {
    const token = req.headers.token_usuario;

    console.log("🔍 [validarToken] Token recibido:", token ? "SÍ" : "NO");
    console.log("🔍 [validarToken] Path:", req.path);

    if (!token) {
        console.log("🔴 [validarToken] ERROR: Token no proporcionado");
        return res.status(401).json({ message: 'Token no proporcionado' });
    }

    try {
        const decodificado = jwt.verify(token, SECRETO);
        console.log("✅ [validarToken] Token decodificado:", decodificado);
        
        req.infoUsuario = {
            nombre: decodificado.nombre,
            apellido: decodificado.apellido,
            correo: decodificado.correo,
            rol: decodificado.rol.toLowerCase()
        };

        console.log("✅ [validarToken] req.infoUsuario:", req.infoUsuario);
        next();
    } catch (error) {
        console.log("🔴 [validarToken] ERROR:", error.message);
        return res.status(401).json({ mensaje: "Token no válido o expirado" });
    }
};

module.exports = validarToken;

