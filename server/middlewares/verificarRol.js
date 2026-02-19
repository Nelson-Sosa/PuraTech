// middlewares/verificarRol.js
const verificarRol = (rolRequerido) => (req, res, next) => {
    const rolUsuario = req.infoUsuario?.rol;
    console.log("ROL EN INFO USUARIO:", rolUsuario); // depuración

    if (!rolUsuario) {
        return res.status(401).json({ message: "Usuario no encontrado" });
    }

    if (rolUsuario !== rolRequerido.toLowerCase()) {
        return res.status(403).json({ message: `Acceso denegado: se requiere el rol de ${rolRequerido}` });
    }

    next();
};

module.exports = verificarRol;

