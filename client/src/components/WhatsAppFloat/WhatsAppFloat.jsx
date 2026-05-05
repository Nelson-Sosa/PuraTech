import './WhatsAppFloat.css';

const PHONE = '595983986775';

const WhatsAppFloat = () => {
  const handleClick = () => {
    const message = encodeURIComponent(
      "Hola! 👋\n\nVi su tienda GameMasters y quisiera hacer una consulta."
    );

    const url = `https://wa.me/${PHONE}?text=${message}`;

    const win = window.open(url, '_blank');
    if (!win) {
      window.location.href = url;
    }
  };

  return (
    <button className="whatsapp-float" 
    onClick={handleClick}
     style={{ position: "fixed" }} >
      💬
    </button>
  );
};

export default WhatsAppFloat;