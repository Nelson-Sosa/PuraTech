const { MongooseError } = require('mongoose');
const Product = require('../models/product.models');
const Order = require('../models/order.model');
const { request } = require('express');
const Stripe = require('stripe');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
// Inicializamos Stripe con la clave secreta de prueba (sk_test_...)
const stripe = Stripe('sk_test_51PxDMmRt6zQTXipIoi6NdMsHncrdJJkErnnL4pe50T2kjpBOZ39jyNZw4GePqz0uPaPOs3ZEx8BDQ7nTUGpUiAHZ00W3n2ShcA');

// Helper function to download image from URL and save locally
const downloadImage = async (url, uploadsPath) => {
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
      timeout: 10000, // 10 second timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    // Get file extension from URL or default to .jpg
    const urlPath = new URL(url).pathname;
    const ext = path.extname(urlPath) || '.jpg';
    const filename = `img_${Date.now()}_${Math.random().toString(36).substring(7)}${ext}`;
    const filepath = path.join(uploadsPath, filename);

    // Save file
    const writer = fs.createWriteStream(filepath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(`/uploads/${filename}`));
      writer.on('error', reject);
    });
  } catch (error) {
    console.error('Error downloading image:', error.message);
    return null; // Return null if download fails
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
    
    res.json({
      bestsellers,
      offers,
      newProducts
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
    res.json(products);
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
    const uploadsPath = path.join(__dirname, '../uploads');

    // Procesar imagen principal (imageUrl)
    if (req.files && req.files.imageUrl) {
      // Archivo subido (multer lo guarda en el servidor)
      finalImageUrl = req.files.imageUrl[0].path;
    } else if (req.file) {
      // Archivo subido (multer lo guarda en el servidor)
      finalImageUrl = req.file.path;
    } else if (imageUrlText) {
      // URL externa: intentar descargar y guardar localmente
      const downloadedUrl = await downloadImage(imageUrlText.trim(), uploadsPath);
      finalImageUrl = downloadedUrl || imageUrlText.trim(); // Fallback to original URL if download fails
    }

    // Procesar múltiples imágenes
    if (req.files && req.files.additionalImages) {
      // Archivos subidos
      imagesArray = req.files.additionalImages.map(file => file.path);
    } else if (imagesJson) {
      try {
        const parsed = JSON.parse(imagesJson);
        // Si es un array de URLs
        if (Array.isArray(parsed)) {
          // Try to download each URL
          const downloadedImages = [];
          for (const url of parsed.map(url => url.trim()).filter(url => url)) {
            const downloaded = await downloadImage(url, uploadsPath);
            downloadedImages.push(downloaded || url); // Use downloaded URL or original
          }
          imagesArray = downloadedImages;
        } else if (typeof parsed === 'string' && parsed.trim()) {
          const downloaded = await downloadImage(parsed.trim(), uploadsPath);
          imagesArray = [downloaded || parsed.trim()];
        }
      } catch (e) {
        // Si no es JSON válido, verificar si es una sola URL o múltiples separadas por coma
        if (typeof imagesJson === 'string' && imagesJson.trim()) {
          const urls = imagesJson.split(',').map(url => url.trim()).filter(url => url);
          const downloadedImages = [];
          for (const url of urls) {
            const downloaded = await downloadImage(url, uploadsPath);
            downloadedImages.push(downloaded || url);
          }
          imagesArray = downloadedImages;
        }
      }
    }

    // Si no hay imagen principal pero hay imágenes, usar la primera como principal
    if (!finalImageUrl && imagesArray.length > 0) {
      finalImageUrl = imagesArray[0];
      imagesArray = imagesArray.slice(1); // Quitar la primera del array de adicionales
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
        updatedImages = updatedImages.filter(img => !deletedImages.includes(img));
      } catch (e) {
        console.error("Error parsing deletedImages:", e);
      }
    }
    
    // Agregar nuevas imágenes de archivos (reemplazos o nuevas)
    if (req.files && req.files.additionalImages) {
      const newImages = req.files.additionalImages.map(file => file.path);
      updatedImages = [...updatedImages, ...newImages];
    }
    
    // Agregar nuevas imágenes de URLs
    const uploadsPath = path.join(__dirname, '../uploads');
    if (imagesJson) {
      try {
        const parsed = JSON.parse(imagesJson);
        let urlImages = [];
        if (Array.isArray(parsed)) {
          urlImages = parsed.map(url => url.trim()).filter(url => url);
        } else if (typeof parsed === 'string' && parsed.trim()) {
          urlImages = [parsed.trim()];
        }
        // Download each image
        for (const url of urlImages) {
          const downloaded = await downloadImage(url, uploadsPath);
          if (downloaded) {
            updatedImages.push(downloaded);
          } else {
            updatedImages.push(url); // Fallback to original URL
          }
        }
      } catch (e) {
        // Si no es JSON, verificar si es string
        if (typeof imagesJson === 'string' && imagesJson.trim()) {
          const urls = imagesJson.split(',').map(url => url.trim()).filter(url => url);
          for (const url of urls) {
            const downloaded = await downloadImage(url, uploadsPath);
            if (downloaded) {
              updatedImages.push(downloaded);
            } else {
              updatedImages.push(url);
            }
          }
        }
      }
    }
    
    // Actualizar imagen principal si se proporciona
    let updatedImageUrl = currentProduct.imageUrl;
    if (req.files && req.files.imageUrl) {
      updatedImageUrl = req.files.imageUrl[0].path;
    } else if (req.body.imageUrlText) {
      // If text URL provided, download it
      const downloaded = await downloadImage(req.body.imageUrlText.trim(), uploadsPath);
      if (downloaded) {
        updatedImageUrl = downloaded;
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

module.exports.getProduct = (req, res) => {
  Product.findOne({ _id: req.params.id })
    .then(product => res.json(product))
    .catch(error => res.json(error));
};

module.exports.searchGlobal = async (req, res) => {
  try {
    const term = req.query.category?.trim();
    if (!term) return res.status(400).json({ message: 'El término de búsqueda es requerido' });

    console.log("BUSCANDO:", term);

    const product = await Product.find({
      $or: [
        { category: { $regex: term, $options: 'i' } },
        { nombre: { $regex: term, $options: 'i' } },
        { descripcion: { $regex: term, $options: 'i' } },
        { marca: { $regex: term, $options: 'i' } }
      ]
    });

    console.log("RESULTADOS:", product);
    res.json(product);

  } catch (err) {
    console.log("ERROR SEARCH:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports.agregarPago = async (req, res) => {
  const { cantidad } = req.body; // Monto en centavos
  try {
    // Crear la intención de pago con Stripe  
    const paymentIntent = await stripe.paymentIntents.create({
      amount: cantidad, // La cantidad se espera en centavos (100 = $1.00 USD)
      currency: 'usd',  // Moneda en la que se procesará el pago, en este caso, dólares estadounidenses
    });
    // Respondemos con el client_secret necesario para confirmar el pago en el frontend
    res.status(200).send({
      clientSecret: paymentIntent.client_secret, // Enviar client_secret al frontend
    });

  } catch(err) {
    console.error("Error en agregarPago:", err.message);
    res.status(500).send({ error: err.message });
  }
};

// Endpoint para meta de ventas mensual
module.exports.checkSalesMeta = async (req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const orders = await Order.find({
      createdAt: { $gte: startOfMonth },
      status: 'completed'
    });

    const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
    const meta = 5000; // Meta mensual de $5000
    const percentage = (totalSales / meta) * 100;

    res.json({
      totalSales,
      meta,
      percentage: Math.min(percentage, 100),
      achieved: percentage >= 50
    });
  } catch (err) {
    console.error("Error en checkSalesMeta:", err);
    res.status(500).json({ error: 'Error al verificar meta' });
  }
};
