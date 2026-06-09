import { Link } from 'react-router-dom';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={e => e.stopPropagation()}>
        <button className="auth-modal__close" onClick={onClose} aria-label="Cerrar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="auth-modal__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>

        <h2 className="auth-modal__title">Iniciá sesión para guardar favoritos</h2>
        <p className="auth-modal__text">
          Necesitás tener una cuenta para agregar productos a tu lista de deseos y acceder a todas las funcionalidades.
        </p>

        <div className="auth-modal__actions">
          <Link to="/login" className="auth-modal__btn auth-modal__btn--primary" onClick={onClose}>
            Iniciar Sesión
          </Link>
          <Link to="/register" className="auth-modal__btn auth-modal__btn--secondary" onClick={onClose}>
            Crear Cuenta
          </Link>
        </div>

        <button className="auth-modal__continue" onClick={onClose}>
          Seguir navegando
        </button>
      </div>
    </div>
  );
};

export default AuthModal;
