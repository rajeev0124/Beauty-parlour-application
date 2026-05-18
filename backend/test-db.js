const mongoose = require('mongoose');
const fs = require('fs');

const productImages = {
  'Keratin Shampoo': 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=500&auto=format&fit=crop&q=60',
  'Argan Oil Conditioner': 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=500&auto=format&fit=crop&q=60',
  'Hair Serum – Silk Shine': 'https://images.unsplash.com/photo-1608248597481-496100c80836?w=500&auto=format&fit=crop&q=60',
  'Vitamin C Face Wash': 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500&auto=format&fit=crop&q=60',
  'Hyaluronic Moisturizer': 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=500&auto=format&fit=crop&q=60',
  'Sunscreen SPF 50+': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=60',
  'Night Repair Cream': 'https://images.unsplash.com/photo-1608248597481-496100c80836?w=500&auto=format&fit=crop&q=60',
  'Matte Lipstick Set': 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&auto=format&fit=crop&q=60',
  'Foundation – Natural Glow': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&auto=format&fit=crop&q=60',
  'Gel Nail Polish Kit': 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500&auto=format&fit=crop&q=60',
  'Professional Hair Dryer': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60',
  'Straightening Iron': 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=500&auto=format&fit=crop&q=60'
};

async function updateProductImages() {
  try {
    const env = fs.readFileSync('.env', 'utf8');
    const uriLine = env.split('\n').find(l => l.startsWith('MONGODB_URI='));
    if (!uriLine) {
      throw new Error('MONGODB_URI not found in .env file');
    }
    const uri = uriLine.substring('MONGODB_URI='.length).trim();
    
    console.log('Connecting to MongoDB database...');
    await mongoose.connect(uri);
    console.log('✅ Connected successfully!');
    
    // Define quick product schema/model
    const ProductSchema = new mongoose.Schema({
      name: String,
      image: String
    }, { collection: 'products' });
    
    const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
    
    // Update each product
    for (const [name, imageUrl] of Object.entries(productImages)) {
      const res = await Product.updateMany(
        { name: new RegExp('^' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') },
        { $set: { image: imageUrl } }
      );
      console.log(`Updated product [${name}]: matches=${res.matchedCount}, modified=${res.modifiedCount}`);
    }
    
    console.log('🎉 Product image update complete!');
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Update failed:', error);
  }
}

updateProductImages();
