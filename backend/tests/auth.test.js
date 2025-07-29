const request = require('supertest');
const app = require('../app'); // Adjust path if necessary

describe('Auth API', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', mobile: '9876543210' });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('sessionId');
    expect(res.body.data).toHaveProperty('message', 'OTP sent successfully');
  });

  it('should fail registration with invalid mobile', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', mobile: 'invalid' });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should login with valid OTP', async () => {
    // Assume sessionId from register, and bypass OTP
    const res = await request(app)
      .post('/api/auth/login')
      .send({ mobile: '9876543210', otp: '123456', sessionId: 'test-session' });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data).toHaveProperty('user');
  });

  it('should fail login with invalid OTP', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ mobile: '9876543210', otp: 'wrong', sessionId: 'test-session' });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Invalid OTP');
  });

  it('should admin login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/admin/login')
      .send({ email: 'admin@example.com', password: 'password' });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data).toHaveProperty('admin');
  });

  it('should fail admin login with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/admin/login')
      .send({ email: 'admin@example.com', password: 'wrong' });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Invalid credentials');
  });
});