const User = require("../Models/User");
const catchAsync = require("../utilities/catchAsync");
const Conversation = require("../Models/Conversation");

exports.getMessages = catchAsync(async (req,res,next)=>{
    const conversationId = req.params.conversationId; // Get conversationId from the request parameters
    const conversation = await Conversation.findById(conversationId).populate("messages").populate("participants");
    res.status(200).json({
        status: "success",
        message: "Messages retrieved successfully",
        data: {
            messages: conversation.messages,
        }
    })
});