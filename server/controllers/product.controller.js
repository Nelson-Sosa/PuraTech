const { MongooseError } = require('mongoose');
const Product = require('../models/product.models');
const Order = require('../models/order.model');
const cloudinary = require('../configuration/cloudinary');
const Stripe = require('stripe');

// Initialize Stripe
const stripe = Stripe('sk_test_51PxDMmRt6zQTXipIoi6NdMsHncrdJJkErnnL4pe50T2kjpBOZ39jyNZw4GePqz0uPaPOs3ZEx8BDQ7nTUGpUiAHZ00W3n2ShcA');

// Global helper: ONLY allow trusted domains for images
const isValidImageUrl = (url) => {
  if (!url) return false;
  
  // Cloudinary URLs are always valid
  if (url.includes('cloudinary.com')) return true;
  
  // Local uploads are valid
  if (url.startsWith('/uploads/')) return true;
  
  // ONLY allow specific trusted domains
  if (url.match(/^https?:\/\/.+/)) {
    const trustedDomains = [
      'cloudinary.com',
      'imgur.com',
      'unsplash.com',
      'images.unsplash.com',
      'via.placeholder.com',
      'placeholder.com',
      'gamemasters-aqha.onrender.com'
    ];
    
    const isTrusted = trustedDomains.some(domain => url.includes(domain));
    
    if (!isTrusted) {
      console.log('⚠️ Blocking untrusted URL:', url.substring(0, 80));
      return false;
    }
    
    return true;
  }
  
  return false;
};

// Helper function to upload image to Cloudinary
const uploadToCloudinary = async (imagePathOrUrl, options = {}) => {
  try {
    console.log('☁️ Uploading to Cloudinary:', typeof imagePathOrUrl === 'string' ? imagePathOrUrl.substring(0, 80) : 'file');
    
    const result = await cloudinary.uploader.upload(imagePathOrUrl, {
      folder: 'gamemasters/products',
      transformation: [
        { width: 1000, height: 1000, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ],
      ...options
    });
    
    console.log('✅ Cloudinary upload success:', result.secure_url);
    return {
      url: result.secure_url,
      public_id: result.public_id
    };
  } catch (error) {
    console.error('❌ Cloudinary upload failed:', error.message);
    return null;
  }
};

// Helper to extract public_id from Cloudinary URL
const getPublicIdFromUrl = (url) => {
  if (!url || !url.includes('cloudinary.com')) return null;
  try {
    const urlParts = url.split('/');
    const filename = urlParts[urlParts.length - 1];
    const publicId = filename.split('.')[0];
    return `gamemasters/products/${publicId}`;
  } catch (e) {
    return null;
  }
};

// Endpoints PÚBLICOS
module.exports.getPublicHome = async (req, res) => {
  try {
    const allProducts = await Product.find({});
    
    // Best sellers (ordenar por ventas)
    const bestsellers = await Product.find({}).sort({ ventas: -1 }).limit(4);
    
    // Ofertas
    const offers = await Product.find({ isOffer: true }).limit(4);
    
    // Nuevos
    const newProducts = await Product.find({ isNew: true }).limit(4);
    
    // Helper to check if URL is valid
    const isValidImageUrl = (url) => {
      if (!url) return false;
      if (url.includes('cloudinary.com')) return true;
      if (url.startsWith('/uploads/')) return true;
      if (url.match(/^https?:\/\/.+/)) {
        const blockedPatterns = [
          /walmartimages/i,
          /gstatic\.com/i,
          /encrypted-tbn/i,
          /facebook\.com.*\.(jpg|jpeg|png)/i
        ];
        return !blockedPatterns.some(p => p.test(url));
      }
      return false;
    };
    
    // Clean products data
    const cleanProduct = (p) => {
      const product = p.toObject();
      if (product.imageUrl && !isValidImageUrl(product.imageUrl)) {
        product.imageUrl = '/img/placeholder.png';
      }
      if (product.images && product.images.length > 0) {
        product.images = product.images.map(img => {
          if (!isValidImageUrl(img)) {
            return '/img/placeholder.png';
          }
          return img;
        });
      }
      return product;
    };
    
    res.json({
      bestsellers: bestsellers.map(cleanProduct),
      offers: offers.map(cleanProduct),
      newProducts: newProducts.map(cleanProduct)
    });
  } catch (err) {
    console.error("Error en getPublicHome:", err);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

module.exports.getPublicProducts = async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};
    if (category && category !== 'all') {
      query.category = new RegExp(category, 'i');
    }
    const products = await Product.find(query);
    
    // Helper to check if URL is valid
    const isValidImageUrl = (url) => {
      if (!url) return false;
      if (url.includes('cloudinary.com')) return true;
      if (url.startsWith('/uploads/')) return true;
      if (url.match(/^https?:\/\/.+/)) {
        const blockedPatterns = [
          /walmartimages/i,
          /gstatic\.com/i,
          /encrypted-tbn/i,
          /facebook\.com.*\.(jpg|jpeg|png)/i
        ];
        return !blockedPatterns.some(p => p.test(url));
      }
      return false;
    };
    
    // Clean products data
    const cleanedProducts = products.map(p => {
      const product = p.toObject();
      
      // Fix imageUrl
      if (product.imageUrl && !isValidImageUrl(product.imageUrl)) {
        product.imageUrl = '/img/placeholder.png';
      }
      
      // Fix images array
      if (product.images && product.images.length > 0) {
        product.images = product.images.map(img => {
          if (!isValidImageUrl(img)) {
            return '/img/placeholder.png';
          }
          return img;
        });
      }
      
      return product;
    });
    
    res.json(cleanedProducts);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

// Endpoints ADMIN (requieren token)
module.exports.agregarProducto = async (req, res) => {
  try {
    const { category, nombre, marca, precio, descripcion, isOffer, isNew, stock, imageUrlText, images: imagesJson } = req.body;

    let finalImageUrl = "";
    let imagesArray = [];

    // Procesar imagen principal (imageUrl)
    if (req.files && req.files.imageUrl) {
      // Archivo subido → Subir a Cloudinary
      const result = await uploadToCloudinary(req.files.imageUrl[0].path);
      if (result) {
        finalImageUrl = result.url;
      }
    } else if (req.file) {
      // Archivo subido → Subir a Cloudinary
      const result = await uploadToCloudinary(req.file.path);
      if (result) {
        finalImageUrl = result.url;
      }
    } else if (imageUrlText) {
      // URL externa → Subir a Cloudinary
      const result = await uploadToCloudinary(imageUrlText.trim());
      if (result) {
        finalImageUrl = result.url;
      }
    }

    // Procesar múltiples imágenes
    if (req.files && req.files.additionalImages) {
      // Archivos subidos → Subir a Cloudinary
      for (const file of req.files.additionalImages) {
        const result = await uploadToCloudinary(file.path);
        if (result) {
          imagesArray.push(result.url);
        }
      }
    } else if (imagesJson) {
      try {
        const parsed = JSON.parse(imagesJson);
        let urls = [];
        
        if (Array.isArray(parsed)) {
          urls = parsed.map(url => url.trim()).filter(url => url);
        } else if (typeof parsed === 'string' && parsed.trim()) {
          urls = [parsed.trim()];
        }
        
        // Subir cada URL a Cloudinary
        for (const url of urls) {
          const result = await uploadToCloudinary(url);
          if (result) {
            imagesArray.push(result.url);
          }
        }
      } catch (e) {
        // Si no es JSON, verificar si es múltiples URLs separadas por coma
        if (typeof imagesJson === 'string' && imagesJson.trim()) {
          const urls = imagesJson.split(',').map(url => url.trim()).filter(url => url);
          for (const url of urls) {
            const result = await uploadToCloudinary(url);
            if (result) {
              imagesArray.push(result.url);
            }
          }
        }
      }
    }

    // Si no hay imagen principal pero hay imágenes, usar la primera como principal
    if (!finalImageUrl && imagesArray.length > 0) {
      finalImageUrl = imagesArray[0];
      imagesArray = imagesArray.slice(1);
    }

    // Si no hay ninguna imagen
    if (!finalImageUrl && imagesArray.length === 0) {
      return res.status(400).json({ error: "Imagen no proporcionada (sube un archivo o envía un link)" });
    }

    const newProduct = await Product.create({
      category,
      nombre,
      marca,
      precio,
      descripcion,
      imageUrl: finalImageUrl,
      images: imagesArray,
      isOffer: isOffer || false,
      isNew: isNew !== false, // Por defecto es nuevo
      stock: stock || 10
    });

    console.log("New Product:", newProduct);
    res.json(newProduct);
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(400).json(err);
  }
};

module.exports.todosLosProductos = (req, res) => {
  Product.find()
    .then((Product) => {
      console.log("All Product:", Product);
      res.json(Product);
    })
    .catch((err) => {
      console.error("Error retrieving Products:", err);
      res.status(500).json(err);
    });
};

module.exports.removerProducto = (req, res) => {
  Product.deleteOne({ _id: req.params.id })
    .then(deleteProduct => res.json(deleteProduct))
    .catch(err => res.json(err));
};

module.exports.categoriaProductos = async (req, res) => {
  try {
    const { category } = req.query;
    const products = await Product.find(category ? { category } : {});
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

module.exports.updateProduct = async (req, res) => {
  try {
    const { category, nombre, marca, precio, descripcion, images: imagesJson, deletedImages: deletedImagesJson } = req.body;
    
    // Obtener producto actual
    const currentProduct = await Product.findById(req.params.id);
    if (!currentProduct) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Procesar imágenes eliminadas
    let updatedImages = currentProduct.images || [];
    if (deletedImagesJson) {
      try {
        const deletedImages = JSON.parse(deletedImagesJson);
        // Eliminar de Cloudinary si es necesario
        for (const img of deletedImages) {
          const publicId = getPublicIdFromUrl(img);
          if (publicId) {
            await cloudinary.uploader.destroy(publicId);
          }
        }
        updatedImages = updatedImages.filter(img => !deletedImages.includes(img));
      } catch (e) {
        console.error("Error parsing deletedImages:", e);
      }
    }
    
    // Agregar nuevas imágenes de archivos (reemplazos o nuevas)
    if (req.files && req.files.additionalImages) {
      for (const file of req.files.additionalImages) {
        const result = await uploadToCloudinary(file.path);
        if (result) {
          updatedImages.push(result.url);
        }
      }
    }
    
    // Agregar nuevas imágenes de URLs
    if (imagesJson) {
      try {
        const parsed = JSON.parse(imagesJson);
        let urlImages = [];
        
        if (Array.isArray(parsed)) {
          urlImages = parsed.map(url => url.trim()).filter(url => url);
        } else if (typeof parsed === 'string' && parsed.trim()) {
          urlImages = [parsed.trim()];
        }
        
        // Subir a Cloudinary
        for (const url of urlImages) {
          const result = await uploadToCloudinary(url);
          if (result) {
            updatedImages.push(result.url);
          }
        }
      } catch (e) {
        // Si no es JSON, verificar si es string
        if (typeof imagesJson === 'string' && imagesJson.trim()) {
          const urls = imagesJson.split(',').map(url => url.trim()).filter(url => url);
          for (const url of urls) {
            const result = await uploadToCloudinary(url);
            if (result) {
              updatedImages.push(result.url);
            }
          }
        }
      }
    }
    
    // Actualizar imagen principal si se proporciona
    let updatedImageUrl = currentProduct.imageUrl;
    if (req.files && req.files.imageUrl) {
      // Eliminar imagen anterior de Cloudinary
      if (updatedImageUrl) {
        const publicId = getPublicIdFromUrl(updatedImageUrl);
        if (publicId) await cloudinary.uploader.destroy(publicId);
      }
      const result = await uploadToCloudinary(req.files.imageUrl[0].path);
      if (result) {
        updatedImageUrl = result.url;
      }
    } else if (req.body.imageUrlText) {
      // Eliminar imagen anterior de Cloudinary
      if (updatedImageUrl) {
        const publicId = getPublicIdFromUrl(updatedImageUrl);
        if (publicId) await cloudinary.uploader.destroy(publicId);
      }
      const result = await uploadToCloudinary(req.body.imageUrlText.trim());
      if (result) {
        updatedImageUrl = result.url;
      }
    }
    
    // Si imageUrl fue eliminada, usar la primera de images
    if (updatedImageUrl && !updatedImages.includes(updatedImageUrl) && updatedImages.length > 0) {
      updatedImageUrl = updatedImages[0];
    }
    
    // Actualizar producto
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: req.params.id },
      {
        category: category || currentProduct.category,
        nombre: nombre || currentProduct.nombre,
        marca: marca || currentProduct.marca,
        precio: precio || currentProduct.precio,
        descripcion: descripcion || currentProduct.descripcion,
        imageUrl: updatedImageUrl,
        images: updatedImages
      },
      { new: true }
    );
    
    res.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(400).json(error);
  }
};

module.exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id });
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Helper to check if URL is valid - ONLY allow trusted sources
    const isValidImageUrl = (url) => {
      if (!url) return false;
      
      // Cloudinary URLs are always valid
      if (url.includes('cloudinary.com')) return true;
      
      // Local uploads are valid
      if (url.startsWith('/uploads/')) return true;
      
      // ONLY allow specific trusted domains
      if (url.match(/^https?:\/\/.+/)) {
        const trustedDomains = [
          'cloudinary.com',
          'imgur.com',
          'unsplash.com',
          'images.unsplash.com',
          'via.placeholder.com',
          'placeholder.com',
          'gamemasters-aqha.onrender.com'
        ];
        
        // Check if URL is from trusted domain
        const isTrusted = trustedDomains.some(domain => url.includes(domain));
        
        if (!isTrusted) {
          console.log('⚠️ Blocking untrusted URL:', url.substring(0, 80));
          return false;
        }
        
        return true;
      }
      
      return false;
    };

    // Fix imageUrl if broken
    if (product.imageUrl && !isValidImageUrl(product.imageUrl)) {
      product.imageUrl = '/img/placeholder.png';
    }

    // Fix images array if broken URLs
    if (product.images && product.images.length > 0) {
      product.images = product.images.map(img => {
        if (!isValidImageUrl(img)) {
          return '/img/placeholder.png';
        }
        return img;
      });
    }

    res.json(product);
  } catch (error) {
    console.error("Error getting product:", error);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
};

module.exports.searchGlobal = async (req, res) => {
  try {
    const term = req.query.category?.trim();
    if (!term) return res.status(400).json({ error: "Missing search term" });

    const regex = new RegExp(term, "i");
    const results = await Product.find({
      $or: [
        { nombre: regex },
        { marca: regex },
        { category: regex },
        { descripcion: regex }
      ]
    });

    res.json(results);
  } catch (error) {
    console.error("Error searching:", error);
    res.status(500).json({ error: "Error en la búsqueda" });
  }
};

module.exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, items } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Monto inválido" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: {
        items: JSON.stringify(items || [])
      }
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creando PaymentIntent:", error);
    res.status(500).json({ error: "Error al procesar el pago" });
  }
};

module.exports.getInventory = async (req, res) => {
  try {
    const products = await Product.find({ stock: { $gt: 0 } });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener inventario" });
  }
};
