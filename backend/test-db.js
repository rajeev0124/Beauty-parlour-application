const mongoose = require('mongoose');
const fs = require('fs');

async function testConnection() {
  try {
    const env = fs.readFileSync('.env', 'utf8');
    const uriLine = env.split('\n').find(l => l.startsWith('MONGODB_URI='));
    const uri = uriLine.substring('MONGODB_URI='.length).trim();
    
    console.log('Attempting to connect to MongoDB...');
    // Hide password for logging
    console.log('URI:', uri.replace(/:([^:@]+)@/, ':****@'));
    
    await mongoose.connect(uri);
    console.log('✅ SUCCESSFULLY CONNECTED TO MONGODB!');
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ CONNECTION FAILED:');
    console.error(error.message);
  }
}

testConnection();
