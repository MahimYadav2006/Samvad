const User = require("../Models/User");

const newConnectionHandler = async (socket, io, options = {}) => {
    const { isFirstConnection = true } = options;
    const userId = socket.user?.userId;
    if (!userId) {
        console.log(`[newConnectionHandler] Missing userId for socket ${socket.id}`);
        return;
    }

    // Log new user connected
    console.log("New User Connected: (In newConnectionHandler.js): ", socket.id);

    try {
        const user = await User.findByIdAndUpdate(
            userId,
            { socketId: socket.id, status: "Online" },
            { new: true, validateModifiedOnly: true }
        );

        if (user) {
            // Broadcast only when the very first socket for this user gets connected
            if (isFirstConnection) {
                socket.broadcast.emit('user-connected', {
                    message: `${user.name} got connected`,
                    userId: user._id,
                    status: "Online",
                });
            }
        } else {
            console.log(`User with Id ${userId} not found in newConnectionHandler.js`);
        }
    } catch (error) {
        console.error("[newConnectionHandler] Error:", error.message);
    }
};

module.exports = newConnectionHandler;
