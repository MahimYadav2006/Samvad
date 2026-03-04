const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Conversation = require('../../Models/Conversation');
const Message = require('../../Models/Message');
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
  await Conversation.deleteMany({});
  await Message.deleteMany({});
  await User.deleteMany({});
});

describe('Conversation Model', () => {
  it('should create a conversation with participants', async () => {
    const user1 = await User.create({ name: 'User1', email: 'u1@test.com', password: 'pass123' });
    const user2 = await User.create({ name: 'User2', email: 'u2@test.com', password: 'pass123' });

    const conv = await Conversation.create({
      participants: [user1._id, user2._id],
    });

    expect(conv.participants).toHaveLength(2);
    expect(conv.messages).toHaveLength(0);
  });

  it('should populate participants', async () => {
    const user1 = await User.create({ name: 'Alice', email: 'alice@test.com', password: 'pass123' });
    const user2 = await User.create({ name: 'Bob', email: 'bob@test.com', password: 'pass123' });

    const conv = await Conversation.create({ participants: [user1._id, user2._id] });
    const populated = await Conversation.findById(conv._id).populate('participants');

    expect(populated.participants[0].name).toBe('Alice');
    expect(populated.participants[1].name).toBe('Bob');
  });

  it('should store and populate messages', async () => {
    const user1 = await User.create({ name: 'Alice', email: 'alice@test.com', password: 'pass123' });
    const msg = await Message.create({ author: user1._id, content: 'Hello!' });

    const conv = await Conversation.create({
      participants: [user1._id],
      messages: [msg._id],
    });

    const populated = await Conversation.findById(conv._id).populate('messages');
    expect(populated.messages).toHaveLength(1);
    expect(populated.messages[0].content).toBe('Hello!');
  });
});

describe('Message Model', () => {
  it('should create a text message', async () => {
    const user = await User.create({ name: 'User', email: 'u@test.com', password: 'pass123' });
    const msg = await Message.create({
      author: user._id,
      content: 'Hello World',
    });

    expect(msg.content).toBe('Hello World');
    expect(msg.author.toString()).toBe(user._id.toString());
  });

  it('should create a message with media', async () => {
    const user = await User.create({ name: 'User', email: 'u@test.com', password: 'pass123' });
    const msg = await Message.create({
      author: user._id,
      media: [{ type: 'image', url: 'https://example.com/img.png' }],
    });

    expect(msg.media).toHaveLength(1);
    expect(msg.media[0].type).toBe('image');
    expect(msg.media[0].url).toBe('https://example.com/img.png');
  });

  it('should create a message with audio', async () => {
    const user = await User.create({ name: 'User', email: 'u@test.com', password: 'pass123' });
    const msg = await Message.create({
      author: user._id,
      audioUrl: 'https://example.com/audio.mp3',
    });
    expect(msg.audioUrl).toBe('https://example.com/audio.mp3');
  });

  it('should create a message with document', async () => {
    const user = await User.create({ name: 'User', email: 'u@test.com', password: 'pass123' });
    const msg = await Message.create({
      author: user._id,
      document: { url: 'https://example.com/doc.pdf', name: 'doc.pdf', size: 1024 },
    });
    expect(msg.document.name).toBe('doc.pdf');
    expect(msg.document.size).toBe(1024);
  });

  it('should create a giphy message', async () => {
    const user = await User.create({ name: 'User', email: 'u@test.com', password: 'pass123' });
    const msg = await Message.create({
      author: user._id,
      giphyUrl: 'https://giphy.com/test.gif',
    });
    expect(msg.giphyUrl).toBe('https://giphy.com/test.gif');
  });

  it('should trim content', async () => {
    const user = await User.create({ name: 'User', email: 'u@test.com', password: 'pass123' });
    const msg = await Message.create({
      author: user._id,
      content: '  Hello  ',
    });
    expect(msg.content).toBe('Hello');
  });

  it('should reject invalid media type', async () => {
    const user = await User.create({ name: 'User', email: 'u@test.com', password: 'pass123' });
    await expect(
      Message.create({
        author: user._id,
        media: [{ type: 'unknown', url: 'test' }],
      })
    ).rejects.toThrow();
  });
});
