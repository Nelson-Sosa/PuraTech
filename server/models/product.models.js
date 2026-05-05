const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    category: {
        type: String,
        required: [true],
    },
    nombre: {
        type: String,
        required: [true]
    },
    marca: {
        type: String,
        required: [true]
    },
    precio: {
        type: Number,
        required: [true]
    },
    descripcion: {
        type: String,
        required: [true]
    },
    imageUrl: {
        type: String
    }, // URL de la imagen principal (backward compatibility)
    images: {
        type: [String],
        default: []
    }, // Múltiples imágenes del producto
    ventas: {
        type: Number,
        default: 0
    },
    isOffer: {
        type: Boolean,
        default: false
    },
    isNew: {
        type: Boolean,
        default: true
    },
    stock: {
        type: Number,
        default: 10
    }
}, {
    timestamps: true // Agrega createdAt y updatedAt automáticamente
});

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;