const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Conversation = require('../../Models/Conversation');
const Message = require('../../Models/Message');
const User = require('../../Models/User');
const newMessageHandler = require('../../socketHandlers/newMessageHandler');
const chatHistoryHandler = require('../../socketHandlers/getMessageHistory');

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

describe('newMessageHandler', () => {
  it('should create a message and add it to conversation', async () => {
    const user1 = await User.create({
      name: 'Alice',
      email: 'alice@test.com',
      password: 'pass123',
      status: 'Online',
      socketId: 'alice-socket',
    });
    const user2 = await User.create({
      name: 'Bob',
      email: 'bob@test.com',
      password: 'pass123',
      status: 'Online',
      socketId: 'bob-socket',
    });

    const conv = await Conversation.create({
      participants: [user1._id, user2._id],
    });

    const socket = { user: { userId: user1._id.toString() } };
    const io = { to: jest.fn().mockReturnThis(), emit: jest.fn() };
    const ack = jest.fn();

    await newMessageHandler(socket, {
      conversationId: conv._id.toString(),
      message: {
        author: user1._id.toString(),
        content: 'Hello Bob!',
      },
    }, io, ack);

    expect(ack).toHaveBeenCalledWith(expect.objectContaining({ success: true }));

    const updatedConv = await Conversation.findById(conv._id).populate('messages');
    expect(updatedConv.messages).toHaveLength(1);
    expect(updatedConv.messages[0].content).toBe('Hello Bob!');
  });

  it('should emit new-direct-chat to online participants', async () => {
    const user1 = await User.create({
      name: 'Alice',
      email: 'alice2@test.com',
      password: 'pass123',
      status: 'Online',
      socketId: 'alice-socket-2',
    });
    const user2 = await User.create({
      name: 'Bob',
      email: 'bob2@test.com',
      password: 'pass123',
      status: 'Online',
      socketId: 'bob-socket-2',
    });

    const conv = await Conversation.create({
      participants: [user1._id, user2._id],
    });

    const socket = { user: { userId: user1._id.toString() } };
    const io = { to: jest.fn().mockReturnThis(), emit: jest.fn() };
    const ack = jest.fn();

    await newMessageHandler(socket, {
      conversationId: conv._id.toString(),
      message: { author: user1._id.toString(), content: 'Hi!' },
    }, io, ack);

    // Should emit to both online participants
    expect(io.to).toHaveBeenCalled();
    expect(io.emit).toHaveBeenCalledWith('new-direct-chat', expect.objectContaining({
      conversationId: conv._id.toString(),
    }));
  });

  it('should handle non-existent conversation', async () => {
    const socket = { user: { userId: 'some-user' } };
    const io = { to: jest.fn().mockReturnThis(), emit: jest.fn() };
    const ack = jest.fn();
    const fakeId = new mongoose.Types.ObjectId();

    await newMessageHandler(socket, {
      conversationId: fakeId.toString(),
      message: { author: 'some-user', content: 'Hi!' },
    }, io, ack);

    expect(ack).toHaveBeenCalledWith(expect.objectContaining({ error: 'Conversation not found' }));
  });
});

describe('chatHistoryHandler', () => {
  it('should return messages for a conversation', async () => {
    const user = await User.create({
      name: 'User',
      email: 'hist@test.com',
      password: 'pass123',
    });

    const msg1 = await Message.create({ author: user._id, content: 'Msg 1' });
    const msg2 = await Message.create({ author: user._id, content: 'Msg 2' });

    const conv = await Conversation.create({
      participants: [user._id],
      messages: [msg1._id, msg2._id],
    });

    const socket = {};
    const ack = jest.fn();

    await chatHistoryHandler(socket, { conversationId: conv._id.toString() }, ack);

    expect(ack).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      data: expect.objectContaining({
        conversationId: conv._id.toString(),
      }),
    }));

    const response = ack.mock.calls[0][0];
    expect(response.data.history).toHaveLength(2);
  });

  it('should handle non-existent conversation', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const ack = jest.fn();

    await chatHistoryHandler({}, { conversationId: fakeId.toString() }, ack);

    expect(ack).toHaveBeenCalledWith(expect.objectContaining({
      error: true,
      message: 'Conversation not found',
    }));
  });
});
