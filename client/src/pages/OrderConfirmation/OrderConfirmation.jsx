import { Link, useParams } from "react-router-dom";
import './OrderConfirmation.css';

const OrderConfirmation = () => {
  const { orderNumber } = useParams();

  return (
    <div className="order-confirmation-page">
      <div className="confirmation-card">
        <div className="confirmation-icon">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="40" fill="rgba(34, 197, 94, 0.12)" />
            <circle cx="40" cy="40" r="28" fill="rgba(34, 197, 94, 0.2)" />
            <path d="M28 40L36 48L52 32" stroke="var(--accent-green)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 className="confirmation-title">¡Gracias por tu compra!</h1>
        <p className="confirmation-subtitle">
          Tu pedido ha sido realizado correctamente.
        </p>

        <div className="order-number-box">
          <span className="order-number-label">Número de pedido</span>
          <span className="order-number-value">{orderNumber}</span>
        </div>

        <p className="confirmation-info">
          Podés consultar el estado de tu compra en la sección <strong>Mis pedidos</strong>.
          Te enviaremos actualizaciones sobre el estado de tu pedido.
        </p>

        <div className="confirmation-actions">
          <Link to="/mis-pedidos" className="btn-primary">
            Ver mis pedidos
          </Link>
          <Link to="/" className="btn-secondary">
            Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
