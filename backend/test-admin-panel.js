const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Test endpoints without authentication (should return 401 or 200 for public endpoints)
const testEndpoints = [
  { method: 'GET', url: '/announcements', expectStatus: 200 },
  { method: 'GET', url: '/rules', expectStatus: 200 },
  { method: 'GET', url: '/users', expectStatus: 401 },
  { method: 'GET', url: '/complaints', expectStatus: 401 },
  { method: 'GET', url: '/withdrawals', expectStatus: 401 },
  { method: 'GET', url: '/roles', expectStatus: 401 },
  { method: 'GET', url: '/admins', expectStatus: 401 },
  { method: 'GET', url: '/analytics/dashboard', expectStatus: 401 },
  { method: 'GET', url: '/reports', expectStatus: 401 },
  { method: 'GET', url: '/action-history', expectStatus: 401 },
  { method: 'GET', url: '/notifications/history', expectStatus: 401 },
  { method: 'GET', url: '/config', expectStatus: 401 },
  { method: 'GET', url: '/dashboard/admin-stats', expectStatus: 401 },
  { method: 'GET', url: '/leaderboard', expectStatus: 401 },
  { method: 'GET', url: '/points/balance', expectStatus: 401 },
  { method: 'GET', url: '/profiles', expectStatus: 401 },
];

async function testEndpoint(endpoint) {
  try {
    const response = await axios({
      method: endpoint.method,
      url: API_BASE + endpoint.url,
      timeout: 5000,
      validateStatus: () => true // Don't throw on any status code
    });
    
    const status = response.status;
    const expected = endpoint.expectStatus;
    const result = status === expected ? '✅' : '❌';
    
    console.log(`${result} ${endpoint.method} ${endpoint.url} - Status: ${status} (Expected: ${expected})`);
    
    return status === expected;
  } catch (error) {
    console.log(`❌ ${endpoint.method} ${endpoint.url} - Error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Testing Admin Panel API Endpoints');
  console.log('=====================================\n');
  
  let passed = 0;
  let total = testEndpoints.length;
  
  for (const endpoint of testEndpoints) {
    const success = await testEndpoint(endpoint);
    if (success) passed++;
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between requests
  }
  
  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 ALL TESTS PASSED! Admin panel API is fully functional.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the endpoints above.');
  }
  
  // Test admin login endpoint specifically
  console.log('\n🔐 Testing Admin Login Endpoint:');
  try {
    const loginResponse = await axios.post(API_BASE + '/auth/admin/login', {
      email: 'test@admin.com',
      password: 'wrongpassword'
    }, { validateStatus: () => true });
    
    if (loginResponse.status === 400 || loginResponse.status === 401) {
      console.log('✅ Admin login endpoint working (returns proper error for invalid credentials)');
    } else {
      console.log(`❌ Admin login endpoint issue - Status: ${loginResponse.status}`);
    }
  } catch (error) {
    console.log(`❌ Admin login endpoint error: ${error.message}`);
  }
}

runTests().catch(console.error);