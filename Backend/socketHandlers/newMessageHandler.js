const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

const newMessageHandler = async (socket,data,io)=>{
    console.log(`Inside newMessageHandler.js: Data is ${JSON.stringify(data)}`);

    const {message,conversationId} = data;
    const {author,content,media,audioUrl,document,type,giphyUrl} = message;

    try{
        // Find conversation by conversation Id
        const conversation = findById(conversationId);
        if(!conversation){
            // If conversation not found, send an error
            socket.emit("error", {
                message: "Conversation not found"
            });
            return;
        }

        // Create a new messgae using the message model
        const newMessage = await create({author,content,media,audioUrl,document,type,giphyUrl});

        // Push the message id to the messages array in the conversation object
        conversation.messages.push(newMessage._id);
        // await conversation.save({});

        // Populate the conversation with messages and participants 
        const updatedConversation = await conversation.findById(conversatio.id).populate("messages").populate("participants");

        // Find the participants who are online in the chat -> To unncessarily avoiding emiting socket event
        const onlineParticipants = updatedConversation.participants.filter((participant)=> participant.status === "Online" && participant.socketId)
        console.log(`Inside newMessageHandler.js: Online participants are `,onlineParticipants);

        // Emit 'new-message' to online users
        onlineParticipants.forEach(participant => {
            console.log(`Inside newMessageHandler: Socket id of online participant of chat is: `,participant.socketId);
            io.to(participant.socketId).emit('new-direct-chat',{
                conversationId: conversationId,
                message: newMessage,
            });
        });
    }
    catch(error){
        console.log(`Inside newMessageHandler.js Error received `, error);
        socket.emit("error",{ message: "Failed to send message", error });
    }
}

module.exports = newMessageHandler;