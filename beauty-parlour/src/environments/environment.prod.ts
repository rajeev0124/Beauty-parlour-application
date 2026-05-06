export const environment = {
  production: true,
  // This will be replaced with actual deployed backend URL
  // For Render: https://your-app-name.onrender.com/api
  apiUrl: 'https://beauty-parlour-api.onrender.com/api',
  // Note: In production, configure RAZORPAY_KEY environment variable at build time
  // Fallback to test key for demo purposes
  razorpayKey: 'rzp_test_simulation',
  firebaseConfig: {
    apiKey: 'AIzaSyBzmssqi2wBHPKP-H5cRQwfERJ0RmV0RZk',
    authDomain: 'beauty-parlour-0124.firebaseapp.com',
    projectId: 'beauty-parlour-0124',
    storageBucket: 'beauty-parlour-0124.firebasestorage.app',
    messagingSenderId: '598823648066',
    appId: '1:598823648066:web:04c36c0a76de83a52026db'
  }
};
