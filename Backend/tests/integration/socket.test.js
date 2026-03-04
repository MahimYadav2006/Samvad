const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { createServer } = require('http');
const { Server } = require('socket.io');
const Client = require('socket.io-client');
const jwt = require('jsonwebtoken');

const TOKEN_KEY = 'test-secret-key';
let mongoServer, httpServer, io, port;

const User = require('../../Models/User');
const Conversation = require('../../Models/Conversation');
const Message = require('../../Models/Message');

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.TOKEN_KEY = TOKEN_KEY;
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
  await Conversation.deleteMany({});
  await Message.deleteMany({});
});

const createSocketServer = () => {
  return new Promise((resolve) => {
    httpServer = createServer();
    const socketServer = require('../../socketServer');
    socketServer.registerSocketServer(httpServer);

    httpServer.listen(0, () => {
      port = httpServer.address().port;
      resolve(port);
    });
  });
};

const createAuthClient = async (userData) => {
  const user = await User.create(userData);
  const token = jwt.sign({ userId: user._id.toString() }, TOKEN_KEY, { expiresIn: '1h' });

  return new Promise((resolve, reject) => {
    const client = Client(`http://localhost:${port}`, {
      auth: { token },
      transports: ['websocket'],
      forceNew: true,
    });

    client.on('connect', () => resolve({ client, user, token }));
    client.on('connect_error', (err) => reject(err));

    setTimeout(() => reject(new Error('Connection timeout')), 5000);
  });
};

const closeSocketServer = () => {
  return new Promise((resolve) => {
    if (httpServer) {
      httpServer.close(resolve);
    } else {
      resolve();
    }
  });
};

describe('Socket.io Server Events', () => {
  beforeEach(async () => {
    await createSocketServer();
  });

  afterEach(async () => {
    await closeSocketServer();
  });

  describe('Connection', () => {
    it('should connect with valid token', async () => {
      const { client, user } = await createAuthClient({
        name: 'Socket User',
        email: 'socket@test.com',
        password: 'pass123',
      });

      expect(client.connected).toBe(true);

      // Verify user was set online
      const updated = await User.findById(user._id);
      expect(updated.status).toBe('Online');

      client.disconnect();
    });

    it('should reject connection with invalid token', async () => {
      return new Promise((resolve) => {
        const client = Client(`http://localhost:${port}`, {
          auth: { token: 'invalid-token' },
          transports: ['websocket'],
          forceNew: true,
        });

        client.on('connect_error', (err) => {
          expect(err.message).toContain('NOT AUTHORIZED');
          client.disconnect();
          resolve();
        });

        client.on('connect', () => {
          client.disconnect();
          resolve();
        });
      });
    });

    it('should reject connection without token', async () => {
      return new Promise((resolve) => {
        const client = Client(`http://localhost:${port}`, {
          transports: ['websocket'],
          forceNew: true,
        });

        client.on('connect_error', () => {
          client.disconnect();
          resolve();
        });

        setTimeout(() => {
          client.disconnect();
          resolve();
        }, 3000);
      });
    });
  });

  describe('Messaging', () => {
    it('should handle new-message event', async () => {
      const { client: client1, user: user1 } = await createAuthClient({
        name: 'Alice',
        email: 'alice-sock@test.com',
        password: 'pass123',
      });

      const { client: client2, user: user2 } = await createAuthClient({
        name: 'Bob',
        email: 'bob-sock@test.com',
        password: 'pass123',
      });

      const conv = await Conversation.create({
        participants: [user1._id, user2._id],
      });

      return new Promise((resolve) => {
        client2.on('new-direct-chat', (data) => {
          expect(data.conversationId).toBe(conv._id.toString());
          expect(data.message.content).toBe('Hello from socket!');
          client1.disconnect();
          client2.disconnect();
          resolve();
        });

        client1.emit('new-message', {
          conversationId: conv._id.toString(),
          message: {
            author: user1._id.toString(),
            content: 'Hello from socket!',
          },
        }, (ack) => {
          expect(ack.success).toBe(true);
        });
      });
    });

    it('should acknowledge sent message', async () => {
      const { client, user } = await createAuthClient({
        name: 'Ack User',
        email: 'ack@test.com',
        password: 'pass123',
      });

      const conv = await Conversation.create({
        participants: [user._id],
      });

      return new Promise((resolve) => {
        client.emit('new-message', {
          conversationId: conv._id.toString(),
          message: {
            author: user._id.toString(),
            content: 'Test ack',
          },
        }, (ack) => {
          expect(ack.success).toBe(true);
          expect(ack.messageId).toBeDefined();
          client.disconnect();
          resolve();
        });
      });
    });
  });

  describe('Chat History', () => {
    it('should return chat history', async () => {
      const { client, user } = await createAuthClient({
        name: 'History User',
        email: 'history@test.com',
        password: 'pass123',
      });

      const msg = await Message.create({ author: user._id, content: 'Old message' });
      const conv = await Conversation.create({
        participants: [user._id],
        messages: [msg._id],
      });

      return new Promise((resolve) => {
        client.emit('direct-chat-history', {
          conversationId: conv._id.toString(),
        }, (response) => {
          expect(response.success).toBe(true);
          expect(response.data.history).toHaveLength(1);
          expect(response.data.history[0].content).toBe('Old message');
          client.disconnect();
          resolve();
        });
      });
    });

    it('should handle non-existent conversation', async () => {
      const { client } = await createAuthClient({
        name: 'No Conv',
        email: 'noconv@test.com',
        password: 'pass123',
      });

      const fakeId = new mongoose.Types.ObjectId();

      return new Promise((resolve) => {
        client.emit('direct-chat-history', {
          conversationId: fakeId.toString(),
        }, (response) => {
          expect(response.error).toBe(true);
          client.disconnect();
          resolve();
        });
      });
    });
  });

  describe('Typing Indicators', () => {
    it('should relay start-typing to recipient', async () => {
      const { client: sender } = await createAuthClient({
        name: 'Typer',
        email: 'typer@test.com',
        password: 'pass123',
      });

      const { client: receiver, user: receiverUser } = await createAuthClient({
        name: 'Receiver',
        email: 'receiver@test.com',
        password: 'pass123',
      });

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          sender.disconnect();
          receiver.disconnect();
          resolve(); // Resolve even if not received (depends on socketId)
        }, 3000);

        receiver.on('typing-indicator', (data) => {
          clearTimeout(timeout);
          expect(data.typing).toBe(true);
          expect(data.conversationId).toBe('conv-test');
          sender.disconnect();
          receiver.disconnect();
          resolve();
        });

        sender.emit('start-typing', {
          userId: receiverUser._id.toString(),
          conversationId: 'conv-test',
        });
      });
    });

    it('should relay stop-typing to recipient', async () => {
      const { client: sender } = await createAuthClient({
        name: 'StopTyper',
        email: 'stoptyper@test.com',
        password: 'pass123',
      });

      const { client: receiver, user: receiverUser } = await createAuthClient({
        name: 'StopReceiver',
        email: 'stopreceiver@test.com',
        password: 'pass123',
      });

      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          sender.disconnect();
          receiver.disconnect();
          resolve();
        }, 3000);

        receiver.on('typing-indicator', (data) => {
          clearTimeout(timeout);
          expect(data.typing).toBe(false);
          sender.disconnect();
          receiver.disconnect();
          resolve();
        });

        sender.emit('stop-typing', {
          userId: receiverUser._id.toString(),
          conversationId: 'conv-stop',
        });
      });
    });
  });

  describe('WebRTC Call Events', () => {
    it('should relay call:initiate to recipient', async () => {
      const { client: caller, user: callerUser } = await createAuthClient({
        name: 'Caller',
        email: 'caller@test.com',
        password: 'pass123',
      });

      const { client: callee, user: calleeUser } = await createAuthClient({
        name: 'Callee',
        email: 'callee@test.com',
        password: 'pass123',
      });

      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          caller.disconnect();
          callee.disconnect();
          resolve();
        }, 3000);

        callee.on('call:incoming', (data) => {
          clearTimeout(timeout);
          expect(data.from).toBe(callerUser._id.toString());
          expect(data.callerName).toBe('Caller');
          expect(data.type).toBe('video');
          caller.disconnect();
          callee.disconnect();
          resolve();
        });

        caller.emit('call:initiate', {
          to: calleeUser._id.toString(),
          offer: { type: 'offer', sdp: 'test-sdp' },
          from: callerUser._id.toString(),
          callerName: 'Caller',
          type: 'video',
        });
      });
    });

    it('should relay call:answer', async () => {
      const { client: caller, user: callerUser } = await createAuthClient({
        name: 'Caller2',
        email: 'caller2@test.com',
        password: 'pass123',
      });

      const { client: callee, user: calleeUser } = await createAuthClient({
        name: 'Callee2',
        email: 'callee2@test.com',
        password: 'pass123',
      });

      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          caller.disconnect();
          callee.disconnect();
          resolve();
        }, 3000);

        caller.on('call:answered', (data) => {
          clearTimeout(timeout);
          expect(data.answer).toBeDefined();
          caller.disconnect();
          callee.disconnect();
          resolve();
        });

        callee.emit('call:answer', {
          to: callerUser._id.toString(),
          answer: { type: 'answer', sdp: 'test-answer-sdp' },
        });
      });
    });

    it('should relay call:end', async () => {
      const { client: caller, user: callerUser } = await createAuthClient({
        name: 'EndCaller',
        email: 'endcaller@test.com',
        password: 'pass123',
      });

      const { client: callee, user: calleeUser } = await createAuthClient({
        name: 'EndCallee',
        email: 'endcallee@test.com',
        password: 'pass123',
      });

      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          caller.disconnect();
          callee.disconnect();
          resolve();
        }, 3000);

        callee.on('call:ended', () => {
          clearTimeout(timeout);
          caller.disconnect();
          callee.disconnect();
          resolve();
        });

        caller.emit('call:end', { to: calleeUser._id.toString() });
      });
    });

    it('should relay call:reject', async () => {
      const { client: caller, user: callerUser } = await createAuthClient({
        name: 'RejectCaller',
        email: 'rejectcaller@test.com',
        password: 'pass123',
      });

      const { client: callee, user: calleeUser } = await createAuthClient({
        name: 'RejectCallee',
        email: 'rejectcallee@test.com',
        password: 'pass123',
      });

      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          caller.disconnect();
          callee.disconnect();
          resolve();
        }, 3000);

        caller.on('call:rejected', () => {
          clearTimeout(timeout);
          caller.disconnect();
          callee.disconnect();
          resolve();
        });

        callee.emit('call:reject', { to: callerUser._id.toString() });
      });
    });
  });

  describe('Disconnect', () => {
    it('should set user offline on disconnect', async () => {
      const { client, user } = await createAuthClient({
        name: 'Disconnect User',
        email: 'disconnect@test.com',
        password: 'pass123',
      });

      expect(client.connected).toBe(true);
      client.disconnect();

      // Wait for server processing
      await new Promise(r => setTimeout(r, 500));

      const updated = await User.findById(user._id);
      expect(updated.status).toBe('Offline');
    });
  });
});
