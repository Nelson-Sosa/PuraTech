const mongoose = require('mongoose');
const Product = require('./models/product.models');

async function deleteAllProducts() {
  try {
    // REPLACE WITH YOUR ACTUAL CONNECTION STRING
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://usuario:password@cluster.mongodb.net/gamemasters?retryWrites=true&w=majority';
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const result = await Product.deleteMany({});
    console.log(`🗑️ Deleted: ${result.deletedCount} products`);
    
    mongoose.disconnect();
    console.log('✅ Database is CLEAN - All old products removed');
    console.log('   Now create NEW products with Cloudinary');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

deleteAllProducts();
