const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../../Models/User');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe('User Model', () => {
  const validUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
  };

  describe('Schema validation', () => {
    it('should create a user with valid fields', async () => {
      const user = await User.create(validUser);
      expect(user.name).toBe('Test User');
      expect(user.email).toBe('test@example.com');
      expect(user.verified).toBe(false);
      expect(user.status).toBe('Offline');
    });

    it('should require name', async () => {
      await expect(
        User.create({ email: 'test@example.com', password: 'pass123' })
      ).rejects.toThrow(/Name is required/);
    });

    it('should require email', async () => {
      await expect(
        User.create({ name: 'Test', password: 'pass123' })
      ).rejects.toThrow(/Email is required/);
    });

    it('should require password', async () => {
      await expect(
        User.create({ name: 'Test', email: 'test@example.com' })
      ).rejects.toThrow(/Password is required/);
    });

    it('should reject invalid email', async () => {
      await expect(
        User.create({ name: 'Test', email: 'invalid', password: 'pass123' })
      ).rejects.toThrow(/not a valid email/);
    });

    it('should enforce unique email', async () => {
      await User.create(validUser);
      await expect(User.create(validUser)).rejects.toThrow();
    });

    it('should accept valid status values', async () => {
      const user = await User.create({ ...validUser, status: 'Online' });
      expect(user.status).toBe('Online');
    });

    it('should reject invalid status values', async () => {
      await expect(
        User.create({ ...validUser, status: 'Away' })
      ).rejects.toThrow();
    });

    it('should set default createdAt', async () => {
      const user = await User.create(validUser);
      expect(user.createdAt).toBeDefined();
      expect(user.createdAt instanceof Date).toBe(true);
    });

    it('should store optional fields', async () => {
      const user = await User.create({
        ...validUser,
        jobTitle: 'Developer',
        bio: 'Hello world',
        country: 'India',
        avatar: 'https://example.com/avatar.png',
      });
      expect(user.jobTitle).toBe('Developer');
      expect(user.bio).toBe('Hello world');
      expect(user.country).toBe('India');
      expect(user.avatar).toBe('https://example.com/avatar.png');
    });
  });

  describe('Password hashing', () => {
    it('should hash the password on save', async () => {
      const user = await User.create(validUser);
      expect(user.password).not.toBe('password123');
      expect(user.password.startsWith('$2')).toBe(true);
    });

    it('should not re-hash password if not modified', async () => {
      const user = await User.create(validUser);
      const hashedPw = user.password;
      user.name = 'Updated Name';
      await user.save();
      expect(user.password).toBe(hashedPw);
    });
  });

  describe('OTP hashing', () => {
    it('should hash OTP on save', async () => {
      const user = await User.create(validUser);
      user.otp = '1234';
      await user.save();
      expect(user.otp).not.toBe('1234');
      expect(user.otp.startsWith('$2')).toBe(true);
    });
  });

  describe('Instance methods', () => {
    it('correctPassword should return true for valid password', async () => {
      const user = await User.create(validUser);
      const result = await user.correctPassword('password123', user.password);
      expect(result).toBe(true);
    });

    it('correctPassword should return false for invalid password', async () => {
      const user = await User.create(validUser);
      const result = await user.correctPassword('wrong', user.password);
      expect(result).toBe(false);
    });

    it('correctOTP should return true for valid OTP', async () => {
      const user = await User.create(validUser);
      user.otp = '1234';
      await user.save();
      const result = await user.correctOTP('1234');
      expect(result).toBe(true);
    });

    it('correctOTP should return false for invalid OTP', async () => {
      const user = await User.create(validUser);
      user.otp = '1234';
      await user.save();
      const result = await user.correctOTP('5678');
      expect(result).toBe(false);
    });

    it('changedPasswordAfter should return false if no passwordChangedAt', async () => {
      const user = await User.create(validUser);
      const result = user.changedPasswordAfter(Math.floor(Date.now() / 1000));
      expect(result).toBe(false);
    });

    it('changedPasswordAfter should return true if password changed after token', async () => {
      const user = await User.create(validUser);
      user.passwordChangedAt = new Date(Date.now() + 10000);
      await user.save({ validateModifiedOnly: true });
      const result = user.changedPasswordAfter(Math.floor(Date.now() / 1000) - 100);
      expect(result).toBe(true);
    });

    it('changedPasswordAfter should return false if password changed before token', async () => {
      const user = await User.create(validUser);
      user.passwordChangedAt = new Date(Date.now() - 100000);
      await user.save({ validateModifiedOnly: true });
      const result = user.changedPasswordAfter(Math.floor(Date.now() / 1000));
      expect(result).toBe(false);
    });
  });
});
