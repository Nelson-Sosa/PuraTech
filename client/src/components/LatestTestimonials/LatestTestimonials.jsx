import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';
import { useToast } from '../Toast/ToastContext';
import './LatestTestimonials.css';

const starIcons = (rating) => {
  const full = '★'.repeat(rating);
  const empty = '☆'.repeat(5 - rating);
  return full + empty;
};

const LatestTestimonials = () => {
  const [reviews, setReviews] = useState([]);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/reviews/latest`);
        setReviews(data);
      } catch (err) {
        console.error('Error fetching latest reviews', err);
        addToast({ message: 'No se pudieron cargar las reseñas destacadas', type: 'error' });
      }
    };
    fetchReviews();
  }, []);

  if (!reviews || reviews.length === 0) {
    // Elegante fallback: no mostrar nada
    return null;
  }

  return (
    <section className="testimonials-section">
      <h2>Lo que dicen nuestros clientes</h2>
      <div className="testimonials-grid">
        {reviews.map((rev) => (
          <div key={rev._id} className="testimonial-card">
            <div className="stars">{starIcons(rev.rating)}</div>
            <p className="comment">\"{rev.comment}\"</p>
            <span className="author">— {rev.user?.nombre || 'Cliente'} {rev.user?.apellido || ''}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default LatestTestimonials;
