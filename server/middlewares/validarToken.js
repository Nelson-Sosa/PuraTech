// middlewares/validarToken.js
const jwt = require('jsonwebtoken');
const SECRETO = "secreto"; // tu secreto actual

const validarToken = (req, res, next) => {
    const token = req.headers.token_usuario; // asegúrate de que el frontend envíe 'token_usuario'

    if (!token) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }

    try {
        const decodificado = jwt.verify(token, SECRETO);
        // Guardamos la info del usuario en req para los siguientes middlewares
        req.infoUsuario = {
            nombre: decodificado.nombre,
            apellido: decodificado.apellido,
            correo: decodificado.correo,
            rol: decodificado.rol.toLowerCase() // ⚡ forzamos minúsculas
        };

        console.log("TOKEN DECODIFICADO:", req.infoUsuario); // depuración
        next();
    } catch (error) {
        return res.status(401).json({ mensaje: "Token no válido o expirado" });
    }
};

module.exports = validarToken;

