const Wishlist = require('../models/Wishlist');
const User = require('../models/models');

const getUserId = async (correo) => {
  const user = await User.findOne({ correo });
  if (!user) {
    throw new Error('Usuario no encontrado');
  }
  return user._id;
};

exports.addToWishlist = async (req, res) => {
  try {
    const userId = await getUserId(req.infoUsuario.correo);
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'productId es requerido' });
    }

    const existing = await Wishlist.findOne({ user: userId, product: productId });
    if (existing) {
      return res.status(400).json({ message: 'El producto ya está en favoritos' });
    }

    const wishlistItem = new Wishlist({ user: userId, product: productId });
    await wishlistItem.save();

    res.status(201).json({ message: 'Producto agregado a favoritos', wishlistItem });
  } catch (error) {
    console.error('[addToWishlist] Error:', error.message);
    res.status(500).json({ message: 'Error al agregar a favoritos', error: error.message });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const userId = await getUserId(req.infoUsuario.correo);

    const wishlist = await Wishlist.find({ user: userId })
      .populate({
        path: 'product',
        select: 'nombre marca precio imageUrl images stock category descripcion isOffer isNew precioAnterior porcentajeDescuento ventas'
      })
      .sort({ createdAt: -1 });

    res.json(wishlist);
  } catch (error) {
    console.error('[getWishlist] Error:', error.message);
    res.status(500).json({ message: 'Error al obtener favoritos', error: error.message });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const userId = await getUserId(req.infoUsuario.correo);
    const { productId } = req.params;

    const result = await Wishlist.findOneAndDelete({ user: userId, product: productId });
    if (!result) {
      return res.status(404).json({ message: 'Producto no encontrado en favoritos' });
    }

    res.json({ message: 'Producto eliminado de favoritos' });
  } catch (error) {
    console.error('[removeFromWishlist] Error:', error.message);
    res.status(500).json({ message: 'Error al eliminar de favoritos', error: error.message });
  }
};

exports.checkWishlist = async (req, res) => {
  try {
    const userId = await getUserId(req.infoUsuario.correo);
    const { productId } = req.params;

    const item = await Wishlist.findOne({ user: userId, product: productId });
    res.json({ isFavorite: !!item });
  } catch (error) {
    console.error('[checkWishlist] Error:', error.message);
    res.status(500).json({ message: 'Error al verificar favorito', error: error.message });
  }
};
