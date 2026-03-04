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
const Message = require('../../Models/Message');

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

describe('Chat API Routes', () => {
  describe('GET /chat/messages/:conversationId', () => {
    it('should return messages for a conversation', async () => {
      const { user: user1, token } = await createVerifiedUser({ email: 'chatuser1@test.com' });
      const user2 = await User.create({
        name: 'Bob',
        email: 'chatuser2@test.com',
        password: 'pass123',
        verified: true,
      });

      const msg = await Message.create({ author: user1._id, content: 'Hello!' });
      const conv = await Conversation.create({
        participants: [user1._id, user2._id],
        messages: [msg._id],
      });

      const res = await supertest(app)
        .get(`/chat/messages/${conv._id}`)
        .set('Authorization', `bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.messages).toHaveLength(1);
      expect(res.body.data.messages[0].content).toBe('Hello!');
    });

    it('should require authentication', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await supertest(app).get(`/chat/messages/${fakeId}`);
      expect(res.status).toBe(401);
    });
  });

  describe('POST /chat/upload-doc', () => {
    it('should require authentication', async () => {
      const res = await supertest(app).post('/chat/upload-doc');
      expect(res.status).toBe(401);
    });

    it('should reject request without file', async () => {
      const { token } = await createVerifiedUser({ email: 'uploaddoc@test.com' });

      const res = await supertest(app)
        .post('/chat/upload-doc')
        .set('Authorization', `bearer ${token}`);

      expect(res.status).toBe(400);
    });
  });

  describe('POST /chat/upload-audio', () => {
    it('should require authentication', async () => {
      const res = await supertest(app).post('/chat/upload-audio');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /chat/upload-media', () => {
    it('should require authentication', async () => {
      const res = await supertest(app).post('/chat/upload-media');
      expect(res.status).toBe(401);
    });
  });
});
