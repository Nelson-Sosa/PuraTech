import React, { useState, useEffect, useCallback, memo } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';
import { useToast } from '../../Toast/ToastContext';
import './ProductReviews.css';

// ── Componentes de UI internos ──

const StarRating = ({ rating }) => {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={`star ${star <= rating ? 'filled' : ''}`}>
          ★
        </span>
      ))}
    </div>
  );
};

const ReviewSkeleton = memo(() => (
  <div className="review-card skeleton-container">
    <div className="skeleton-header">
      <div className="skeleton-avatar skeleton"></div>
      <div className="skeleton-meta">
        <div className="skeleton-line skeleton" style={{ width: '120px' }}></div>
        <div className="skeleton-line skeleton" style={{ width: '80px', height: '10px' }}></div>
      </div>
    </div>
    <div className="skeleton-stars skeleton" style={{ width: '100px', height: '16px', margin: '12px 0' }}></div>
    <div className="skeleton-line skeleton" style={{ width: '100%' }}></div>
    <div className="skeleton-line skeleton" style={{ width: '90%' }}></div>
  </div>
));

// ── Componente Principal ──

const ProductReviews = ({ productId }) => {
  const { showToast } = useToast();
  
  // Estados
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Estado de usuario y auth
  const [userEmail, setUserEmail] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);

  // Formulario
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Edición
  const [editingReviewId, setEditingReviewId] = useState(null);

  // Modal eliminar
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);

  // Cargar info del usuario al montar
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedEmail = localStorage.getItem('correo'); // GameMasters suele guardar correo o user
    
    if (storedToken) {
      setIsAuthenticated(true);
      setToken(storedToken);
      setUserEmail(storedEmail);
    }
  }, []);

  // Fetch reseñas y stats
  const fetchReviewsData = useCallback(async () => {
    try {
      setLoading(true);
      const [reviewsRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/api/reviews/product/${productId}`),
        axios.get(`${API_URL}/api/reviews/product/${productId}/stats`)
      ]);
      setReviews(reviewsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      showToast('Error al cargar las opiniones', 'error');
    } finally {
      setLoading(false);
    }
  }, [productId, showToast]);

  useEffect(() => {
    if (productId) {
      fetchReviewsData();
    }
  }, [productId, fetchReviewsData]);

  // Manejar submit (Crear o Actualizar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      return showToast('Por favor selecciona una calificación', 'error');
    }
    if (!comment.trim()) {
      return showToast('Por favor escribe un comentario', 'error');
    }

    try {
      setIsSubmitting(true);
      
      const config = {
        headers: { token_usuario: token }
      };

      if (editingReviewId) {
        // Actualizar
        await axios.put(
          `${API_URL}/api/reviews/${editingReviewId}`,
          { rating, comment },
          config
        );
        showToast('Reseña actualizada correctamente', 'success');
        setEditingReviewId(null);
      } else {
        // Crear
        await axios.post(
          `${API_URL}/api/reviews`,
          { productId, rating, comment },
          config
        );
        showToast('Reseña publicada correctamente', 'success');
      }
      
      // Limpiar y recargar
      setRating(0);
      setComment('');
      fetchReviewsData();
      
    } catch (error) {
      console.error('Error submitting review:', error);
      showToast(error.response?.data?.message || 'Error al publicar la reseña', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Preparar edición
  const handleEditClick = (review) => {
    setEditingReviewId(review._id);
    setRating(review.rating);
    setComment(review.comment);
    // Scroll suave hacia el formulario
    document.getElementById('review-form-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setRating(0);
    setComment('');
  };

  // Eliminar
  const confirmDelete = async () => {
    if (!reviewToDelete) return;
    try {
      await axios.delete(`${API_URL}/api/reviews/${reviewToDelete}`, {
        headers: { token_usuario: token }
      });
      showToast('Reseña eliminada', 'success');
      fetchReviewsData();
    } catch (error) {
      console.error('Error deleting review:', error);
      showToast(error.response?.data?.message || 'Error al eliminar', 'error');
    } finally {
      setShowDeleteModal(false);
      setReviewToDelete(null);
    }
  };

  // ¿El usuario actual ya comentó? (Buscamos por correo en el populate)
  const userExistingReview = reviews.find(r => r.user?.correo === userEmail);
  const canReview = isAuthenticated && !userExistingReview;

  return (
    <div className="product-reviews-container">
      <h2 className="reviews-title">Opiniones de Clientes</h2>

      <div className="reviews-layout">
        
        {/* ── SECCIÓN IZQUIERDA: Estadísticas ── */}
        <div className="reviews-stats-section">
          {loading ? (
            <div className="skeleton-stats skeleton" style={{height: '200px'}}></div>
          ) : stats ? (
            <div className="stats-box">
              <div className="average-header">
                <span className="avg-number">{stats.averageRating.toFixed(1)}</span>
                <div className="avg-stars">
                  <StarRating rating={Math.round(stats.averageRating)} />
                  <span className="total-reviews">Basado en {stats.totalReviews} opiniones</span>
                </div>
              </div>

              <div className="distribution-bars">
                {[5, 4, 3, 2, 1].map(star => {
                  const count = stats.distribution[star] || 0;
                  const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                  
                  return (
                    <div key={star} className="dist-row">
                      <span className="dist-star-label">{star} ★</span>
                      <div className="dist-bar-bg">
                        <div className="dist-bar-fill" style={{ width: `${percentage}%` }}></div>
                      </div>
                      <span className="dist-count">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* Formulario / CTA Login */}
          <div className="review-form-wrapper" id="review-form-section">
            {!isAuthenticated ? (
              <div className="login-cta-box">
                <p>Debes iniciar sesión para dejar una reseña.</p>
              </div>
            ) : (canReview || editingReviewId) ? (
              <form className="review-form" onSubmit={handleSubmit}>
                <h3>{editingReviewId ? 'Editar tu reseña' : 'Escribe una reseña'}</h3>
                
                <div className="star-selector">
                  <span className="star-label">Tu calificación:</span>
                  <div className="stars-interactive">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span 
                        key={star}
                        className={`star-select ${star <= (hoverRating || rating) ? 'active' : ''}`}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                <textarea 
                  className="review-textarea"
                  placeholder="¿Qué te pareció el producto? (máx 1000 caract.)"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={1000}
                  rows={4}
                ></textarea>

                <div className="form-actions">
                  {editingReviewId && (
                    <button type="button" className="btn-cancel-edit" onClick={handleCancelEdit}>
                      Cancelar
                    </button>
                  )}
                  <button type="submit" className="btn-submit-review" disabled={isSubmitting}>
                    {isSubmitting ? 'Publicando...' : (editingReviewId ? 'Actualizar' : 'Publicar reseña')}
                  </button>
                </div>
              </form>
            ) : (
              <div className="already-reviewed-box">
                <p>Ya dejaste una reseña para este producto.</p>
                <button 
                  className="btn-edit-existing"
                  onClick={() => handleEditClick(userExistingReview)}
                >
                  Editar mi reseña
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── SECCIÓN DERECHA: Lista de Reseñas ── */}
        <div className="reviews-list-section">
          {loading ? (
            <>
              <ReviewSkeleton />
              <ReviewSkeleton />
            </>
          ) : reviews.length === 0 ? (
            <div className="empty-reviews">
              <span className="empty-icon">📝</span>
              <p>Aún no hay opiniones.</p>
              <p className="empty-sub">Sé el primero en calificar este producto.</p>
            </div>
          ) : (
            <div className="reviews-list">
              {reviews.map(review => {
                // Chequear si esta reseña es del usuario logueado. 
                // Como el populate del backend nos trae el user, verificamos por correo
                // (Nota: Si guardaste el correo del usuario localmente al loguear, podes comparar aquí)
                const isAuthor = isAuthenticated && review.user?.correo === userEmail;

                return (
                  <div key={review._id} className={`review-card ${isAuthor ? 'is-author' : ''}`}>
                    <div className="review-header">
                      <div className="reviewer-info">
                        <div className="reviewer-avatar">
                          {review.user?.nombre?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <span className="reviewer-name">
                            {review.user?.nombre} {review.user?.apellido}
                          </span>
                          <span className="review-date">
                            {new Date(review.createdAt).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                      
                      {isAuthor && (
                        <div className="review-actions">
                          <button 
                            className="btn-icon edit" 
                            title="Editar"
                            onClick={() => handleEditClick(review)}
                          >
                            ✏️
                          </button>
                          <button 
                            className="btn-icon delete" 
                            title="Eliminar"
                            onClick={() => {
                              setReviewToDelete(review._id);
                              setShowDeleteModal(true);
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="review-rating-display">
                      <StarRating rating={review.rating} />
                    </div>
                    
                    <p className="review-comment">{review.comment}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── MODAL ELIMINAR ── */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content delete-modal">
            <h3>¿Eliminar reseña?</h3>
            <p>Esta acción no se puede deshacer.</p>
            <div className="modal-buttons">
              <button className="btn-cancel" onClick={() => setShowDeleteModal(false)}>Cancelar</button>
              <button className="btn-confirm-delete" onClick={confirmDelete}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(ProductReviews);
