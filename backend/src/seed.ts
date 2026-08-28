import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getModelToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';

async function seedDatabase() {
  const app = await NestFactory.createApplicationContext(AppModule);

  // Get models
  const userModel = app.get(getModelToken('User'));
  const serviceModel = app.get(getModelToken('BeautyService'));
  const staffModel = app.get(getModelToken('Staff'));
  const productModel = app.get(getModelToken('Product'));
  const appointmentModel = app.get(getModelToken('Appointment'));
  const orderModel = app.get(getModelToken('Order'));
  const paymentModel = app.get(getModelToken('Payment'));

  console.log('🌱 Seeding database...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Clear existing data
  await userModel.deleteMany({});
  await serviceModel.deleteMany({});
  await staffModel.deleteMany({});
  await productModel.deleteMany({});
  await appointmentModel.deleteMany({});
  await orderModel.deleteMany({});
  await paymentModel.deleteMany({});

  console.log('🗑️  Cleared old data');

  // ========================================
  // 👨‍💼 ADMIN USERS (Can access Admin Dashboard)
  // ========================================
  const adminPassword = await bcrypt.hash('admin123', 12);
  const superAdminPassword = await bcrypt.hash('super123', 12);

  const _adminUsers = await userModel.create([
    {
      name: 'Admin Kumar',
      email: 'admin@beauty.com',
      phone: '9876543210',
      password: adminPassword,
      role: 'admin',
      status: 'active',
      address: 'Shop No. 5, MG Road, Hyderabad',
    },
    {
      name: 'Super Admin',
      email: 'superadmin@beauty.com',
      phone: '9876543211',
      password: superAdminPassword,
      role: 'superadmin',
      status: 'active',
      address: 'Admin Office, Banjara Hills, Hyderabad',
    },
  ]);
  console.log('✅ Admin Users seeded (2 admins)');

  // ========================================
  // 👩‍💼 STAFF MEMBERS (Employees)
  // ========================================
  const staff = await staffModel.create([
    {
      name: 'Anitha',
      role: 'Senior Stylist',
      phone: '9876543101',
      specialization: 'Hair Stylist',
      availability: true,
      status: 'active',
    },
    {
      name: 'Kavitha',
      role: 'Skin Specialist',
      phone: '9876543102',
      specialization: 'Skin Care Expert',
      availability: true,
      status: 'active',
    },
    {
      name: 'Sunitha',
      role: 'Nail Technician',
      phone: '9876543103',
      specialization: 'Nail Artist',
      availability: true,
      status: 'active',
    },
    {
      name: 'Deepa',
      role: 'Bridal Expert',
      phone: '9876543104',
      specialization: 'Bridal Specialist',
      availability: true,
      status: 'active',
    },
    {
      name: 'Ramya',
      role: 'Junior Stylist',
      phone: '9876543105',
      specialization: 'Hair Care',
      availability: true,
      status: 'active',
    },
  ]);
  console.log('✅ Staff Members seeded (5 staff)');

  // ========================================
  // 💇 SERVICES
  // ========================================
  const services = await serviceModel.create([
    {
      name: 'Hair Cut – Women',
      category: 'hair',
      duration: 45,
      price: 500,
      description: 'Professional haircut with styling and blow dry',
      popular: true,
      isActive: true,
    },
    {
      name: 'Hair Coloring',
      category: 'hair',
      duration: 90,
      price: 2500,
      description: 'Full color, highlights, balayage, ombre',
      popular: true,
      isActive: true,
    },
    {
      name: 'Hair Deep Conditioning',
      category: 'hair',
      duration: 60,
      price: 1200,
      description: 'Deep conditioning treatment for healthy hair',
      isActive: true,
    },
    {
      name: 'Keratin Treatment',
      category: 'hair',
      duration: 120,
      price: 5000,
      description: 'Smoothing and frizz-free keratin straightening',
      isActive: true,
    },
    {
      name: 'Classic Facial',
      category: 'skin',
      duration: 45,
      price: 800,
      description: 'Deep cleansing, exfoliation and hydration',
      popular: true,
      isActive: true,
    },
    {
      name: 'Gold Facial',
      category: 'skin',
      duration: 60,
      price: 1500,
      description: 'Luxury gold-infused anti-aging treatment',
      isActive: true,
    },
    {
      name: 'Cleanup',
      category: 'skin',
      duration: 30,
      price: 500,
      description: 'Quick skin refresh with cleansing and toning',
      isActive: true,
    },
    {
      name: 'Manicure',
      category: 'nails',
      duration: 30,
      price: 400,
      description: 'Classic manicure with nail shaping and polish',
      isActive: true,
    },
    {
      name: 'Pedicure',
      category: 'nails',
      duration: 45,
      price: 500,
      description: 'Relaxing foot care with nail shaping and polish',
      isActive: true,
    },
    {
      name: 'Gel Nails',
      category: 'nails',
      duration: 60,
      price: 1200,
      description: 'Long-lasting gel polish with nail art options',
      isActive: true,
    },
    {
      name: 'Bridal Makeup',
      category: 'bridal',
      duration: 120,
      price: 15000,
      description: 'HD makeup with trial session included',
      popular: true,
      isActive: true,
    },
    {
      name: 'Party Makeup',
      category: 'bridal',
      duration: 60,
      price: 3000,
      description: 'Glam makeup for special occasions',
      isActive: true,
    },
  ]);
  console.log('✅ Services seeded (12 services)');

  // ========================================
  // 🛍️ PRODUCTS
  // ========================================
  const products = await productModel.create([
    {
      name: 'Keratin Shampoo',
      category: 'hair',
      price: 650,
      originalPrice: 800,
      rating: 4.5,
      bestseller: true,
      stock: 25,
      isActive: true,
      image: '/products/keratin-shampoo.png',
    },
    {
      name: 'Argan Oil Conditioner',
      category: 'hair',
      price: 550,
      rating: 4.3,
      stock: 18,
      isActive: true,
      image: '/products/argan-conditioner.png',
    },
    {
      name: 'Hair Serum – Silk Shine',
      category: 'hair',
      price: 480,
      rating: 4.7,
      bestseller: true,
      stock: 30,
      isActive: true,
      image: '/products/hair-serum.png',
    },
    {
      name: 'Vitamin C Face Wash',
      category: 'skin',
      price: 350,
      rating: 4.6,
      bestseller: true,
      stock: 40,
      isActive: true,
      image: '/products/vit-c-facewash.png',
    },
    {
      name: 'Hyaluronic Moisturizer',
      category: 'skin',
      price: 890,
      originalPrice: 1100,
      rating: 4.8,
      stock: 15,
      isActive: true,
      image: '/products/hyaluronic-moisturizer.png',
    },
    {
      name: 'Sunscreen SPF 50+',
      category: 'skin',
      price: 420,
      rating: 4.4,
      stock: 35,
      isActive: true,
      image: '/products/sunscreen-spf50.png',
    },
    {
      name: 'Night Repair Cream',
      category: 'skin',
      price: 1250,
      rating: 4.5,
      stock: 10,
      isActive: true,
      image: '/products/night-repair-cream.png',
    },
    {
      name: 'Matte Lipstick Set',
      category: 'makeup',
      price: 1200,
      rating: 4.6,
      stock: 20,
      isActive: true,
      image: '/products/matte-lipstick-set.png',
    },
    {
      name: 'Foundation – Natural Glow',
      category: 'makeup',
      price: 980,
      rating: 4.3,
      bestseller: true,
      stock: 22,
      isActive: true,
      image: '/products/foundation-glow.png',
    },
    {
      name: 'Gel Nail Polish Kit',
      category: 'nails',
      price: 850,
      rating: 4.4,
      stock: 28,
      isActive: true,
      image: '/products/gel-nail-kit.png',
    },
    {
      name: 'Leave-In Hair Mask',
      category: 'hair',
      price: 720,
      rating: 4.2,
      stock: 12,
      isActive: true,
      image: '/products/hair-mask.png',
    },
    {
      name: 'Eye Shadow Palette',
      category: 'makeup',
      price: 1500,
      originalPrice: 1800,
      rating: 4.7,
      stock: 14,
      isActive: true,
      image: '/products/eyeshadow-palette.png',
    },
    {
      name: 'Nail Art Stickers',
      category: 'nails',
      price: 250,
      rating: 4.1,
      stock: 50,
      isActive: true,
      image: '/products/nail-stickers.png',
    },
    {
      name: 'Cuticle Oil',
      category: 'nails',
      price: 320,
      rating: 4.3,
      stock: 38,
      isActive: true,
      image: '/products/cuticle-oil.png',
    },
    {
      name: 'Professional Hair Dryer',
      category: 'tools',
      price: 2800,
      originalPrice: 3500,
      rating: 4.8,
      bestseller: true,
      stock: 8,
      isActive: true,
      image: '/products/hair-dryer.png',
    },
    {
      name: 'Straightening Iron',
      category: 'tools',
      price: 2200,
      rating: 4.5,
      stock: 10,
      isActive: true,
      image: '/products/straightening-iron.png',
    },
    {
      name: 'Makeup Brush Set (12 pcs)',
      category: 'tools',
      price: 1100,
      rating: 4.6,
      stock: 16,
      isActive: true,
      image: '/products/makeup-brushes.png',
    },
  ]);
  console.log('✅ Products seeded (17 products)');

  // ========================================
  // � CUSTOMER USERS (Can book appointments)
  // ========================================
  const customerPassword = await bcrypt.hash('customer123', 12);

  const customers = await userModel.create([
    {
      name: 'Priya Sharma',
      email: 'priya@example.com',
      phone: '9876500001',
      password: customerPassword,
      role: 'customer',
      status: 'active',
    },
    {
      name: 'Sneha Reddy',
      email: 'sneha@example.com',
      phone: '9876500002',
      password: customerPassword,
      role: 'customer',
      status: 'active',
    },
    {
      name: 'Meera Patel',
      email: 'meera@example.com',
      phone: '9876500003',
      password: customerPassword,
      role: 'customer',
      status: 'active',
    },
    {
      name: 'Anjali Singh',
      email: 'anjali@example.com',
      phone: '9876500004',
      password: customerPassword,
      role: 'customer',
      status: 'active',
    },
    {
      name: 'Divya Kumar',
      email: 'divya@example.com',
      phone: '9876500005',
      password: customerPassword,
      role: 'customer',
      status: 'active',
    },
    {
      name: 'Lakshmi Nair',
      email: 'lakshmi@example.com',
      phone: '9876500006',
      password: customerPassword,
      role: 'customer',
      status: 'active',
    },
    {
      name: 'Pooja Rao',
      email: 'pooja@example.com',
      phone: '9876500007',
      password: customerPassword,
      role: 'customer',
      status: 'active',
    },
  ]);
  console.log('✅ Customer Users seeded (7 customers)');

  // ========================================
  // �📅 APPOINTMENTS (Customer bookings)
  // ========================================
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  await appointmentModel.create([
    {
      userId: customers[0]._id,
      userName: customers[0].name,
      serviceId: services[0]._id,
      serviceName: services[0].name,
      staffId: staff[0]._id,
      staffName: staff[0].name,
      date: today.toISOString().split('T')[0],
      time: '10:00 AM',
      status: 'confirmed',
      notes: 'First time customer',
    },
    {
      userId: customers[1]._id,
      userName: customers[1].name,
      serviceId: services[5]._id,
      serviceName: services[5].name,
      staffId: staff[1]._id,
      staffName: staff[1].name,
      date: today.toISOString().split('T')[0],
      time: '11:30 AM',
      status: 'confirmed',
      notes: 'Regular customer',
    },
    {
      userId: customers[2]._id,
      userName: customers[2].name,
      serviceId: services[10]._id, // Bridal Makeup
      serviceName: services[10].name,
      staffId: staff[4]._id,
      staffName: staff[4].name,
      date: today.toISOString().split('T')[0],
      time: '02:00 PM',
      status: 'pending',
      notes: 'Wants bridal consultation',
    },
    {
      userId: customers[3]._id,
      userName: customers[3].name,
      serviceId: services[11]._id, // Party Makeup
      serviceName: services[11].name,
      staffId: staff[3]._id,
      staffName: staff[3].name,
      date: tomorrow.toISOString().split('T')[0],
      time: '09:00 AM',
      status: 'confirmed',
      notes: 'Wedding on 25th',
    },
    {
      userId: customers[4]._id,
      userName: customers[4].name,
      serviceId: services[2]._id,
      serviceName: services[2].name,
      staffId: staff[0]._id,
      staffName: staff[0].name,
      date: tomorrow.toISOString().split('T')[0],
      time: '03:00 PM',
      status: 'pending',
      notes: 'Wants highlights',
    },
    {
      userId: customers[0]._id,
      userName: customers[0].name,
      serviceId: services[8]._id,
      serviceName: services[8].name,
      staffId: staff[2]._id,
      staffName: staff[2].name,
      date: dayAfter.toISOString().split('T')[0],
      time: '11:00 AM',
      status: 'pending',
      notes: '',
    },
    {
      userId: customers[5]._id,
      userName: customers[5].name,
      serviceId: services[6]._id,
      serviceName: services[6].name,
      staffId: staff[1]._id,
      staffName: staff[1].name,
      date: yesterday.toISOString().split('T')[0],
      time: '10:00 AM',
      status: 'completed',
      notes: 'Very satisfied',
    },
    {
      userId: customers[6]._id,
      userName: customers[6].name,
      serviceId: services[0]._id,
      serviceName: services[0].name,
      staffId: staff[4]._id,
      staffName: staff[4].name,
      date: yesterday.toISOString().split('T')[0],
      time: '04:00 PM',
      status: 'completed',
      notes: '',
    },
  ]);
  console.log('✅ Appointments seeded (8 appointments)');

  // ========================================
  // 🛒 ORDERS (Customer product purchases)
  // ========================================
  const orders = await orderModel.create([
    {
      userId: customers[0]._id,
      userName: customers[0].name,
      items: [
        {
          productId: products[0]._id,
          productName: products[0].name,
          quantity: 1,
          price: 650,
        },
        {
          productId: products[2]._id,
          productName: products[2].name,
          quantity: 2,
          price: 480,
        },
      ],
      totalPrice: 1610,
      status: 'completed',
    },
    {
      userId: customers[1]._id,
      userName: customers[1].name,
      items: [
        {
          productId: products[3]._id,
          productName: products[3].name,
          quantity: 1,
          price: 350,
        },
        {
          productId: products[5]._id,
          productName: products[5].name,
          quantity: 1,
          price: 420,
        },
      ],
      totalPrice: 770,
      status: 'processing',
    },
    {
      userId: customers[2]._id,
      userName: customers[2].name,
      items: [
        {
          productId: products[7]._id,
          productName: products[7].name,
          quantity: 1,
          price: 1200,
        },
      ],
      totalPrice: 1200,
      status: 'pending',
    },
  ]);
  console.log('✅ Orders seeded (3 orders)');

  // ========================================
  // 💳 PAYMENTS
  // ========================================
  await paymentModel.create([
    {
      orderId: orders[0]._id,
      amount: 1610,
      method: 'card',
      status: 'completed',
      transactionId: 'TXN001',
    },
    {
      orderId: orders[1]._id,
      amount: 770,
      method: 'upi',
      status: 'completed',
      transactionId: 'TXN002',
    },
  ]);
  console.log('✅ Payments seeded (2 payments)');

  // ========================================
  // 📊 SUMMARY
  // ========================================
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 DATABASE SEEDED SUCCESSFULLY!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n📊 DATABASE SUMMARY:');
  console.log('┌─────────────────────────────────────────────────────┐');
  console.log('│  Collection          │  Count                      │');
  console.log('├─────────────────────────────────────────────────────┤');
  console.log('│  👨‍💼 Admin Users       │  2 (admin, superadmin)      │');
  console.log('│  👩 Customer Users    │  8 customers                │');
  console.log('│  👩‍💼 Staff Members     │  6 employees                │');
  console.log('│  💇 Services          │  15 services                │');
  console.log('│  🛍️ Products          │  12 products                │');
  console.log('│  📅 Appointments      │  8 bookings                 │');
  console.log('│  🛒 Orders            │  3 orders                   │');
  console.log('│  💳 Payments          │  2 transactions             │');
  console.log('└─────────────────────────────────────────────────────┘');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await app.close();
}

seedDatabase().catch(console.error);
