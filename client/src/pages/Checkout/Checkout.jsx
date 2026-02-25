import CheckoutForm from "../../components/CheckoutForm/CheckoutForm";
import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import axios from "axios";
import { API_URL} from '../../config';
import './Checkout.css';
const stripePromise = loadStripe('pk_test_51PxDMmRt6zQTXipITWkIwDzvLWs9t6dsBRAsxXWf3rA3t7AaCXBbGI3N0EJk3Kv1yhcHPbsDZRRAm8GExsOcSfS100lW2AKtm0');

const Checkout = () => {
    const [clientSecret, setClientSecret] = useState('');
    const [error, setError] = useState(null);

    useEffect(() =>{
        // Realiza una solicitud POST al backend para crear la intención de pago
        axios.post(`${API_URL}/api/create-payment-intent`, {cantidad: 5000})// Monto en centavos
        .then(response => setClientSecret(response.data.clientSecret)) // Almacena el clientSecret si la solicitud es exitosa
        .catch(error => setError("Error al crear intentoPago")); // Muestra un error si la solicitud falla
    }, []);


    return (
      <div className="payment-container">
  {clientSecret ? (
    <Elements stripe={stripePromise}>
      <CheckoutForm clientSecret={clientSecret} />
    </Elements>
  ) : (
    <div className="loading">Cargando...</div>
  )}
  {error && <div className="error">{error}</div>}
</div>
    )
  };
  
  export default Checkout;