const jwt = require('jsonwebtoken');

// Set env before requiring authSocket
process.env.TOKEN_KEY = 'test-secret-key';

const verifyTokenSocket = require('../../middleware/authSocket');

describe('authSocket middleware', () => {
  const createMockSocket = (token) => ({
    handshake: {
      auth: { token },
    },
  });

  it('should authenticate valid token', () => {
    const token = jwt.sign({ userId: 'user123' }, 'test-secret-key', { expiresIn: '1h' });
    const socket = createMockSocket(token);
    const next = jest.fn();

    verifyTokenSocket(socket, next);

    expect(next).toHaveBeenCalledWith();
    expect(next).toHaveBeenCalledTimes(1);
    expect(socket.user).toBeDefined();
    expect(socket.user.userId).toBe('user123');
  });

  it('should reject invalid token', () => {
    const socket = createMockSocket('invalid-token');
    const next = jest.fn();

    verifyTokenSocket(socket, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('NOT AUTHORIZED');
  });

  it('should reject missing token', () => {
    const socket = createMockSocket(undefined);
    const next = jest.fn();

    verifyTokenSocket(socket, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should reject expired token', () => {
    const token = jwt.sign({ userId: 'user123' }, 'test-secret-key', { expiresIn: '0s' });
    const socket = createMockSocket(token);
    const next = jest.fn();

    // Give it a moment to expire
    setTimeout(() => {
      verifyTokenSocket(socket, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    }, 100);
  });

  it('should reject token signed with wrong secret', () => {
    const token = jwt.sign({ userId: 'user123' }, 'wrong-secret', { expiresIn: '1h' });
    const socket = createMockSocket(token);
    const next = jest.fn();

    verifyTokenSocket(socket, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should handle missing auth object gracefully', () => {
    const socket = { handshake: {} };
    const next = jest.fn();

    verifyTokenSocket(socket, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
