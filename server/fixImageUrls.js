const mongoose = require('mongoose');
const Product = require('./models/product.models');
require('dotenv').config();

async function fixAllImageUrls() {
  try {
    // Connect to DB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all products
    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products`);

    let fixedCount = 0;

    for (const product of products) {
      let needsUpdate = false;
      const updates = {};

      // Fix imageUrl
      if (product.imageUrl) {
        let newUrl = product.imageUrl;
        
        // Check if it's a broken URL (no http/https)
        if (!newUrl.startsWith('http')) {
          // If it's a local file, ensure /uploads/ prefix
          if (!newUrl.startsWith('/uploads/')) {
            newUrl = `/uploads/${newUrl}`;
            updates.imageUrl = newUrl;
            needsUpdate = true;
          }
        } else if (newUrl.includes('walmartimages.com') || 
                   newUrl.includes('gstatic.com') || 
                   newUrl.includes('encrypted-tbn')) {
          // These are blocked URLs - replace with placeholder
          updates.imageUrl = '/img/placeholder.png';
          needsUpdate = true;
          console.log(`❌ Product "${product.nombre}": Replacing blocked URL with placeholder`);
        }
      }

      // Fix images array
      if (product.images && product.images.length > 0) {
        const newImages = product.images.map(img => {
          if (!img.startsWith('http')) {
            // Local file without /uploads/ prefix
            if (!img.startsWith('/uploads/')) {
              return `/uploads/${img}`;
            }
            return img;
          } else if (img.includes('walmartimages.com') || 
                     img.includes('gstatic.com') || 
                     img.includes('encrypted-tbn')) {
            // Blocked URL
            return '/img/placeholder.png';
          }
          return img;
        });
        
        // Check if images changed
        if (JSON.stringify(newImages) !== JSON.stringify(product.images)) {
          updates.images = newImages;
          needsUpdate = true;
        }
      }

      // Update product if needed
      if (needsUpdate) {
        await Product.findByIdAndUpdate(product._id, updates);
        fixedCount++;
        console.log(`✅ Fixed product: ${product.nombre}`);
      }
    }

    console.log(`\n✅ Fixed ${fixedCount} products`);
    mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.disconnect();
  }
}

fixAllImageUrls();
