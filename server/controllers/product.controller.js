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
    // Clean and validate URL
    let cleanUrl = url.trim();
    
    // Remove everything after comma (multiple URLs pasted)
    if (cleanUrl.includes(',')) {
      cleanUrl = cleanUrl.split(',')[0].trim();
    }
    
    // Validate URL format
    if (!cleanUrl.match(/^https?:\/\/.+/)) {
      console.error('❌ Invalid URL format:', cleanUrl.substring(0, 50));
      return null;
    }
    
    console.log('🔄 Downloading image from:', cleanUrl.substring(0, 100));
    
    // Verify uploads directory exists
    if (!fs.existsSync(uploadsPath)) {
      console.log('📁 Creating uploads directory:', uploadsPath);
      fs.mkdirSync(uploadsPath, { recursive: true });
    }

    // Try with http instead of https if SSL fails
    let response;
    try {
      response = await axios({
        url: cleanUrl,
        method: 'GET',
        responseType: 'arraybuffer',
        timeout: 20000, // 20 second timeout
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://www.google.com/'
        },
        maxRedirects: 5,
        validateStatus: function (status) {
          return status >= 200 && status < 400; // Accept 3xx redirects
        }
      });
    } catch (sslError) {
      console.log('⚠️ SSL error, trying without SSL verification...');
      // Try with http if https fails
      if (cleanUrl.startsWith('https://')) {
        const httpUrl = cleanUrl.replace('https://', 'http://');
        console.log('🔄 Retrying with HTTP:', httpUrl.substring(0, 80));
        response = await axios({
          url: httpUrl,
          method: 'GET',
          responseType: 'arraybuffer',
          timeout: 20000,
          headers: {
            'User-Agent': 'Mozilla/5.0'
          }
        });
      } else {
        throw sslError;
      }
    }

    console.log('✅ Download response status:', response.status);
    console.log('✅ Content-Type:', response.headers['content-type']);

    // Validate it's actually an image
    const contentType = response.headers['content-type'] || '';
    if (!contentType.startsWith('image/')) {
      console.error('❌ Not an image! Content-Type:', contentType);
      return null;
    }

    // Get file extension from content-type or URL
    let ext = '.jpg';
    if (contentType.includes('png')) ext = '.png';
    else if (contentType.includes('webp')) ext = '.webp';
    else if (contentType.includes('gif')) ext = '.gif';
    else {
      // Try from URL
      try {
        const urlPath = new URL(cleanUrl).pathname;
        const urlExt = path.extname(urlPath);
        if (urlExt && urlExt.length <= 5) ext = urlExt;
      } catch (e) {}
    }

    const filename = `img_${Date.now()}_${Math.random().toString(36).substring(7)}${ext}`;
    const filepath = path.join(uploadsPath, filename);

    console.log('💾 Saving to:', filepath);

    // Save file
    fs.writeFileSync(filepath, response.data);
    
    // Verify file was saved
    if (fs.existsSync(filepath)) {
      console.log('✅ Image saved successfully:', `/uploads/${filename}`);
      console.log('   File size:', fs.statSync(filepath).size, 'bytes');
      return `/uploads/${filename}`;
    } else {
      console.error('❌ File not saved!');
      return null;
    }
  } catch (error) {
    console.error('❌ Error downloading image:', error.message);
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

    // Helper to clean and validate URL
    const cleanUrl = (url) => {
      if (!url) return null;
      url = url.trim();
      // Remove any appended URLs (after comma)
      if (url.includes(',')) {
        url = url.split(',')[0].trim();
      }
      // Ensure it's a valid HTTP(S) URL
      if (!url.match(/^https?:\/\/.+/)) {
        return null;
      }
      return url;
    };

    // Helper to ensure local path format
    const ensureLocalPath = (img) => {
      if (!img) return img;
      // If it's already a /uploads/ path, return as is
      if (img.startsWith('/uploads/')) return img;
      // If it's just a filename, add /uploads/ prefix
      if (!img.includes('/') && !img.includes('http')) {
        return `/uploads/${img}`;
      }
      return img;
    };

    // Procesar imagen principal (imageUrl)
    if (req.files && req.files.imageUrl) {
      // Archivo subido (multer lo guarda en el servidor)
      finalImageUrl = ensureLocalPath(req.files.imageUrl[0].path);
    } else if (req.file) {
      // Archivo subido (multer lo guarda en el servidor)
      finalImageUrl = ensureLocalPath(req.file.path);
    } else if (imageUrlText) {
      // URL externa: intentar descargar y guardar localmente
      const cleanedUrl = cleanUrl(imageUrlText);
      if (cleanedUrl) {
        console.log('🔄 Processing main image URL:', cleanedUrl.substring(0, 80));
        const downloadedUrl = await downloadImage(cleanedUrl, uploadsPath);
        if (downloadedUrl) {
          finalImageUrl = downloadedUrl;
          console.log('✅ Main image downloaded:', downloadedUrl);
        } else {
          console.error('❌ Download failed for main image, NOT saving');
          finalImageUrl = ""; // Don't save broken URL
        }
      }
    }

    // Procesar múltiples imágenes
    if (req.files && req.files.additionalImages) {
      // Archivos subidos
      imagesArray = req.files.additionalImages.map(file => ensureLocalPath(file.path));
    } else if (imagesJson) {
      try {
        const parsed = JSON.parse(imagesJson);
        // Si es un array de URLs
        if (Array.isArray(parsed)) {
          // Clean and try to download each URL
          const cleanedUrls = parsed.map(url => cleanUrl(url)).filter(url => url);
          console.log('🔄 Processing', cleanedUrls.length, 'additional image URLs');
          const downloadedImages = [];
          for (const url of cleanedUrls) {
            const downloaded = await downloadImage(url, uploadsPath);
            downloadedImages.push(downloaded || url); // Use downloaded URL or original
          }
          imagesArray = downloadedImages;
        } else if (typeof parsed === 'string' && parsed.trim()) {
          const cleanedUrl = cleanUrl(parsed);
          if (cleanedUrl) {
            const downloaded = await downloadImage(cleanedUrl, uploadsPath);
            imagesArray = [downloaded || cleanedUrl];
          }
        }
      } catch (e) {
        // Si no es JSON válido, verificar si es una sola URL o múltiples separadas por coma
        if (typeof imagesJson === 'string' && imagesJson.trim()) {
          const urls = imagesJson.split(',').map(url => cleanUrl(url)).filter(url => url);
          console.log('🔄 Processing', urls.length, 'comma-separated URLs');
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
    
    // Helper to clean URL
    const cleanImageUrl = (url) => {
      if (!url) return null;
      url = url.trim();
      // Remove any appended URLs (after comma or space with http)
      if (url.includes(',')) {
        url = url.split(',')[0].trim();
      }
      // Remove any special characters at the end
      url = url.replace(/[,\s]+$/, '');
      // Validate it's a proper HTTP(S) URL
      if (!url.match(/^https?:\/\/.+/)) {
        return null;
      }
      return url;
    };
    
    if (imagesJson) {
      try {
        const parsed = JSON.parse(imagesJson);
        let urlImages = [];
        if (Array.isArray(parsed)) {
          urlImages = parsed.map(url => cleanImageUrl(url)).filter(url => url);
        } else if (typeof parsed === 'string' && parsed.trim()) {
          const cleaned = cleanImageUrl(parsed);
          if (cleaned) urlImages = [cleaned];
        }
        console.log('🔄 Processing', urlImages.length, 'URLs for update');
        // Download each image
        for (const url of urlImages) {
          console.log('   Downloading:', url.substring(0, 80));
          const downloaded = await downloadImage(url, uploadsPath);
          if (downloaded) {
            console.log('   ✅ Downloaded:', downloaded);
            updatedImages.push(downloaded);
          } else {
            console.log('   ⚠️ Using original URL (download failed)');
            updatedImages.push(url); // Fallback to original URL
          }
        }
      } catch (e) {
        // Si no es JSON, verificar si es string
        if (typeof imagesJson === 'string' && imagesJson.trim()) {
          const urls = imagesJson.split(',').map(url => cleanImageUrl(url)).filter(url => url);
          console.log('🔄 Processing', urls.length, 'comma-separated URLs for update');
          for (const url of urls) {
            console.log('   Downloading:', url.substring(0, 80));
            const downloaded = await downloadImage(url, uploadsPath);
            if (downloaded) {
              console.log('   ✅ Downloaded:', downloaded);
              updatedImages.push(downloaded);
            } else {
              console.log('   ⚠️ Using original URL (download failed)');
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
      const cleanedUrl = cleanImageUrl(req.body.imageUrlText);
      if (cleanedUrl) {
        console.log('🔄 Updating main image from URL:', cleanedUrl.substring(0, 80));
        const downloaded = await downloadImage(cleanedUrl, uploadsPath);
        if (downloaded) {
          console.log('   ✅ Downloaded:', downloaded);
          updatedImageUrl = downloaded;
        } else {
          console.log('   ⚠️ Using original URL (download failed)');
          updatedImageUrl = cleanedUrl;
        }
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
