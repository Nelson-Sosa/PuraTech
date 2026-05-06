// middlewares/verificarRol.js
const verificarRol = (rolRequerido) => (req, res, next) => {
    const rolUsuario = req.infoUsuario?.rol;
    const rolLower = rolRequerido.toLowerCase();
    
    console.log("🔍 [verificarRol] Rol requerido:", rolLower);
    console.log("🔍 [verificarRol] Rol del usuario:", rolUsuario);
    console.log("🔍 [verificarRol] ¿Coincide?:", rolUsuario === rolLower);

    if (!rolUsuario) {
        console.log("🔴 [verificarRol] ERROR: Usuario sin rol");
        return res.status(401).json({ message: "Usuario no encontrado" });
    }

    if (rolUsuario !== rolLower) {
        console.log("🔴 [verificarRol] ERROR: Acceso denegado");
        return res.status(403).json({ message: `Acceso denegado: se requiere el rol de ${rolRequerido}` });
    }

    console.log("✅ [verificarRol] Acceso permitido");
    next();
};

module.exports = verificarRol;

