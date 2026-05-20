const { request } = require('express'); 
const Usuario = require('../models/models');
const bcrypt = require("bcryptjs");
const HASH_SALT = 10;
const saltGenerado = bcrypt.genSaltSync(HASH_SALT);
const jwt = require('jsonwebtoken');

const SECRETO = "secreto";

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
                return  res.status(200).json({token});
            });

        })

    }catch(err){
        console.error("Error al hacer login", err)
        res.status(404).json(err);
    }   
}

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