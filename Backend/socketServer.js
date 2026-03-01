const authSocket = require('./middleware/authSocket');
const newConnectionHandler = require('./socketHandlers/newConnectionHandler');
const disconnectHandler = require('./socketHandlers/disconnectHandler');
const startTypingHandler = require('./socketHandlers/startTypingHandler');
const stopTypingHandler = require('./socketHandlers/stopTypingHandler');
const chatHistoryHandler = require('./socketHandlers/getMessageHistory');
const newMessageHandler = require('./socketHandlers/newMessageHandler');

const userSocketMap = new Map();

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
        console.log("✅ [socketServer.js] User connected:", socket.id);

        // New Connection Handler
        newConnectionHandler(socket, io);

        socket.on("user:join", (userId) => {
            socket.join(userId);
            userSocketMap.set(userId, socket.id);
            console.log(`✅ User ${userId} joined with socket ${socket.id}`);
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

            const recipientSocketId = userSocketMap.get(to);

            if (recipientSocketId) {
                console.log(`✅ Emitting to recipient socket: ${recipientSocketId}`);
                io.to(recipientSocketId).emit("call:incoming", {
                    from,
                    offer,
                    callerName,
                    type,
                });
            } else {
                console.log(`❌ Recipient ${to} not found in userSocketMap`);
                console.log("Current map:", Array.from(userSocketMap.entries()));
            }
        });


        socket.on("call:answer", ({ to, answer }) => {
            const callerSocketId = userSocketMap.get(to);
            if (callerSocketId) {
                io.to(callerSocketId).emit("call:answered", { answer });
            }
        });

        socket.on("call:ice-candidate", ({ to, candidate }) => {
            const recipientSocketId = userSocketMap.get(to);
            if (recipientSocketId) {
                io.to(recipientSocketId).emit("call:ice-candidate", { candidate });
            }
        });

        socket.on("call:end", ({ to }) => {
            const recipientSocketId = userSocketMap.get(to);
            if (recipientSocketId) {
                io.to(recipientSocketId).emit("call:ended");
            }
        });

        socket.on("call:reject", ({ to }) => {
            const callerSocketId = userSocketMap.get(to);
            if (callerSocketId) {
                io.to(callerSocketId).emit("call:rejected");
            }
        });

        socket.on("call:busy", ({ to }) => {
            const callerSocketId = userSocketMap.get(to);
            if (callerSocketId) {
                io.to(callerSocketId).emit("call:user-busy");
            }
        });

        // Handle disconnection
        socket.on("disconnect", () => {
            for (const [userId, socketId] of userSocketMap.entries()) {
                if (socketId === socket.id) {
                    userSocketMap.delete(userId);
                    break;
                }
            }
            // Update user status to Offline in DB and broadcast disconnection
            disconnectHandler(socket, io);
            console.log("User disconnected:", socket.id);
        });
    }); // <-- closes io.on('connection')
}; // <-- closes registerSocketServer

module.exports = { registerSocketServer };
