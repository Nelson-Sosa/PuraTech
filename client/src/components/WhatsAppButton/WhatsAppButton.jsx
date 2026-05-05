import React from 'react';
import './WhatsAppButton.css';

const WhatsAppButton = () => {
  const handleClick = () => {
    const message = `Hola! 👋\n\n` +
      `Vi su tienda online GameMasters y quisiera hacer una consulta.\n\n` +
      `Muchas gracias!`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/595981123456?text=${encodedMessage}`, '_blank');
  };

  return (
    <button className="whatsapp-float" onClick={handleClick} title="Consultar por WhatsApp">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="white" 
        width="28" 
        height="28"
      >
        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.32l-.708 2.572 2.686-.708c.88.47 1.804.72 2.771.727 3.179 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.766-5.771zm3.063 7.955c-.182-.09-.99-.487-1.143-.543-.154-.056-.266-.084-.378.084-.111.168-.434.543-.532.655-.098.112-.196.125-.378.042-.182-.084-.77-.283-1.466-.902-.542-.482-.908-1.078-1.014-1.26-.105-.182-.011-.28.079-.37.081-.081.182-.212.273-.318.091-.106.121-.182.182-.303.06-.121.03-.227-.015-.318-.045-.09-.378-.909-.518-1.244-.136-.326-.275-.282-.378-.287-.096-.005-.207-.006-.318-.006-.111 0-.303.042-.462.227-.159.184-.607.593-.607 1.447s.621 1.68.708 1.792c.087.112 1.227 1.874 2.978 2.627.416.18.74.287 1.049.367.308.107.588.09.809-.055.225-.146.99-.404 1.131-.644.143-.24.143-.445.1-.644-.043-.2-.182-.318-.273-.318z"/>
      </svg>
      <span className="whatsapp-tooltip">¡Consultanos!</span>
    </button>
  );
};

export default WhatsAppButton;
