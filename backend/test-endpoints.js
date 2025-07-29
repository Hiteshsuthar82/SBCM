const express = require('express');
const app = express();

// Import all routes
const routes = require('./routes');

app.use(express.json());
app.use('/api', routes);

// Test all endpoints
const testEndpoints = [
  'GET /api/auth/verify',
  'GET /api/users',
  'GET /api/complaints',
  'GET /api/announcements',
  'GET /api/rules',
  'GET /api/withdrawals',
  'GET /api/roles',
  'GET /api/admins',
  'GET /api/analytics/dashboard',
  'GET /api/reports',
  'GET /api/reports/history',
  'GET /api/action-history',
  'GET /api/notifications/history',
  'GET /api/notifications/templates',
  'GET /api/config',
  'GET /api/dashboard/admin-stats',
  'GET /api/dashboard/user-stats',
  'GET /api/leaderboard',
  'GET /api/points/balance',
  'GET /api/points/history',
  'GET /api/profiles',
  'GET /api/bus-stops',
  'GET /api/quick-tours',
  'GET /api/fcm/tokens',
];

console.log('Available routes in the application:');
console.log('=====================================');

// Get all registered routes
function getRoutes(app) {
  const routes = [];
  
  app._router.stack.forEach(function(middleware) {
    if (middleware.route) {
      // Routes registered directly on the app
      const methods = Object.keys(middleware.route.methods);
      methods.forEach(method => {
        routes.push(`${method.toUpperCase()} ${middleware.route.path}`);
      });
    } else if (middleware.name === 'router') {
      // Router middleware
      middleware.handle.stack.forEach(function(handler) {
        if (handler.route) {
          const methods = Object.keys(handler.route.methods);
          methods.forEach(method => {
            const path = middleware.regexp.source
              .replace('\\/?', '')
              .replace('(?=\\/|$)', '')
              .replace(/\\\//g, '/')
              .replace(/\$.*/, '');
            routes.push(`${method.toUpperCase()} ${path}${handler.route.path}`);
          });
        }
      });
    }
  });
  
  return routes.sort();
}

// Start server temporarily to get routes
const server = app.listen(0, () => {
  const routes = getRoutes(app);
  
  console.log('Registered API endpoints:');
  routes.forEach(route => {
    console.log(`  ${route}`);
  });
  
  console.log('\nChecking for missing endpoints:');
  testEndpoints.forEach(endpoint => {
    const found = routes.some(route => route === endpoint);
    if (!found) {
      console.log(`  ❌ MISSING: ${endpoint}`);
    } else {
      console.log(`  ✅ FOUND: ${endpoint}`);
    }
  });
  
  server.close();
});

module.exports = app;