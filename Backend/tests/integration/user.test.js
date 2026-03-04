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
const Conversation = require('../../Models/Conversation');
const Message = require('../../Models/Message'); // Register Message schema for populate

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

describe('User API Routes', () => {
  describe('GET /user/me', () => {
    it('should return current user info', async () => {
      const { token } = await createVerifiedUser({ email: 'me@test.com' });

      const res = await supertest(app)
        .get('/user/me')
        .set('Authorization', `bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe('me@test.com');
      expect(res.body.data.user.name).toBe('Test User');
    });
  });

  describe('GET /user/someone', () => {
    it('should return info about a specific user', async () => {
      const { token } = await createVerifiedUser({ email: 'me2@test.com' });
      const other = await User.create({
        name: 'Other Person',
        email: 'other@test.com',
        password: 'pass123',
        verified: true,
      });

      const res = await supertest(app)
        .get(`/user/someone?userId=${other._id}`)
        .set('Authorization', `bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.name).toBe('Other Person');
    });

    it('should return 404 for non-existent user', async () => {
      const { token } = await createVerifiedUser({ email: 'me3@test.com' });
      const fakeId = new mongoose.Types.ObjectId();

      const res = await supertest(app)
        .get(`/user/someone?userId=${fakeId}`)
        .set('Authorization', `bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /user/me', () => {
    it('should update user profile', async () => {
      const { token } = await createVerifiedUser({ email: 'update@test.com' });

      const res = await supertest(app)
        .patch('/user/me')
        .set('Authorization', `bearer ${token}`)
        .send({ name: 'Updated Name', jobTitle: 'Dev', bio: 'Hello', country: 'India' });

      expect(res.status).toBe(200);
      expect(res.body.data.user.name).toBe('Updated Name');
      expect(res.body.data.user.jobTitle).toBe('Dev');
    });
  });

  describe('PATCH /user/update-password', () => {
    it('should update password with correct current password', async () => {
      const { token } = await createVerifiedUser({ email: 'pw@test.com' });

      const res = await supertest(app)
        .patch('/user/update-password')
        .set('Authorization', `bearer ${token}`)
        .send({ currentPassword: 'password123', newPassword: 'newpassword123' });

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/updated/i);
    });

    it('should reject wrong current password', async () => {
      const { token } = await createVerifiedUser({ email: 'pw2@test.com' });

      const res = await supertest(app)
        .patch('/user/update-password')
        .set('Authorization', `bearer ${token}`)
        .send({ currentPassword: 'wrongpassword', newPassword: 'newpassword123' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /user/users', () => {
    it('should return list of other verified users', async () => {
      const { token } = await createVerifiedUser({ email: 'list@test.com' });
      await User.create({ name: 'User2', email: 'u2@test.com', password: 'pass123', verified: true });
      await User.create({ name: 'User3', email: 'u3@test.com', password: 'pass123', verified: true });
      await User.create({ name: 'Unverified', email: 'uv@test.com', password: 'pass123', verified: false });

      const res = await supertest(app)
        .get('/user/users')
        .set('Authorization', `bearer ${token}`);

      expect(res.status).toBe(200);
      // Should not include the current user or unverified users
      const names = res.body.data.users.map(u => u.name);
      expect(names).toContain('User2');
      expect(names).toContain('User3');
      expect(names).not.toContain('Unverified');
      expect(names).not.toContain('Test User');
    });
  });

  describe('POST /user/start-conversation', () => {
    it('should create a new conversation', async () => {
      const { token } = await createVerifiedUser({ email: 'conv1@test.com' });
      const other = await User.create({
        name: 'Other',
        email: 'conv2@test.com',
        password: 'pass123',
        verified: true,
      });

      const res = await supertest(app)
        .post('/user/start-conversation')
        .set('Authorization', `bearer ${token}`)
        .send({ userId: other._id.toString() });

      expect(res.status).toBe(201);
      expect(res.body.data.conversation).toBeDefined();
      expect(res.body.data.conversation.participants).toHaveLength(2);
    });

    it('should return existing conversation if already exists', async () => {
      const { user: user1, token } = await createVerifiedUser({ email: 'exist1@test.com' });
      const user2 = await User.create({
        name: 'Other',
        email: 'exist2@test.com',
        password: 'pass123',
        verified: true,
      });

      // Create conversation first
      await Conversation.create({ participants: [user1._id, user2._id] });

      const res = await supertest(app)
        .post('/user/start-conversation')
        .set('Authorization', `bearer ${token}`)
        .send({ userId: user2._id.toString() });

      expect(res.status).toBe(200);
      expect(res.body.data.conversation).toBeDefined();
    });
  });

  describe('GET /user/conversations', () => {
    it('should return user conversations', async () => {
      const { user: user1, token } = await createVerifiedUser({ email: 'convs1@test.com' });
      const user2 = await User.create({
        name: 'Other',
        email: 'convs2@test.com',
        password: 'pass123',
        verified: true,
      });

      await Conversation.create({ participants: [user1._id, user2._id] });

      const res = await supertest(app)
        .get('/user/conversations')
        .set('Authorization', `bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.conversations).toHaveLength(1);
    });

    it('should return empty array when no conversations', async () => {
      const { token } = await createVerifiedUser({ email: 'noconvs@test.com' });

      const res = await supertest(app)
        .get('/user/conversations')
        .set('Authorization', `bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.conversations).toHaveLength(0);
    });
  });
});
