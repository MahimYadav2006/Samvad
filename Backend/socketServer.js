const authSocket = require('./middleware/authSocket');
const newConnectionHandler = require('./socketHandlers/newConnectionHandler');
const disconnectHandler = require('./socketHandlers/disconnectHandler');
const startTypingHandler = require('./socketHandlers/startTypingHandler');
const stopTypingHandler = require('./socketHandlers/stopTypingHandler');
const chatHistoryHandler = require('./socketHandlers/getMessageHistory');
const newMessageHandler = require('./socketHandlers/newMessageHandler');

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

        // Disconnect handler
        socket.on("disconnect", () => {
            disconnectHandler(socket, io);
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
    });
}

module.exports = { registerSocketServer };
