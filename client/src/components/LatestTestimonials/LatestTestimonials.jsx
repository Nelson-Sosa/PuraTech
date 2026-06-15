import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';
import './LatestTestimonials.css';

const starIcons = (rating) => {
  const full = '★'.repeat(Math.min(5, Math.max(0, rating)));
  const empty = '☆'.repeat(5 - Math.min(5, Math.max(0, rating)));
  return full + empty;
};

const LatestTestimonials = () => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/reviews/latest`)
      .then(({ data }) => setReviews(data))
      .catch((err) => console.error('[LatestTestimonials] Error:', err));
  }, []);

  if (!reviews || reviews.length === 0) {
    return null; // Mientras no haya reseñas, no mostrar nada
  }

  return (
    <section className="testimonials-section">
      <h2>Lo que dicen nuestros clientes</h2>
      <div className="testimonials-grid">
        {reviews.map((rev) => (
          <div key={rev._id} className="testimonial-card">
            <div className="stars">{starIcons(rev.rating)}</div>
            <p>"{rev.comment}"</p>
            <span>
              — {rev.user?.nombre || 'Cliente'}{rev.user?.apellido ? ` ${rev.user.apellido.charAt(0)}.` : ''}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default LatestTestimonials;
