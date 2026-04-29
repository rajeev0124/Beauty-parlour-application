require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function setupAdmin() {
  console.log('Connecting to MongoDB...');
  console.log('URI:', process.env.MONGODB_URI?.substring(0, 60) + '...');
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB!');
    
    // Define user schema
    const userSchema = new mongoose.Schema({
      name: String,
      email: { type: String, unique: true },
      phone: String,
      password: String,
      role: { type: String, default: 'customer' },
      status: { type: String, default: 'active' },
      address: String
    });
    
    const User = mongoose.models.User || mongoose.model('User', userSchema);
    
    // Check if admin exists
    const existingAdmin = await User.findOne({ email: 'admin@beauty.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email: admin@beauty.com');
      console.log('Password: admin123');
    } else {
      // Create admin
      const hashedPassword = await bcrypt.hash('admin123', 12);
      await User.create({
        name: 'Admin Kumar',
        email: 'admin@beauty.com',
        phone: '9876543210',
        password: hashedPassword,
        role: 'admin',
        status: 'active'
      });
      console.log('Created admin user!');
      console.log('Email: admin@beauty.com');
      console.log('Password: admin123');
    }
    
    // Check if customer exists
    const existingCustomer = await User.findOne({ email: 'customer@beauty.com' });
    
    if (!existingCustomer) {
      const hashedPassword = await bcrypt.hash('customer123', 12);
      await User.create({
        name: 'Test Customer',
        email: 'customer@beauty.com',
        phone: '9876543211',
        password: hashedPassword,
        role: 'customer',
        status: 'active'
      });
      console.log('Created customer user!');
      console.log('Email: customer@beauty.com');
      console.log('Password: customer123');
    }
    
    console.log('\n=== Login Credentials ===');
    console.log('Admin: admin@beauty.com / admin123');
    console.log('Customer: customer@beauty.com / customer123');
    
  } catch (error) {
    console.log('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

setupAdmin();
