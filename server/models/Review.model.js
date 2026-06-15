// models/Review.model.js
const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El usuario es requerido'],
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'El producto es requerido'],
    },
    rating: {
      type: Number,
      required: [true, 'La calificación es requerida'],
      min: [1, 'La calificación mínima es 1'],
      max: [5, 'La calificación máxima es 5'],
    },
    comment: {
      type: String,
      required: [true, 'El comentario es requerido'],
      trim: true,
      maxlength: [1000, 'El comentario no puede superar los 1000 caracteres'],
    },
  },
  {
    timestamps: true, // agrega createdAt y updatedAt automáticamente
  }
);

// Índice único: un usuario solo puede tener 1 reseña por producto
ReviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Índice de consulta frecuente: obtener reseñas de un producto ordenadas por fecha
ReviewSchema.index({ product: 1, createdAt: -1 });

const Review = mongoose.model('Review', ReviewSchema);

module.exports = Review;
