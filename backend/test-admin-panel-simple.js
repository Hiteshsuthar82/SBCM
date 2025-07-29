const http = require('http');

const testEndpoints = [
  '/api/announcements',
  '/api/rules', 
  '/api/users',
  '/api/complaints',
  '/api/withdrawals',
  '/api/roles',
  '/api/admins',
  '/api/analytics/dashboard',
  '/api/reports',
  '/api/action-history',
  '/api/notifications/history',
  '/api/config',
  '/api/dashboard/admin-stats',
  '/api/leaderboard',
  '/api/points/balance',
  '/api/profiles'
];

function testEndpoint(path) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:5000${path}`, (res) => {
      const status = res.statusCode;
      const result = (status === 200 || status === 401) ? '✅' : '❌';
      console.log(`${result} GET ${path} - Status: ${status}`);
      resolve(status === 200 || status === 401);
    });
    
    req.on('error', (error) => {
      console.log(`❌ GET ${path} - Error: ${error.message}`);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log(`❌ GET ${path} - Timeout`);
      req.destroy();
      resolve(false);
    });
  });
}

async function runTests() {
  console.log('🧪 Testing Admin Panel API Endpoints');
  console.log('=====================================\n');
  
  let passed = 0;
  
  for (const endpoint of testEndpoints) {
    const success = await testEndpoint(endpoint);
    if (success) passed++;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`\n📊 Results: ${passed}/${testEndpoints.length} endpoints working`);
  
  if (passed === testEndpoints.length) {
    console.log('🎉 ALL ENDPOINTS WORKING! No 404 errors found.');
  } else {
    console.log('⚠️  Some endpoints may have issues.');
  }
}

runTests().catch(console.error);