const Conversation = require('../models/Conversation');

const chatHistoryHandler = async (socket,data)=>{
    try{
        // Conversation Id
        const {conversationId} = data;
        console.log(`Inside getMessageHistory.js: Conversation Id is ${conversationId} and data is ${data}`);

        // Find out the conversation  by id and populate the message
        const conversation = await Conversation.findById(conversationId).select('messages').populate('message');

        if(!conversation){
            // If conversation not found, send an error
            socket.emit("error",{
                message: "Conversation not found"
            });
            return;
        }
        // If conversation found, send the messages back (prepare the respone data)
        const res_data = {
            conversationId,
            history: conversation.messages,
        }
        // Emit the chat history back to the same client
        socket.emit("chat-history", res_data);

    }
    catch(error){
        // Handle the errors and send the event back
        socket.emit("error",{
            message: "Failed to fetch chat history",error
        });
    }
}

module.exports = chatHistoryHandler;