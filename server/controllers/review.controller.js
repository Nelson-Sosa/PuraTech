// controllers/review.controller.js
const Review  = require('../models/Review.model');
const User    = require('../models/models');

// ── Helper: obtener _id por correo (mismo patrón que wishlistController) ──
const getUserId = async (correo) => {
  const user = await User.findOne({ correo });
  if (!user) throw new Error('Usuario no encontrado');
  return user._id;
};

// ── Helper: verificar que la reseña pertenece al usuario autenticado ──
const verificarAutor = async (reviewId, userId) => {
  const review = await Review.findById(reviewId);
  if (!review) return { error: 'Reseña no encontrada', status: 404 };
  if (review.user.toString() !== userId.toString()) {
    return { error: 'No autorizado: solo el autor puede modificar esta reseña', status: 403 };
  }
  return { review };
};

/**
 * POST /api/reviews
 * Crea una reseña nueva o actualiza la existente del mismo usuario para ese producto.
 * Lógica upsert: evita duplicados según el índice único { user, product }.
 */
exports.createOrUpdateReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    // Validaciones básicas
    if (!productId) {
      return res.status(400).json({ message: 'productId es requerido' });
    }
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'La calificación debe estar entre 1 y 5' });
    }
    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({ message: 'El comentario es requerido' });
    }
    if (comment.trim().length > 1000) {
      return res.status(400).json({ message: 'El comentario no puede superar los 1000 caracteres' });
    }

    const userId = await getUserId(req.infoUsuario.correo);

    // findOneAndUpdate con upsert: si ya existe la edita, si no la crea
    const review = await Review.findOneAndUpdate(
      { user: userId, product: productId },
      {
        rating: Number(rating),
        comment: comment.trim(),
        // al actualizar, regeneramos createdAt solo si es nueva — updatedAt lo maneja timestamps
      },
      {
        new: true,     // devuelve el documento actualizado
        upsert: true,  // crea si no existe
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    ).populate('user', 'nombre apellido');

    return res.status(200).json({
      message: 'Reseña guardada correctamente',
      review,
    });
  } catch (error) {
    console.error('[createOrUpdateReview] Error:', error.message);
    return res.status(500).json({ message: 'Error al guardar la reseña', error: error.message });
  }
};

/**
 * GET /api/reviews/product/:productId
 * Devuelve todas las reseñas de un producto, ordenadas de más reciente a más antigua.
 * Ruta pública — no requiere autenticación.
 */
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ product: productId })
      .populate('user', 'nombre apellido') // solo expone nombre y apellido — nunca contraseña
      .sort({ createdAt: -1 });

    return res.status(200).json(reviews);
  } catch (error) {
    console.error('[getProductReviews] Error:', error.message);
    return res.status(500).json({ message: 'Error al obtener reseñas', error: error.message });
  }
};

/**
 * GET /api/reviews/product/:productId/stats
 * Devuelve promedio y total de reseñas de un producto.
 * Ruta pública — no requiere autenticación.
 */
exports.getProductStats = async (req, res) => {
  try {
    const { productId } = req.params;

    const result = await Review.aggregate([
      { $match: { product: new (require('mongoose').Types.ObjectId)(productId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews:  { $sum: 1 },
          // distribución por estrella
          star5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          star4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          star3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          star2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          star1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
        },
      },
    ]);

    if (result.length === 0) {
      return res.status(200).json({
        averageRating: 0,
        totalReviews: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      });
    }

    const stats = result[0];
    return res.status(200).json({
      averageRating: Math.round(stats.averageRating * 10) / 10, // 1 decimal
      totalReviews: stats.totalReviews,
      distribution: {
        5: stats.star5,
        4: stats.star4,
        3: stats.star3,
        2: stats.star2,
        1: stats.star1,
      },
    });
  } catch (error) {
    console.error('[getProductStats] Error:', error.message);
    return res.status(500).json({ message: 'Error al obtener estadísticas', error: error.message });
  }
};

/**
 * PUT /api/reviews/:reviewId
 * Edita una reseña. Solo el autor puede hacerlo.
 */
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return res.status(400).json({ message: 'La calificación debe estar entre 1 y 5' });
    }
    if (comment !== undefined && comment.trim().length > 1000) {
      return res.status(400).json({ message: 'El comentario no puede superar los 1000 caracteres' });
    }

    const userId = await getUserId(req.infoUsuario.correo);
    const { error, status, review } = await verificarAutor(reviewId, userId);

    if (error) return res.status(status).json({ message: error });

    if (rating  !== undefined) review.rating  = Number(rating);
    if (comment !== undefined) review.comment = comment.trim();

    await review.save();
    await review.populate('user', 'nombre apellido');

    return res.status(200).json({ message: 'Reseña actualizada correctamente', review });
  } catch (error) {
    console.error('[updateReview] Error:', error.message);
    return res.status(500).json({ message: 'Error al actualizar la reseña', error: error.message });
  }
};

/**
 * DELETE /api/reviews/:reviewId
 * Elimina una reseña. Solo el autor puede hacerlo.
 */
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = await getUserId(req.infoUsuario.correo);
    const { error, status, review } = await verificarAutor(reviewId, userId);

    if (error) return res.status(status).json({ message: error });

    await Review.findByIdAndDelete(reviewId);

    return res.status(200).json({ message: 'Reseña eliminada correctamente' });
  } catch (error) {
    console.error('[deleteReview] Error:', error.message);
    return res.status(500).json({ message: 'Error al eliminar la reseña', error: error.message });
  }
};
