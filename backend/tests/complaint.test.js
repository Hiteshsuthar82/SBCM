const request = require('supertest');
const app = require('../app');

describe('Complaint API', () => {
  let userToken;
  let adminToken;
  let complaintId;
  let complaintToken;

  beforeAll(async () => {
    // Login user
    const userRes = await request(app)
      .post('/api/auth/login')
      .send({ mobile: '9876543210', otp: '123456', sessionId: 'test-session' });
    userToken = userRes.body.data.token;

    // Login admin
    const adminRes = await request(app)
      .post('/api/auth/admin/login')
      .send({ email: 'admin@example.com', password: 'password' });
    adminToken = adminRes.body.data.token;
  });

  it('should create a new complaint', async () => {
    const res = await request(app)
      .post('/api/complaints')
      .set('Authorization', `Bearer ${userToken}`)
      .field('type', 'cleanliness')
      .field('description', 'Test description')
      .field('stop', 'Test Stop')
      .attach('evidence', Buffer.from('test'), 'test.jpg'); // Mock file
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('token');
    complaintId = res.body.data.id;
    complaintToken = res.body.data.token;
  });

  it('should track complaint by token', async () => {
    const res = await request(app)
      .get(`/api/complaints/track/${complaintToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token', complaintToken);
  });

  it('should get user complaint history', async () => {
    const res = await request(app)
      .get('/api/complaints/history')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should get all complaints as admin', async () => {
    const res = await request(app)
      .get('/api/complaints')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should approve complaint as admin', async () => {
    const res = await request(app)
      .put(`/api/complaints/${complaintId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'approved', description: 'Approved', points: 50 });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.complaint.status).toBe('approved');
  });

  it('should fail to create complaint without auth', async () => {
    const res = await request(app)
      .post('/api/complaints')
      .field('type', 'cleanliness')
      .field('description', 'Test')
      .field('stop', 'Stop');
    expect(res.statusCode).toBe(401);
  });
});