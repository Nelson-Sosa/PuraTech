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

            jwt.sign(infoEnToken,  SECRETO, {expiresIn: "24h"}, (error, token) =>{
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

    console.log("[googleAuth] Body recibido:", { uid, nombre, apellido, email, photoURL, idToken: idToken ? "✅ SÍ" : "❌ NO" });

    if (!email) {
      return res.status(400).json({ mensaje: "Correo electrónico requerido" });
    }

    if (!idToken) {
      return res.status(400).json({ mensaje: "Token de Firebase requerido" });
    }

    // Verificar el Firebase ID token contra la REST API de Firebase
    const verifyUrl = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`;
    console.log("[googleAuth] Verificando idToken con Firebase Identity Toolkit...");
    
    let firebaseUser;
    try {
      const verifyRes = await axios.post(verifyUrl, { idToken });
      if (!verifyRes.data?.users?.length) {
        console.log("[googleAuth] ❌ Firebase no retornó usuarios para el idToken");
        return res.status(401).json({ mensaje: "Token de Firebase inválido" });
      }
      firebaseUser = verifyRes.data.users[0];
      console.log("[googleAuth] ✅ Firebase verificó usuario:", firebaseUser.email);
    } catch (firebaseErr) {
      console.error("[googleAuth] ❌ Error verificando con Firebase:", firebaseErr.response?.data || firebaseErr.message);
      return res.status(401).json({ 
        mensaje: "Token de Firebase inválido o expirado",
        detalle: firebaseErr.response?.data?.error?.message || firebaseErr.message
      });
    }

    if (firebaseUser.email !== email || firebaseUser.localId !== uid) {
      console.log("[googleAuth] ❌ Datos del token no coinciden con los del body");
      return res.status(401).json({ mensaje: "Datos del token no coinciden" });
    }

    let usuarioExistente = await Usuario.findOne({ correo: email });
    console.log("[googleAuth] Usuario en BD:", usuarioExistente ? "✅ Encontrado" : "⚠️ No existe, se creará");

    if (usuarioExistente) {
      const infoEnToken = {
        nombre: usuarioExistente.nombre,
        apellido: usuarioExistente.apellido,
        correo: usuarioExistente.correo,
        rol: usuarioExistente.rol
      };

      return jwt.sign(infoEnToken, SECRETO, { expiresIn: "24h" }, (error, token) => {
        if (error) {
          console.error("[googleAuth] ❌ Error generando JWT:", error);
          return res.status(400).json({ mensaje: "Error al generar token" });
        }
        console.log("[googleAuth] ✅ JWT generado para usuario existente:", email, "rol:", infoEnToken.rol);
        return res.status(200).json({ token, usuario: { ...infoEnToken, photoURL } });
      });
    }

    const newUser = await Usuario.create({
      nombre: nombre || "Usuario",
      apellido: apellido || "",
      correo: email,
      contraseña: bcrypt.hashSync(uid + SECRETO, saltGenerado),
      rol: "usuario"
    });

    console.log("[googleAuth] ✅ Nuevo usuario creado:", newUser.correo);

    const infoEnToken = {
      nombre: newUser.nombre,
      apellido: newUser.apellido,
      correo: newUser.correo,
      rol: newUser.rol
    };

    jwt.sign(infoEnToken, SECRETO, { expiresIn: "24h" }, (error, token) => {
      if (error) {
        console.error("[googleAuth] ❌ Error generando JWT para nuevo usuario:", error);
        return res.status(400).json({ mensaje: "Error al generar token" });
      }
      console.log("[googleAuth] ✅ JWT generado para nuevo usuario:", email, "rol:", infoEnToken.rol);
      return res.status(201).json({ token, usuario: { ...infoEnToken, photoURL } });
    });

  } catch (err) {
    console.error("[googleAuth] ❌ Error no controlado:", err.message);
    if (err.response?.status === 400) {
      return res.status(401).json({ mensaje: "Token de Firebase inválido o expirado" });
    }
    return res.status(500).json({ mensaje: "Error al autenticar con Google", detalle: err.message });
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

    jwt.sign(infoEnToken, SECRETO, { expiresIn: "24h" }, (error, token) => {
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