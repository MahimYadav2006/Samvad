const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../../Models/User');

// Handler imports
const newConnectionHandler = require('../../socketHandlers/newConnectionHandler');
const disconnectHandler = require('../../socketHandlers/disconnectHandler');
const startTypingHandler = require('../../socketHandlers/startTypingHandler');
const stopTypingHandler = require('../../socketHandlers/stopTypingHandler');

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

describe('newConnectionHandler', () => {
  it('should set user status to Online and store socketId', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@test.com',
      password: 'pass123',
    });

    const socket = {
      id: 'socket-123',
      user: { userId: user._id.toString() },
      broadcast: { emit: jest.fn() },
    };
    const io = {};

    await newConnectionHandler(socket, io, { isFirstConnection: true });

    const updated = await User.findById(user._id);
    expect(updated.status).toBe('Online');
    expect(updated.socketId).toBe('socket-123');
  });

  it('should broadcast user-connected on first connection', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@test.com',
      password: 'pass123',
    });

    const broadcastEmit = jest.fn();
    const socket = {
      id: 'socket-123',
      user: { userId: user._id.toString() },
      broadcast: { emit: broadcastEmit },
    };

    await newConnectionHandler(socket, {}, { isFirstConnection: true });

    expect(broadcastEmit).toHaveBeenCalledWith('user-connected', expect.objectContaining({
      userId: user._id,
      status: 'Online',
    }));
  });

  it('should not broadcast on subsequent connections', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@test.com',
      password: 'pass123',
    });

    const broadcastEmit = jest.fn();
    const socket = {
      id: 'socket-456',
      user: { userId: user._id.toString() },
      broadcast: { emit: broadcastEmit },
    };

    await newConnectionHandler(socket, {}, { isFirstConnection: false });

    expect(broadcastEmit).not.toHaveBeenCalled();
  });

  it('should handle missing userId', async () => {
    const socket = { id: 'socket-789', user: {} };
    // Should not throw
    await expect(newConnectionHandler(socket, {}, {})).resolves.not.toThrow();
  });
});

describe('disconnectHandler', () => {
  it('should set user Offline when no other connections', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'dc@test.com',
      password: 'pass123',
      status: 'Online',
      socketId: 'socket-100',
    });

    const socket = {
      id: 'socket-100',
      user: { userId: user._id.toString() },
      broadcast: { emit: jest.fn() },
    };

    await disconnectHandler(socket, {}, {
      userId: user._id.toString(),
      hasOtherConnections: false,
      nextSocketId: null,
    });

    const updated = await User.findById(user._id);
    expect(updated.status).toBe('Offline');
  });

  it('should keep user Online if other connections exist', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'dc2@test.com',
      password: 'pass123',
      status: 'Online',
      socketId: 'socket-200',
    });

    const socket = {
      id: 'socket-200',
      user: { userId: user._id.toString() },
      broadcast: { emit: jest.fn() },
    };

    await disconnectHandler(socket, {}, {
      userId: user._id.toString(),
      hasOtherConnections: true,
      nextSocketId: 'socket-201',
    });

    const updated = await User.findById(user._id);
    expect(updated.status).toBe('Online');
    expect(updated.socketId).toBe('socket-201');
  });

  it('should broadcast user-disconnected on last disconnect', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'dc3@test.com',
      password: 'pass123',
      status: 'Online',
      socketId: 'socket-300',
    });

    const broadcastEmit = jest.fn();
    const socket = {
      id: 'socket-300',
      user: { userId: user._id.toString() },
      broadcast: { emit: broadcastEmit },
    };

    await disconnectHandler(socket, {}, {
      userId: user._id.toString(),
      hasOtherConnections: false,
      nextSocketId: null,
    });

    expect(broadcastEmit).toHaveBeenCalledWith('user-disconnected', expect.objectContaining({
      status: 'Offline',
    }));
  });
});

describe('startTypingHandler', () => {
  it('should emit typing-indicator to target user', async () => {
    const targetUser = await User.create({
      name: 'Target',
      email: 'target@test.com',
      password: 'pass123',
      status: 'Online',
      socketId: 'target-socket',
    });

    const socket = { user: { userId: 'sender-id' } };
    const io = { to: jest.fn().mockReturnThis(), emit: jest.fn() };

    await startTypingHandler(socket, {
      userId: targetUser._id.toString(),
      conversationId: 'conv-123',
    }, io);

    expect(io.to).toHaveBeenCalledWith('target-socket');
    expect(io.emit).toHaveBeenCalledWith('typing-indicator', expect.objectContaining({
      conversationId: 'conv-123',
      typing: true,
      senderId: 'sender-id',
    }));
  });

  it('should not emit if target user is offline', async () => {
    const targetUser = await User.create({
      name: 'Target',
      email: 'offline@test.com',
      password: 'pass123',
      status: 'Offline',
    });

    const socket = { user: { userId: 'sender-id' } };
    const io = { to: jest.fn().mockReturnThis(), emit: jest.fn() };

    await startTypingHandler(socket, {
      userId: targetUser._id.toString(),
      conversationId: 'conv-123',
    }, io);

    expect(io.to).not.toHaveBeenCalled();
  });

  it('should handle missing data gracefully', async () => {
    const socket = { user: { userId: 'sender-id' } };
    const io = { to: jest.fn().mockReturnThis(), emit: jest.fn() };

    await startTypingHandler(socket, {}, io);
    expect(io.to).not.toHaveBeenCalled();
  });
});

describe('stopTypingHandler', () => {
  it('should emit typing-indicator with typing false', async () => {
    const targetUser = await User.create({
      name: 'Target',
      email: 'stop@test.com',
      password: 'pass123',
      status: 'Online',
      socketId: 'stop-socket',
    });

    const socket = { user: { userId: 'sender-id' } };
    const io = { to: jest.fn().mockReturnThis(), emit: jest.fn() };

    await stopTypingHandler(socket, {
      userId: targetUser._id.toString(),
      conversationId: 'conv-456',
    }, io);

    expect(io.to).toHaveBeenCalledWith('stop-socket');
    expect(io.emit).toHaveBeenCalledWith('typing-indicator', expect.objectContaining({
      conversationId: 'conv-456',
      typing: false,
      senderId: 'sender-id',
    }));
  });
});
