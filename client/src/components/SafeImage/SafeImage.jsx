import React, { useState, useEffect } from 'react';

const SafeImage = ({ src, alt, className, ...props }) => {
  const [imgSrc, setImgSrc] = useState('/img/placeholder.png');
  const [hasTried, setHasTried] = useState(false);

  useEffect(() => {
    if (!src) {
      setImgSrc('/img/placeholder.png');
      return;
    }

    // ONLY allow trusted URLs
    const isTrusted = () => {
      if (typeof src !== 'string') return false;
      
      // Cloudinary
      if (src.includes('res.cloudinary.com')) return true;
      
      // Local uploads
      if (src.startsWith('/uploads/') && src.includes('.')) return true;
      
      // Trusted domains
      const trusted = [
        'imgur.com',
        'i.imgur.com',
        'images.unsplash.com',
        'via.placeholder.com',
        'gamemasters-aqha.onrender.com'
      ];
      
      if (src.match(/^https?:\/\/.+/)) {
        return trusted.some(domain => src.includes(domain));
      }
      
      return false;
    };

    if (isTrusted()) {
      setImgSrc(src);
      setHasTried(false);
    } else {
      // Invalid URL - use placeholder directly
      setImgSrc('/img/placeholder.png');
    }
  }, [src]);

  const handleError = () => {
    if (!hasTried) {
      setHasTried(true);
      setImgSrc('/img/placeholder.png');
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt || 'Product image'}
      className={className}
      onError={handleError}
      {...props}
    />
  );
};

export default SafeImage;
