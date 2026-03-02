const authSocket = require('./middleware/authSocket');
const newConnectionHandler = require('./socketHandlers/newConnectionHandler');
const disconnectHandler = require('./socketHandlers/disconnectHandler');
const startTypingHandler = require('./socketHandlers/startTypingHandler');
const stopTypingHandler = require('./socketHandlers/stopTypingHandler');
const chatHistoryHandler = require('./socketHandlers/getMessageHistory');
const newMessageHandler = require('./socketHandlers/newMessageHandler');

const userSocketMap = new Map(); // userId -> Set(socketIds)

const normalizeUserId = (value) => {
    if (!value) return null;
    return String(value);
};

const addSocketForUser = (userId, socketId) => {
    const normalizedUserId = normalizeUserId(userId);
    if (!normalizedUserId) return 0;

    let sockets = userSocketMap.get(normalizedUserId);
    if (!sockets) {
        sockets = new Set();
        userSocketMap.set(normalizedUserId, sockets);
    }

    sockets.add(socketId);
    return sockets.size;
};

const removeSocketForUser = (userId, socketId) => {
    const normalizedUserId = normalizeUserId(userId);
    if (!normalizedUserId) {
        return { remainingCount: 0, nextSocketId: null };
    }

    const sockets = userSocketMap.get(normalizedUserId);
    if (!sockets) {
        return { remainingCount: 0, nextSocketId: null };
    }

    sockets.delete(socketId);

    if (sockets.size === 0) {
        userSocketMap.delete(normalizedUserId);
        return { remainingCount: 0, nextSocketId: null };
    }

    const nextSocketId = sockets.values().next().value || null;
    return { remainingCount: sockets.size, nextSocketId };
};

const getSocketCountForUser = (userId) => {
    const normalizedUserId = normalizeUserId(userId);
    if (!normalizedUserId) return 0;
    return userSocketMap.get(normalizedUserId)?.size || 0;
};

const registerSocketServer = (server) => {
    const io = require('socket.io')(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        }
    });

    io.use((socket, next) => {
        authSocket(socket, next);
    });

    io.on('connection', (socket) => {
        const userId = normalizeUserId(socket.user?.userId);
        if (!userId) {
            console.log(`⚠️ [socketServer.js] Missing userId for socket ${socket.id}. Disconnecting.`);
            socket.disconnect(true);
            return;
        }

        socket.data.userId = userId;
        socket.join(userId);
        const activeConnections = addSocketForUser(userId, socket.id);

        console.log(`✅ [socketServer.js] User connected: ${socket.id} (user ${userId}, active sockets: ${activeConnections})`);

        // New Connection Handler
        newConnectionHandler(socket, io, {
            isFirstConnection: activeConnections === 1,
        });

        // Backward-compatible explicit join event
        socket.on("user:join", (joinedUserId) => {
            const normalizedJoinedId = normalizeUserId(joinedUserId);
            if (!normalizedJoinedId || normalizedJoinedId !== userId) {
                console.log(`⚠️ [socketServer.js] Ignored invalid user:join from socket ${socket.id}`);
                return;
            }

            socket.join(userId);
            if (!userSocketMap.get(userId)?.has(socket.id)) {
                addSocketForUser(userId, socket.id);
            }

            console.log(`✅ User ${userId} joined room with socket ${socket.id}`);
        });

        // newMessageHandler with ack
        socket.on("new-message", (data, ack) => {
            newMessageHandler(socket, data, io, ack);
        });

        // chatHistoryHandler
        socket.on("direct-chat-history", (data, ack) => {
            chatHistoryHandler(socket, data, ack);
        });

        // Start typing handler
        socket.on("start-typing", (data) => {
            startTypingHandler(socket, data, io);
        });

        // Stop typing handler
        socket.on("stop-typing", (data) => {
            stopTypingHandler(socket, data, io);
        });

        // WebRTC Call Handlers
        socket.on("call:initiate", ({ to, offer, from, callerName, type }) => {
            console.log(`📞 Call from ${from} (${callerName}) to ${to} of type ${type}`);

            const recipientId = normalizeUserId(to);
            const recipientSocketCount = getSocketCountForUser(recipientId);

            if (recipientSocketCount > 0) {
                console.log(`✅ Emitting incoming call to user ${recipientId} (${recipientSocketCount} active socket(s))`);
                io.to(recipientId).emit("call:incoming", {
                    from,
                    offer,
                    callerName,
                    type,
                });
            } else {
                console.log(`❌ Recipient ${recipientId || to} is offline or not found`);
            }
        });


        socket.on("call:answer", ({ to, answer }) => {
            const recipientId = normalizeUserId(to);
            if (getSocketCountForUser(recipientId) > 0) {
                io.to(recipientId).emit("call:answered", { answer });
            }
        });

        socket.on("call:ice-candidate", ({ to, candidate }) => {
            const recipientId = normalizeUserId(to);
            if (getSocketCountForUser(recipientId) > 0) {
                io.to(recipientId).emit("call:ice-candidate", { candidate });
            }
        });

        socket.on("call:end", ({ to }) => {
            const recipientId = normalizeUserId(to);
            if (getSocketCountForUser(recipientId) > 0) {
                io.to(recipientId).emit("call:ended");
            }
        });

        socket.on("call:reject", ({ to }) => {
            const recipientId = normalizeUserId(to);
            if (getSocketCountForUser(recipientId) > 0) {
                io.to(recipientId).emit("call:rejected");
            }
        });

        socket.on("call:busy", ({ to }) => {
            const recipientId = normalizeUserId(to);
            if (getSocketCountForUser(recipientId) > 0) {
                io.to(recipientId).emit("call:user-busy");
            }
        });

        // Handle disconnection
        socket.on("disconnect", () => {
            const disconnectedUserId = socket.data?.userId || normalizeUserId(socket.user?.userId);
            const { remainingCount, nextSocketId } = removeSocketForUser(disconnectedUserId, socket.id);

            // Update user status to Offline in DB and broadcast disconnection
            disconnectHandler(socket, io, {
                userId: disconnectedUserId,
                hasOtherConnections: remainingCount > 0,
                nextSocketId,
            });

            console.log(`User disconnected: ${socket.id} (user ${disconnectedUserId}, remaining sockets: ${remainingCount})`);
        });
    }); // <-- closes io.on('connection')
}; // <-- closes registerSocketServer

module.exports = { registerSocketServer };
