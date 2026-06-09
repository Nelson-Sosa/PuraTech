import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import API_URL from '../config/api';
import { useToast } from '../components/Toast/ToastContext';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const toast = useToast();

  useEffect(() => {
    const handleStorage = () => {
      const current = localStorage.getItem('token');
      setToken(prev => prev !== current ? current : prev);
    };
    window.addEventListener('storage', handleStorage);
    const interval = setInterval(handleStorage, 1500);
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  const fetchFavorites = useCallback(async () => {
    if (!token) {
      setFavorites([]);
      setFavoriteIds(new Set());
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/wishlist`, {
        headers: { token_usuario: token }
      });
      const items = res.data || [];
      setFavorites(items);
      setFavoriteIds(new Set(
        items
          .map(item => {
            if (!item.product) return null;
            return typeof item.product === 'object' ? item.product._id : item.product;
          })
          .filter(Boolean)
      ));
    } catch (err) {
      console.error('[WishlistContext] Error fetching:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const addFavorite = async (productId) => {
    if (!token) {
      setAuthModalOpen(true);
      return { success: false, requiresAuth: true };
    }
    try {
      await axios.post(`${API_URL}/api/wishlist`,
        { productId },
        { headers: { token_usuario: token } }
      );
      await fetchFavorites();
      toast?.showToast('Producto agregado a favoritos', 'success');
      return { success: true };
    } catch (err) {
      if (err.response?.status === 400) {
        toast?.showToast('El producto ya está en favoritos', 'info');
        return { success: true };
      }
      console.error('[WishlistContext] Error adding:', err);
      toast?.showToast('Error al agregar a favoritos', 'error');
      return { success: false, error: err };
    }
  };

  const removeFavorite = async (productId) => {
    if (!token) {
      setAuthModalOpen(true);
      return { success: false, requiresAuth: true };
    }
    try {
      await axios.delete(`${API_URL}/api/wishlist/${productId}`, {
        headers: { token_usuario: token }
      });
      await fetchFavorites();
      toast?.showToast('Producto eliminado de favoritos', 'success');
      return { success: true };
    } catch (err) {
      console.error('[WishlistContext] Error removing:', err);
      toast?.showToast('Error al eliminar de favoritos', 'error');
      return { success: false, error: err };
    }
  };

  const toggleFavorite = useCallback(async (productId) => {
    if (favoriteIds.has(productId)) {
      return removeFavorite(productId);
    }
    return addFavorite(productId);
  }, [favoriteIds]);

  const isFavorite = useCallback((productId) => {
    return favoriteIds.has(productId);
  }, [favoriteIds]);

  const count = favorites.length;

  return (
    <WishlistContext.Provider value={{
      favorites,
      favoriteIds,
      loading,
      error,
      count,
      authModalOpen,
      setAuthModalOpen,
      fetchFavorites,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      isFavorite,
      toggleWishlist: toggleFavorite,
      isInWishlist: isFavorite,
    }}>
      {children}
    </WishlistContext.Provider>
  );
};
