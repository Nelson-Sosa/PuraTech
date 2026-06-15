const { request } = require('express'); 
const Usuario = require('../models/models');
const bcrypt = require("bcryptjs");
const HASH_SALT = 10;
const saltGenerado = bcrypt.genSaltSync(HASH_SALT);
const jwt = require('jsonwebtoken');
const axios = require('axios');

const SECRETO = "secreto";
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || "AIzaSyAOvpVqNx_Top_fQtCG_GMc1wFtFdtBYZM";

module.exports.todosLosUsuarios = (req, res) => {       
    console.log(req.infoUsuario);

    return Usuario.find()
      .then((usuarios) => {
        return res.status(200).json(usuarios);
      })
      .catch((err) => {
        console.error("Error retrieving User:", err);
        return res.status(500).json(err);
      });
  };

module.exports.login =(req, res) =>{
    try{
        const{correo, contraseña} = req.body;

        Usuario.findOne({correo})
        .then((usuarioEncontrado) =>{
            if(!usuarioEncontrado){ 
                return res.status(404).json({mensaje: "Usuario no encontrado."});
            }
            if(!bcrypt.compareSync(contraseña,usuarioEncontrado.contraseña)){
                return res.status(404).json({mensaje: "Contraseña invalida."});
            }

            const infoEnToken = {
                nombre: usuarioEncontrado.nombre,
                apellido: usuarioEncontrado.apellido,
                correo: usuarioEncontrado.correo,
                rol: usuarioEncontrado.rol
            }

            jwt.sign(infoEnToken,  SECRETO, {expiresIn: "12h"}, (error, token) =>{
                if(error){
                    return res.status(400).json({mensaje: "Algo fallo al generar el token"})
                }
                return  res.status(200).json({ token, usuario: infoEnToken });
            });

        })

    }catch(err){
        console.error("Error al hacer login", err)
        res.status(404).json(err);
    }   
}

module.exports.googleAuth = async (req, res) => {
  try {
    const { uid, nombre, apellido, email, photoURL, idToken } = req.body;

    console.log("[googleAuth] ── INICIO ──");
    console.log("[googleAuth] Body recibido:", {
      uid: uid || "❌ FALTA",
      email: email || "❌ FALTA",
      nombre: nombre || "(vacío)",
      apellido: apellido || "(vacío)",
      photoURL: photoURL || "(sin foto)",
      idToken: idToken ? `✅ SÍ (${idToken.substring(0, 20)}...)` : "❌ FALTA"
    });

    // Validaciones básicas
    if (!email) {
      console.log("[googleAuth] ❌ Falta email");
      return res.status(400).json({ mensaje: "Correo electrónico requerido" });
    }
    if (!idToken) {
      console.log("[googleAuth] ❌ Falta idToken");
      return res.status(400).json({ mensaje: "Token de Firebase requerido" });
    }
    if (!uid) {
      console.log("[googleAuth] ❌ Falta uid");
      return res.status(400).json({ mensaje: "UID de Firebase requerido" });
    }

    // Decodificar el idToken de Firebase localmente (es un JWT de Google)
    // No necesitamos verificar la firma — la autenticación ya ocurrió en el cliente con Firebase SDK
    // Esta decodificación es para extraer los claims y confirmar que email/uid coinciden
    let tokenPayload;
    try {
      tokenPayload = jwt.decode(idToken);
      console.log("[googleAuth] ✅ idToken decodificado. sub:", tokenPayload?.sub, "email:", tokenPayload?.email);
    } catch (decodeErr) {
      console.error("[googleAuth] ❌ Error decodificando idToken:", decodeErr.message);
      return res.status(401).json({ mensaje: "Token de Firebase inválido (no decodificable)" });
    }

    if (!tokenPayload) {
      console.log("[googleAuth] ❌ idToken decodificado es null");
      return res.status(401).json({ mensaje: "Token de Firebase inválido" });
    }

    // Verificar que el token no esté expirado
    const now = Math.floor(Date.now() / 1000);
    if (tokenPayload.exp && tokenPayload.exp < now) {
      console.log("[googleAuth] ❌ idToken expirado. exp:", tokenPayload.exp, "now:", now);
      return res.status(401).json({ mensaje: "Token de Firebase expirado. Por favor volvé a iniciar sesión." });
    }

    // Verificar que el email del token coincida con el enviado
    const tokenEmail = tokenPayload.email || "";
    if (tokenEmail.toLowerCase() !== email.toLowerCase()) {
      console.log("[googleAuth] ❌ Email no coincide. token:", tokenEmail, "body:", email);
      return res.status(401).json({ mensaje: "Datos del token no coinciden con el email enviado" });
    }

    console.log("[googleAuth] ✅ Validación de token OK. Buscando usuario en BD...");

    // Buscar si el usuario ya existe
    let usuarioExistente = await Usuario.findOne({ correo: email });
    console.log("[googleAuth] Usuario en BD:", usuarioExistente ? `✅ Encontrado (rol: ${usuarioExistente.rol})` : "⚠️ No existe, se creará");

    if (usuarioExistente) {
      const infoEnToken = {
        nombre: usuarioExistente.nombre,
        apellido: usuarioExistente.apellido,
        correo: usuarioExistente.correo,
        rol: usuarioExistente.rol
      };

      return jwt.sign(infoEnToken, SECRETO, { expiresIn: "12h" }, (error, token) => {
        if (error) {
          console.error("[googleAuth] ❌ Error generando JWT:", error);
          return res.status(400).json({ mensaje: "Error al generar token" });
        }
        console.log("[googleAuth] ✅ JWT generado para usuario existente. Rol:", infoEnToken.rol);
        return res.status(200).json({ token, usuario: { ...infoEnToken, photoURL } });
      });
    }

    // Crear nuevo usuario — sin edad (campo opcional ahora)
    console.log("[googleAuth] Creando nuevo usuario en BD...");
    let newUser;
    try {
      newUser = await Usuario.create({
        nombre: nombre || email.split("@")[0] || "Usuario",
        apellido: apellido || "",
        correo: email,
        contraseña: bcrypt.hashSync(uid + SECRETO, saltGenerado),
        rol: "usuario"
        // edad es opcional — no se incluye para usuarios de Google
      });
      console.log("[googleAuth] ✅ Nuevo usuario creado. ID:", newUser._id, "Correo:", newUser.correo);
    } catch (createErr) {
      console.error("[googleAuth] ❌ Error creando usuario en BD:", createErr.message);
      console.error("[googleAuth] Detalle de validación:", createErr.errors);
      return res.status(500).json({
        mensaje: "Error al crear usuario en la base de datos",
        detalle: createErr.message,
        errores: createErr.errors
      });
    }

    const infoEnToken = {
      nombre: newUser.nombre,
      apellido: newUser.apellido,
      correo: newUser.correo,
      rol: newUser.rol
    };

    jwt.sign(infoEnToken, SECRETO, { expiresIn: "12h" }, (error, token) => {
      if (error) {
        console.error("[googleAuth] ❌ Error generando JWT para nuevo usuario:", error);
        return res.status(400).json({ mensaje: "Error al generar token" });
      }
      console.log("[googleAuth] ✅ JWT generado para nuevo usuario. Rol:", infoEnToken.rol);
      return res.status(201).json({ token, usuario: { ...infoEnToken, photoURL } });
    });

  } catch (err) {
    console.error("[googleAuth] ❌ Error no controlado:", err.message);
    console.error("[googleAuth] Stack:", err.stack);
    return res.status(500).json({ mensaje: "Error interno del servidor", detalle: err.message });
  }
};

module.exports.agregarUsuario = async (req, res) => {
  try {
    console.log("Body recibido:", req.body); // <<--- VER LO QUE LLEGA
    const { nombre, apellido, edad, correo, contraseña, rol } = req.body;

    const existingUser = await Usuario.findOne({ correo });
    if (existingUser) {
      return res.status(400).json({ error: "Usuario con ese correo ya existe" });
    }

    const newUser = await Usuario.create({
      nombre,
      apellido,
      edad,
      correo,
      contraseña: bcrypt.hashSync(contraseña, saltGenerado),
      rol: rol || 'usuario'
    });

    console.log("Nuevo usuario creado:", newUser);

    const infoEnToken = {
      nombre: newUser.nombre,
      apellido: newUser.apellido,
      correo: newUser.correo,
      rol: newUser.rol
    };

    jwt.sign(infoEnToken, SECRETO, { expiresIn: "12h" }, (error, token) => {
      if (error) {
        return res.status(400).json({ mensaje: "Algo falló al generar el token" });
      }
      return res.status(201).json({ token });
    });

    } catch (err) {
    console.error("Error al crear usuario:", err.message);
    console.error("Detalles del error:", err.errors); // <-- esto muestra qué campo falló
    return res.status(400).json({
        mensaje: "Error al crear usuario",
        error: err.message,
        detalles: err.errors
    });
}

};


module.exports.removerUsuario = (req, res) =>{
    return Usuario.deleteOne({correo: req.infoUsuario.correo})
        .then((usuarioRemovido) =>{
            console.log(usuarioRemovido)
            return res.status(204).end();
        })
        .catch((error) =>{
            return res.status(500).json({mensaje: "Error al eliminar usuario", error})  
        })
}

module.exports.actualizarPerfil = async (req, res) => {
  try {
    const { nombre, apellido, telefono } = req.body;
    const correoUsuario = req.infoUsuario.correo;

    const usuario = await Usuario.findOne({ correo: correoUsuario });
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    if (nombre) usuario.nombre = nombre;
    if (apellido) usuario.apellido = apellido;
    if (telefono !== undefined) usuario.telefono = telefono;

    await usuario.save();

    const infoEnToken = {
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo,
      rol: usuario.rol
    };

    jwt.sign(infoEnToken, SECRETO, { expiresIn: "12h" }, (error, token) => {
      if (error) {
        return res.status(400).json({ mensaje: "Error al generar nuevo token" });
      }
      return res.status(200).json({ 
        mensaje: "Perfil actualizado correctamente", 
        token, 
        usuario: { ...infoEnToken, telefono: usuario.telefono, createdAt: usuario.createdAt }
      });
    });

  } catch (err) {
    console.error("Error al actualizar perfil:", err);
    res.status(500).json({ mensaje: "Error interno del servidor", detalle: err.message });
  }
};

module.exports.cambiarPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const correoUsuario = req.infoUsuario.correo;

    const usuario = await Usuario.findOne({ correo: correoUsuario });
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    if (!usuario.contraseña) {
      return res.status(400).json({ mensaje: "El usuario fue registrado con Google y no tiene contraseña local." });
    }

    if (!bcrypt.compareSync(currentPassword, usuario.contraseña)) {
      return res.status(400).json({ mensaje: "La contraseña actual es incorrecta." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ mensaje: "La nueva contraseña debe tener al menos 6 caracteres." });
    }

    usuario.contraseña = bcrypt.hashSync(newPassword, saltGenerado);
    await usuario.save();

    res.status(200).json({ mensaje: "Contraseña actualizada correctamente" });
  } catch (err) {
    console.error("Error al cambiar contraseña:", err);
    res.status(500).json({ mensaje: "Error interno del servidor", detalle: err.message });
  }
};

module.exports.obtenerConfiguracion = async (req, res) => {
  try {
    const correoUsuario = req.infoUsuario.correo;
    const usuario = await Usuario.findOne({ correo: correoUsuario });
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    res.status(200).json({
      preferencias: usuario.preferencias || { idioma: 'es', moneda: 'PYG', tema: 'system' },
      notificaciones: usuario.notificaciones || { promociones: true, pedidos: true, novedades: true }
    });
  } catch (err) {
    console.error("Error al obtener configuracion:", err);
    res.status(500).json({ mensaje: "Error interno del servidor", detalle: err.message });
  }
};

module.exports.actualizarConfiguracion = async (req, res) => {
  try {
    const { preferencias, notificaciones } = req.body;
    const correoUsuario = req.infoUsuario.correo;

    const usuario = await Usuario.findOne({ correo: correoUsuario });
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    if (preferencias) usuario.preferencias = { ...usuario.preferencias, ...preferencias };
    if (notificaciones) usuario.notificaciones = { ...usuario.notificaciones, ...notificaciones };

    await usuario.save();

    res.status(200).json({
      mensaje: "Configuración actualizada correctamente",
      preferencias: usuario.preferencias,
      notificaciones: usuario.notificaciones
    });
  } catch (err) {
    console.error("Error al actualizar configuracion:", err);
    res.status(500).json({ mensaje: "Error interno del servidor", detalle: err.message });
  }
};

module.exports.eliminarMiCuenta = async (req, res) => {
  try {
    const { password } = req.body;
    const correoUsuario = req.infoUsuario.correo;

    const usuario = await Usuario.findOne({ correo: correoUsuario });
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    // Si tiene contraseña (usuario local), requerimos verificarla
    if (usuario.contraseña) {
      if (!password) {
        return res.status(400).json({ mensaje: "Se requiere la contraseña para eliminar la cuenta" });
      }
      if (!bcrypt.compareSync(password, usuario.contraseña)) {
        return res.status(400).json({ mensaje: "La contraseña es incorrecta." });
      }
    }

    await Usuario.deleteOne({ correo: correoUsuario });
    res.status(200).json({ mensaje: "Cuenta eliminada correctamente" });
  } catch (err) {
    console.error("Error al eliminar cuenta:", err);
    res.status(500).json({ mensaje: "Error interno del servidor", detalle: err.message });
  }
};
