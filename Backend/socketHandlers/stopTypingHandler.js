const stopTypingHandler = async (socket,data,io)=>{
    const {userId,conversationId} = socket.user; // Fetch user Id of other person and the conversation in which they are currently

    // Fetch User by UserId
    const user = await User.findById(userId);

    if(user && user.status === "Online" && user.socketId){ // if the other user exist and is online then only give them the typing indicator
        const dataToSend = {
            conversationId,
            typing: true,
        };

        io.to(user.socketId).emit("typing-indicator", dataToSend); // Emit the typing indicator to the other user
    }
    else{
        console.log(`Within startTypingHandler.js User with userId ${userId} is offline`);
    }
}

module.exports = stopTypingHandler;