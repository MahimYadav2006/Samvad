const Conversation = require('../Models/Conversation');
const Message = require('../Models/Message');

const newMessageHandler = async (socket, data, io, ack) => {
    console.log(`[newMessageHandler] Data: ${JSON.stringify(data)}`);

    const { message, conversationId } = data;
    const { author, content, media, audioUrl, document, type, giphyUrl } = message;

    try {
        // Find conversation by conversationId
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            console.error(` [newMessageHandler] Conversation not found: ${conversationId}`);
            ack?.({ error: "Conversation not found" });
            return;
        }

        // Create new message
        const newMessage = await Message.create({ author, content, media, audioUrl, document, type, giphyUrl });

        // Add message to conversation
        conversation.messages.push(newMessage._id);
        await conversation.save();

        // Populate conversation
        const updatedConversation = await Conversation.findById(conversationId)
            .populate("messages")
            .populate("participants");

        // Find online participants
        const onlineParticipants = updatedConversation.participants.filter(
            (participant) => participant.status === "Online" && participant.socketId
        );

        console.log(` [newMessageHandler] Online participants:`, onlineParticipants.map(p => p.socketId));

        // Notify online participants
        onlineParticipants.forEach((participant) => {
            io.to(participant.socketId).emit('new-direct-chat', {
                conversationId,
                message: newMessage,
            });
        });

        //  Acknowledge the sender
        ack?.({ success: true, messageId: newMessage._id });
    } catch (error) {
        console.error(` [newMessageHandler] Error:`, error);
        ack?.({ error: "Failed to send message", details: error.message });
    }
};

module.exports = newMessageHandler;
