const mongoose = require('mongoose');
const Product = require('./models/product.models');

async function cleanBrokenImages() {
  try {
    // You'll need to add your MongoDB URI here temporarily
    const MONGODB_URI = 'mongodb+srv://usuario:contraseña@cluster.mongodb.net/gamemasters?retryWrites=true&w=majority';
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products`);

    let updatedCount = 0;

    for (const product of products) {
      let needsUpdate = false;
      const updates = {};

      // Check imageUrl
      if (product.imageUrl) {
        const url = product.imageUrl;
        // If URL is broken (no http/https or contains broken patterns)
        if (!url.startsWith('http') || 
            url.includes('walmartimages') || 
            url.includes('gstatic') || 
            url.includes('encrypted-tbn') ||
            !url.includes('cloudinary') && !url.startsWith('/uploads/')) {
          console.log(`❌ Product "${product.nombre}": Removing broken imageUrl`);
          updates.imageUrl = '/img/placeholder.png';
          needsUpdate = true;
        }
      }

      // Check images array
      if (product.images && product.images.length > 0) {
        const newImages = product.images.map(img => {
          if (!img.startsWith('http') || 
              img.includes('walmartimages') || 
              img.includes('gstatic') || 
              img.includes('encrypted-tbn') ||
              !img.includes('cloudinary') && !img.startsWith('/uploads/')) {
            return '/img/placeholder.png';
          }
          return img;
        });
        
        if (JSON.stringify(newImages) !== JSON.stringify(product.images)) {
          updates.images = newImages;
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        await Product.findByIdAndUpdate(product._id, updates);
        updatedCount++;
        console.log(`✅ Updated product: ${product.nombre}`);
      }
    }

    console.log(`\n✅ Cleaned ${updatedCount} products`);
    mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

cleanBrokenImages();
