const mongoose = require('mongoose');
const db = require('./config/db');
const User = require('./models/User');
const Admin = require('./models/Admin');
const bcrypt = require('bcryptjs');

db.connect();

const seed = async () => {
  await User.deleteMany({});
  await Admin.deleteMany({});
  await User.create({ name: 'Test User', mobile: '1234567890', points: 100 });
  await Admin.create({ email: 'admin@example.com', password: await bcrypt.hash('password', 10), name: 'Admin', role: 'super_admin', permissions: ['all'] });
  console.log('Data seeded');
  mongoose.connection.close();
};

seed();