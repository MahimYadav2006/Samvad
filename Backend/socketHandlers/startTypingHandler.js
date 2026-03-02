const User = require("../Models/User");

const startTypingHandler = async (socket, data, io) => {
    const { userId, conversationId } = data; // userId = recipient's ID, conversationId = current conversation

    if (!userId || !conversationId) {
        console.log("[startTypingHandler] Missing userId or conversationId");
        return;
    }

    try {
        const user = await User.findById(userId);

        if (user && user.status === "Online" && user.socketId) {
            const dataToSend = {
                conversationId,
                typing: true,
                senderId: socket.user.userId,
            };

            io.to(user.socketId).emit("typing-indicator", dataToSend);
        }
    } catch (err) {
        console.error("[startTypingHandler] Error:", err.message);
    }
};

module.exports = startTypingHandler;