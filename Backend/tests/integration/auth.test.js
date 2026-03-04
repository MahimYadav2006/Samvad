const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const supertest = require('supertest');
const jwt = require('jsonwebtoken');

// Mock external storage dependencies
jest.mock('multer-storage-cloudinary', () => ({
  CloudinaryStorage: jest.fn().mockImplementation(() => ({
    _handleFile: jest.fn((req, file, cb) => cb(null, { path: 'test-path', filename: 'test-file' })),
    _removeFile: jest.fn((req, file, cb) => cb(null)),
  })),
}));

// Mock mailer to avoid real email sending
jest.mock('../../services/mailer', () => jest.fn().mockResolvedValue(undefined));

let mongoServer;
let app;

const TOKEN_KEY = 'test-secret-key';

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();
  process.env.TOKEN_KEY = TOKEN_KEY;
  process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
  process.env.NODEMAILER_USER = 'test@test.com';
  process.env.NODEMAILER_APP_PASSWORD = 'test-pass';
  process.env.CLOUDINARY_CLOUD_NAME = 'test';
  process.env.CLOUDINARY_API_KEY = 'test';
  process.env.CLOUDINARY_API_SECRET = 'test';

  await mongoose.connect(mongoServer.getUri());
  app = require('../../app');
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

const User = require('../../Models/User');

// Helper: create verified user and get token
const createVerifiedUser = async (overrides = {}) => {
  const userData = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    verified: true,
    ...overrides,
  };
  const user = await User.create(userData);
  const token = jwt.sign({ userId: user._id }, TOKEN_KEY, { expiresIn: '7d' });
  return { user, token };
};

describe('Auth API Routes', () => {
  describe('POST /auth/signup', () => {
    it('should register a new user and return 200', async () => {
      const res = await supertest(app)
        .post('/auth/signup')
        .send({ name: 'New User', email: 'new@test.com', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
    });

    it('should reject duplicate verified email', async () => {
      await User.create({
        name: 'Existing',
        email: 'existing@test.com',
        password: 'password123',
        verified: true,
      });

      const res = await supertest(app)
        .post('/auth/signup')
        .send({ name: 'Dup', email: 'existing@test.com', password: 'password123' });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('error');
    });
  });

  describe('POST /auth/login', () => {
    it('should login verified user with correct credentials', async () => {
      await createVerifiedUser({ email: 'login@test.com' });

      const res = await supertest(app)
        .post('/auth/login')
        .send({ email: 'login@test.com', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.token).toBeDefined();
      expect(res.body.user_id).toBeDefined();
    });

    it('should reject wrong password', async () => {
      await createVerifiedUser({ email: 'wrongpw@test.com' });

      const res = await supertest(app)
        .post('/auth/login')
        .send({ email: 'wrongpw@test.com', password: 'wrongpassword' });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('error');
    });

    it('should reject non-existent email', async () => {
      const res = await supertest(app)
        .post('/auth/login')
        .send({ email: 'noone@test.com', password: 'password123' });

      expect(res.status).toBe(400);
    });

    it('should reject login without email', async () => {
      const res = await supertest(app)
        .post('/auth/login')
        .send({ password: 'password123' });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/required/i);
    });

    it('should reject login without password', async () => {
      const res = await supertest(app)
        .post('/auth/login')
        .send({ email: 'test@test.com' });

      expect(res.status).toBe(400);
    });

    it('should reject unverified user', async () => {
      await User.create({
        name: 'Unverified',
        email: 'unverified@test.com',
        password: 'password123',
        verified: false,
      });

      const res = await supertest(app)
        .post('/auth/login')
        .send({ email: 'unverified@test.com', password: 'password123' });

      expect(res.status).toBe(403);
    });
  });

  describe('POST /auth/verify', () => {
    it('should verify user with correct OTP', async () => {
      const user = await User.create({
        name: 'Verify Me',
        email: 'verify@test.com',
        password: 'password123',
        otp_expiry_time: new Date(Date.now() + 10 * 60 * 1000),
      });
      user.otp = '1234';
      await user.save();

      const res = await supertest(app)
        .post('/auth/verify')
        .send({ email: 'verify@test.com', otp: '1234' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.token).toBeDefined();
    });

    it('should reject expired OTP', async () => {
      const user = await User.create({
        name: 'Expired',
        email: 'expired@test.com',
        password: 'password123',
        otp_expiry_time: new Date(Date.now() - 1000), // expired
      });
      user.otp = '1234';
      await user.save();

      const res = await supertest(app)
        .post('/auth/verify')
        .send({ email: 'expired@test.com', otp: '1234' });

      expect(res.status).toBe(400);
    });

    it('should reject wrong OTP', async () => {
      const user = await User.create({
        name: 'Wrong OTP',
        email: 'wrongotp@test.com',
        password: 'password123',
        otp_expiry_time: new Date(Date.now() + 10 * 60 * 1000),
      });
      user.otp = '1234';
      await user.save();

      const res = await supertest(app)
        .post('/auth/verify')
        .send({ email: 'wrongotp@test.com', otp: '5678' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /auth/resend-otp', () => {
    it('should resend OTP for existing user', async () => {
      await User.create({
        name: 'Resend',
        email: 'resend@test.com',
        password: 'password123',
      });

      const res = await supertest(app)
        .post('/auth/resend-otp')
        .send({ email: 'resend@test.com' });

      // Mailer is mocked, so OTP resend should succeed
      expect(res.status).toBe(200);
    });

    it('should reject invalid email', async () => {
      const res = await supertest(app)
        .post('/auth/resend-otp')
        .send({ email: 'nobody@test.com' });

      expect(res.status).toBe(405);
    });
  });
});

describe('Protected Routes - Auth Middleware', () => {
  it('should reject request without token', async () => {
    const res = await supertest(app).get('/user/me');
    expect(res.status).toBe(401);
  });

  it('should reject request with invalid token', async () => {
    const res = await supertest(app)
      .get('/user/me')
      .set('Authorization', 'bearer invalid-token');

    expect(res.status).toBe(401);
  });

  it('should reject expired token', async () => {
    const token = jwt.sign({ userId: 'test' }, TOKEN_KEY, { expiresIn: '0s' });
    // Wait a bit for expiry
    await new Promise(r => setTimeout(r, 100));

    const res = await supertest(app)
      .get('/user/me')
      .set('Authorization', `bearer ${token}`);

    expect(res.status).toBe(401);
  });

  it('should accept valid token', async () => {
    const { token } = await createVerifiedUser({ email: 'valid@test.com' });

    const res = await supertest(app)
      .get('/user/me')
      .set('Authorization', `bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user).toBeDefined();
  });
});
