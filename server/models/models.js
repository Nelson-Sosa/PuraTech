const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    nombre: {
        type : String,
        require: [true, 'Username is required']
    },
    apellido:{
        type: String,
        require: [true, 'Last name']
    },
    edad:{
        type: Number,
        require: [true, 'Age']
    },
    correo:{
        type: String,
        require: [true, 'Email is required'], 
        unique: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address"]
    },
    contraseña:{
        type: String,
        require:[true, 'Password is required'],
        minlength: [5, 'Password must be at least 5 characters long']
    },
    rol:{
        type: String,
        enum: ['usuario', 'admin'], // Solo dos roles permitidos
        default: 'usuario' // Por defecto, el rol será "usuario"
    }

})

const User = mongoose.model("User", userSchema);

module.exports = User;