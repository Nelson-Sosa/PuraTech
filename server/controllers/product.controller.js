const { MongooseError } = require('mongoose');
const Product = require('../models/product.models');
const Order = require('../models/order.model');
const cloudinary = require('../configuration/cloudinary');

// Global helper: accept any valid URL
const isValidImageUrl = (url) => {
  if (!url) return false;
  
  // Local uploads are valid
  if (url.startsWith('/uploads/')) return true;
  
  // Any valid URL is accepted (relaxed validation)
  if (url.match(/^https?:\/\/.+/)) return true;
  
  return false;
};

// Helper function to upload image to Cloudinary
const uploadToCloudinary = async (source, options = {}) => {
  try {
    console.log('☁️ Uploading to Cloudinary:', typeof source === 'string' ? source.substring(0, 80) : 'buffer');

    const uploadOptions = {
      folder: 'gamemasters/products',
      transformation: [
        { width: 2000, height: 2000, crop: 'limit' },
        { quality: "auto:best", fetch_format: "auto" }
      ],
      ...options
    };

    let result;
    if (Buffer.isBuffer(source)) {
      // Upload from buffer (memory storage)
      result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        });
        stream.end(source);
      });
    } else {
      // Upload from URL or file path
      result = await cloudinary.uploader.upload(source, uploadOptions);
    }

    console.log('✅ Cloudinary upload success:', result.secure_url);
    return {
      url: result.secure_url,
      public_id: result.public_id
    };
  } catch (error) {
    console.error('❌ Cloudinary upload failed:', error.message);
    // If background removal add-on is not enabled, try without it
    if (error.message && error.message.includes('add-on')) {
      console.log('⚠️ Background removal add-on not enabled, retrying without it...');
      try {
        const retryOptions = {
          folder: 'gamemasters/products',
          transformation: [
            { width: 2000, height: 2000, crop: 'limit' },
            { quality: "auto:best", fetch_format: "auto" }
          ],
          ...options
        };
        let retryResult;
        if (Buffer.isBuffer(source)) {
          retryResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(retryOptions, (error, result) => {
              if (error) reject(error);
              else resolve(result);
            });
            stream.end(source);
          });
        } else {
          retryResult = await cloudinary.uploader.upload(source, retryOptions);
        }
        console.log('✅ Cloudinary upload success (without bg removal):', retryResult.secure_url);
        return {
          url: retryResult.secure_url,
          public_id: retryResult.public_id
        };
      } catch (retryError) {
        console.error('❌ Cloudinary retry also failed:', retryError.message);
        return null;
      }
    }
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
    
    // Best sellers (ordenar por ventas reales y luego por fecha de creación para evitar cambios aleatorios al actualizar)
    const bestsellers = await Product.find({}).sort({ ventas: -1, createdAt: -1 }).limit(4);
    
    // Ofertas activas por fecha
    const now = new Date();
    const offers = await Product.find({
      isOffer: true,
      $or: [
        { fechaFinOferta: null },
        { fechaFinOferta: { $exists: false } },
        { fechaFinOferta: { $gte: now } }
      ]
    }).limit(4);
    
    // Nuevos (marcados explícitamente con isNew: true)
    const newProducts = await Product.find({ 
      isNew: true
    }).sort({ createdAt: -1 }).limit(4);
    
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
    
    // Clean products data - keep original URLs
    const cleanProduct = (p) => {
      const product = p.toObject();
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
    
    // Helper to check if URL is valid - relaxed
    const isValidImageUrl = (url) => {
      if (!url) return false;
      if (url.startsWith('/uploads/')) return true;
      if (url.match(/^https?:\/\/.+/)) return true;
      return false;
    };
    
    // Clean products data - keep original URLs
    const cleanedProducts = products.map(p => p.toObject());
    
    res.json(cleanedProducts);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

// Endpoints ADMIN (requieren token)
module.exports.agregarProducto = async (req, res) => {
  try {
    const { category, nombre, marca, precio, descripcion, isOffer, isNew, stock, imageUrlText, images: imagesJson, lowStockThreshold, sku, precioAnterior, fechaInicioOferta, fechaFinOferta } = req.body;
    
    // Calcular porcentaje de descuento si corresponde
    let porcentajeDescuento = 0;
    if (precioAnterior && precio && Number(precioAnterior) > Number(precio)) {
        porcentajeDescuento = Math.round(((Number(precioAnterior) - Number(precio)) / Number(precioAnterior)) * 100);
    }

    let finalImageUrl = "";
    let imagesArray = [];

    // Procesar imagen principal (imageUrl)
    if (req.file) {
      // Subir imagen principal desde archivo a Cloudinary con eliminación de fondo
      const uploadResult = await uploadToCloudinary(req.file.buffer);
      finalImageUrl = uploadResult ? uploadResult.url : null;
      if (!finalImageUrl) {
        return res.status(500).json({ error: 'Error al subir la imagen principal desde archivo' });
      }
    } else if (imageUrlText) {
      // Subir imagen principal desde URL a Cloudinary con eliminación de fondo
      const uploadResult = await uploadToCloudinary(imageUrlText.trim());
      finalImageUrl = uploadResult ? uploadResult.url : null;
      if (!finalImageUrl) {
        return res.status(500).json({ error: 'Error al subir la imagen principal desde URL' });
      }
    }


    // Procesar múltiples imágenes - usando req.files
    if (req.files) {
      if (req.files.additionalImages) {
        // Archivos subidos → subir a Cloudinary (sin eliminación de fondo para ahorrar créditos)
        for (const file of req.files.additionalImages) {
          if (file && file.buffer) {
            const uploadResult = await uploadToCloudinary(file.buffer, {
              transformation: [
                { width: 2000, height: 2000, crop: 'limit' },
                { quality: "auto:best", fetch_format: "auto" }
              ]
            });
            if (uploadResult) {
              imagesArray.push(uploadResult.url);
            } else {
              console.warn('⚠️ [agregarProducto] Error al subir imagen adicional a Cloudinary');
            }
          }
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
        
        // Guardar URLs directamente (sin Cloudinary por ahora)
        imagesArray.push(...urlImages);
      } catch (e) {
        // Si no es JSON, verificar si es string
        if (typeof imagesJson === 'string' && imagesJson.trim()) {
          const urls = imagesJson.split(',').map(url => url.trim()).filter(url => url);
          imagesArray.push(...urls);
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
      isOffer: isOffer === 'true' || isOffer === true,
      isNew: isNew === 'false' || isNew === false ? false : true,
      precioAnterior: precioAnterior || null,
      porcentajeDescuento,
      fechaInicioOferta: fechaInicioOferta || null,
      fechaFinOferta: fechaFinOferta || null,
      stock: stock || 10,
      lowStockThreshold: lowStockThreshold || 5,
      sku: sku || null
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
  console.log("🔍 [removerProducto] req.params:", req.params);
  console.log("🔍 [removerProducto] req.infoUsuario:", req.infoUsuario);
  
  Product.deleteOne({ _id: req.params.id })
    .then(deleteProduct => {
      console.log("✅ [removerProducto] Deleted:", deleteProduct);
      res.json(deleteProduct);
    })
    .catch(err => {
      console.error("🔴 [removerProducto] Error:", err);
      res.json(err);
    });
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
    console.log("🔍 [updateProduct] req.body:", req.body);
    console.log("🔍 [updateProduct] req.params:", req.params);
    console.log("🔍 [updateProduct] req.file:", req.file);
    console.log("🔍 [updateProduct] req.files:", req.files);
    console.log("🔍 [updateProduct] req.infoUsuario:", req.infoUsuario);
    
    const { category, nombre, marca, precio, descripcion, images: imagesJson, deletedImages: deletedImagesJson, imageUrlText, isOffer, isNew, precioAnterior, fechaInicioOferta, fechaFinOferta } = req.body;
    
    // Obtener producto actual
    const currentProduct = await Product.findById(req.params.id);
    if (!currentProduct) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    console.log("🔍 [updateProduct] Current product:", currentProduct.nombre);
    console.log("🔍 [updateProduct] New values - category:", category, "nombre:", nombre, "marca:", marca, "precio:", precio);

    // Procesar imágenes eliminadas
    let updatedImages = [];
    try {
      const currentImages = currentProduct.images || [];
      // Combinar imageUrl con images para tener todas las imágenes actuales
      const allCurrentImages = currentProduct.imageUrl 
        ? [currentProduct.imageUrl, ...currentImages] 
        : currentImages;
      
      console.log("🔍 [updateProduct] allCurrentImages:", allCurrentImages);
      
      updatedImages = [...currentImages];
      if (deletedImagesJson) {
        const deletedImages = JSON.parse(deletedImagesJson);
        console.log("🔍 [updateProduct] deletedImages to process:", deletedImages);
        
        if (Array.isArray(deletedImages)) {
          updatedImages = updatedImages.filter(img => !deletedImages.includes(img));
          console.log("🔍 [updateProduct] after filter:", updatedImages);
        }
      }
    } catch (e) {
      console.error("🔴 Error processing deletedImages:", e);
      updatedImages = currentProduct.images || [];
    }
    
    // Agregar nuevas imágenes de archivos (reemplazos o nuevas)
    console.log("🔍 [updateProduct] Checking req.files:", req.files);
    if (req.files && req.files.additionalImages) {
      console.log("🔍 [updateProduct] additionalImages files:", req.files.additionalImages.length);
      for (const file of req.files.additionalImages) {
        if (file && file.buffer) {
          console.log("🔍 [updateProduct] Processing additional image");
          const uploadResult = await uploadToCloudinary(file.buffer, {
            transformation: [
              { width: 2000, height: 2000, crop: 'limit' },
              { quality: "auto:best", fetch_format: "auto" }
            ]
          });
          if (uploadResult) {
            updatedImages.push(uploadResult.url);
          } else {
            console.warn('⚠️ [updateProduct] Error al subir imagen adicional a Cloudinary');
          }
        }
      }
    }
    
    // Agregar nuevas imágenes de URLs
    if (imagesJson && typeof imagesJson === 'string' && imagesJson.trim()) {
      try {
        const isJson = imagesJson.startsWith('[') || imagesJson.startsWith('{');
        let urlImages = [];
        
        if (isJson) {
          const parsed = JSON.parse(imagesJson);
          if (Array.isArray(parsed)) {
            urlImages = parsed.map(url => url.trim()).filter(url => url);
          } else if (typeof parsed === 'string') {
            urlImages = [parsed.trim()];
          }
        } else {
          // Comma separated
          urlImages = imagesJson.split(',').map(url => url.trim()).filter(url => url);
        }
        
        if (urlImages.length > 0) {
          updatedImages.push(...urlImages);
        }
      } catch (e) {
        console.error("Error parsing imagesJson:", e);
        // Si falla el parseo, intentar como string simple
        if (typeof imagesJson === 'string' && imagesJson.trim()) {
          const urls = imagesJson.split(',').map(url => url.trim()).filter(url => url);
          updatedImages.push(...urls);
        }
      }
    }
    
    // Actualizar imagen principal si se proporciona
    let updatedImageUrl = currentProduct.imageUrl;
    if (req.files && req.files.imageUrl && req.files.imageUrl[0]) {
      // Nueva imagen desde archivo → subir a Cloudinary con eliminación de fondo
      const uploadResult = await uploadToCloudinary(req.files.imageUrl[0].buffer);
      updatedImageUrl = uploadResult ? uploadResult.url : null;
      if (!updatedImageUrl) {
        return res.status(500).json({ error: 'Error al subir la imagen principal desde archivo' });
      }
    } else if (imageUrlText) {
      // Nueva imagen desde URL → subir a Cloudinary con eliminación de fondo
      const uploadResult = await uploadToCloudinary(imageUrlText.trim());
      updatedImageUrl = uploadResult ? uploadResult.url : null;
      if (!updatedImageUrl) {
        return res.status(500).json({ error: 'Error al subir la imagen principal desde URL' });
      }
    }
    
    // Comprobar si la imagen principal fue eliminada y no reemplazada
    if (deletedImagesJson) {
      try {
        const deletedImages = JSON.parse(deletedImagesJson);
        if (Array.isArray(deletedImages) && deletedImages.includes(currentProduct.imageUrl)) {
          // Si la imagen original fue eliminada y no se subió una nueva
          if (updatedImageUrl === currentProduct.imageUrl) {
            updatedImageUrl = null;
          }
        }
      } catch (e) {
        console.error("Error parsing deletedImages for main image:", e);
      }
    }
    
    // Si no hay imagen principal, usar la primera de las adicionales
    if (!updatedImageUrl && updatedImages.length > 0) {
      updatedImageUrl = updatedImages.shift();
    }
    // Calculate descuento if needed
    let porcentajeDescuento = currentProduct.porcentajeDescuento || 0;
    const nuevoPrecio = precio || currentProduct.precio;
    const nuevoPrecioAnterior = precioAnterior !== undefined ? precioAnterior : currentProduct.precioAnterior;
    
    if (nuevoPrecioAnterior && nuevoPrecio && Number(nuevoPrecioAnterior) > Number(nuevoPrecio)) {
        porcentajeDescuento = Math.round(((Number(nuevoPrecioAnterior) - Number(nuevoPrecio)) / Number(nuevoPrecioAnterior)) * 100);
    } else if (!nuevoPrecioAnterior || Number(nuevoPrecioAnterior) <= Number(nuevoPrecio)) {
        porcentajeDescuento = 0;
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
        isOffer: isOffer !== undefined ? isOffer === 'true' || isOffer === true : currentProduct.isOffer,
        isNew: isNew !== undefined ? isNew === 'true' || isNew === true : currentProduct.isNew,
        precioAnterior: precioAnterior !== undefined ? (precioAnterior || null) : currentProduct.precioAnterior,
        porcentajeDescuento,
        fechaInicioOferta: fechaInicioOferta !== undefined ? (fechaInicioOferta || null) : currentProduct.fechaInicioOferta,
        fechaFinOferta: fechaFinOferta !== undefined ? (fechaFinOferta || null) : currentProduct.fechaFinOferta,
        imageUrl: updatedImageUrl,
        images: updatedImages
      },
      { new: true }
    );
    
    res.json(updatedProduct);
    console.log("✅ [updateProduct] Updated product:", updatedProduct);
  } catch (error) {
    console.error("🔴 [updateProduct] Error completo:", error);
    console.error("🔴 [updateProduct] Stack:", error.stack);
    res.status(500).json({ 
      error: "Error al actualizar producto", 
      message: error.message,
      details: error.stack 
    });
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
      
      // Allow any valid image URL (relaxed validation)
      if (url.match(/^https?:\/\/.+/)) {
        // Accept any URL that looks like an image
        return true;
      }
      
      return false;
    };

    // NO longer replacing valid URLs with placeholders
    // Just keep the original URLs as saved by the user

    res.json(product);
  } catch (error) {
    console.error("Error getting product:", error);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
};

module.exports.searchGlobal = async (req, res) => {
  try {
    const term = req.query.category?.trim();
    console.log("🔍 [searchGlobal] Término de búsqueda:", term);
    
    if (!term) return res.status(400).json({ error: "Missing search term" });

    const Category = require('../models/Category');

    // 1. Check if the term matches a category name or slug
    const regex = new RegExp(term, "i");
    const matchedCategory = await Category.findOne({
      $or: [
        { name: { $regex: regex } },
        { slug: { $regex: regex } }
      ],
      isActive: true
    });

    let categoryNames = [term]; // default: just the search term

    if (matchedCategory) {
      // 2. Collect all descendant category names recursively
      const collectDescendantNames = async (parentId) => {
        const children = await Category.find({ parentId, isActive: true });
        let names = [];
        for (const child of children) {
          names.push(child.name);
          const grandChildNames = await collectDescendantNames(child._id);
          names = names.concat(grandChildNames);
        }
        return names;
      };

      const descendantNames = await collectDescendantNames(matchedCategory._id);
      categoryNames = [matchedCategory.name, ...descendantNames];
      console.log("🔍 [searchGlobal] Categoría encontrada:", matchedCategory.name, "| Descendientes:", descendantNames);
    }

    // 3. Build regex patterns for all category names
    const categoryRegexes = categoryNames.map(n => new RegExp(n, "i"));

    // 4. Search products matching any of those category names OR the original term
    const results = await Product.find({
      $or: [
        { category: { $in: categoryRegexes } },
        { nombre: { $regex: regex } },
        { marca: { $regex: regex } },
        { category: { $regex: regex } },
        { descripcion: { $regex: regex } }
      ]
    }).limit(100);

    console.log("🔍 [searchGlobal] Resultados encontrados:", results.length);
    res.json(results);
  } catch (error) {
    console.error("🔴 Error searching:", error);
    res.status(500).json({ error: "Error en la búsqueda" });
  }
};

// ELIMINADO - Stripe removido
// module.exports.createPaymentIntent = async (req, res) => { }

module.exports.getInventory = async (req, res) => {
  try {
    const products = await Product.find({ stock: { $gt: 0 } });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener inventario" });
  }
};
