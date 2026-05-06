// Quick backend diagnostic
const https = require('https');

async function testBackend(url, description) {
  return new Promise((resolve) => {
    console.log(`\n🔍 Testing: ${description}`);
    console.log(`   URL: ${url}`);
    
    https.get(url, { timeout: 10000 }, (res) => {
      console.log(`   ✅ Status: ${res.statusCode}`);
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (data.length > 0) {
          console.log(`   Response (first 200 chars): ${data.substring(0, 200)}`);
        }
        resolve(true);
      });
    }).on('error', (err) => {
      console.log(`   ❌ Error: ${err.message}`);
      resolve(false);
    }).on('timeout', function() {
      this.destroy();
      console.log(`   ❌ Timeout after 10s`);
      resolve(false);
    });
  });
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║         BACKEND DIAGNOSTICS - URL CHECKING             ║');
  console.log('╚════════════════════════════════════════════════════════╝');

  // Test different URL variations
  const urls = [
    ['https://beauty-pallour-application.onrender.com/', 'Root URL'],
    ['https://beauty-pallour-application.onrender.com/health', '/health endpoint'],
    ['https://beauty-pallour-application.onrender.com/api', '/api endpoint'],
    ['https://beauty-pallour-application.onrender.com/api/', '/api/ endpoint'],
    ['https://beauty-pallour-application.onrender.com/api/health', '/api/health endpoint'],
    ['https://beauty-pallour-application.onrender.com/api/services', '/api/services endpoint'],
  ];

  for (const [url, desc] of urls) {
    await testBackend(url, desc);
    // Small delay between requests
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('\n════════════════════════════════════════════════════════');
  console.log('Diagnostics complete. Check above for working endpoint.');
  console.log('════════════════════════════════════════════════════════\n');
}

main().catch(console.error);
