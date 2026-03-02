const User = require("../Models/User")

const disconnectHandler = async (socket, io, options = {}) => {
    const {
        userId: providedUserId,
        hasOtherConnections = false,
        nextSocketId = null,
    } = options;

    // Log the connection
    console.log(`User with socket ${socket.id} got disconnected in disconnectHandler.js`);

    try {
        const userId = providedUserId || socket.user?.userId;
        if (!userId) {
            // Fallback if socket.user isn't available
            const userBySocket = await User.findOneAndUpdate(
                { socketId: socket.id },
                { $unset: { socketId: 1 }, status: "Offline" },
                { new: true, validateModifiedOnly: true }
            );

            if (userBySocket) {
                socket.broadcast.emit('user-disconnected', {
                    message: `${userBySocket.name} got disconnected in disconnectHandler.js`,
                    userId: userBySocket._id,
                    status: "Offline",
                });
            }
            return;
        }

        if (hasOtherConnections) {
            // Keep user online if at least one socket is still active.
            const updates = { status: "Online" };
            if (nextSocketId) {
                updates.socketId = nextSocketId;
            }

            await User.findByIdAndUpdate(
                userId,
                updates,
                { new: true, validateModifiedOnly: true }
            );
            return;
        }

        // Last socket disconnected -> mark offline.
        const user = await User.findByIdAndUpdate(userId, {
            $unset: { socketId: 1 },
            status: "Offline",
        }, { new: true, validateModifiedOnly: true });
        
        if (user) {
            // Broadcast only when user's final socket disconnects
            socket.broadcast.emit('user-disconnected', {
                message: `${user.name} got disconnected`,
                userId: user._id,
                status: "Offline",
            });
        }
    } catch (error) {
        console.error("Error in disconnectHandler:", error);
    }
}

module.exports = disconnectHandler;
