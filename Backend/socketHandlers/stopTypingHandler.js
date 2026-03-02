const User = require("../Models/User");

const stopTypingHandler = async (socket, data, io) => {
    const { userId, conversationId } = data; // userId = recipient's ID, conversationId = current conversation

    if (!userId || !conversationId) {
        console.log("[stopTypingHandler] Missing userId or conversationId");
        return;
    }

    try {
        const user = await User.findById(userId);

        if (user && user.status === "Online" && user.socketId) {
            const dataToSend = {
                conversationId,
                typing: false,
                senderId: socket.user.userId,
            };

            io.to(user.socketId).emit("typing-indicator", dataToSend);
        }
    } catch (err) {
        console.error("[stopTypingHandler] Error:", err.message);
    }
};

module.exports = stopTypingHandler;