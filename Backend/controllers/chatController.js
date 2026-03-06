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

exports.uploadDoc = catchAsync(async (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const { secure_url, originalname: name, mimetype, filename: public_id } = req.file;
    const size = req.file.size || req.file.bytes || null;

    res.status(200).json({
        status: "success",
        message: "Document uploaded successfully",
        data: {
            url : secure_url,
            name,
            size,
            type: mimetype,
            public_id
        }
    });
});

exports.uploadAudio = catchAsync(async (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ error: "No audio file uploaded" });
    }
    res.status(200).json({
        status: "success",
        message: "Audio uploaded successfully",
        data: {
            audioUrl : req.file.secure_url
        }
    });
});

exports.uploadMedia = catchAsync(async (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({ error: "No media file uploaded" });
    }
  
    const { secure_url, originalname: name, mimetype, filename: public_id, size } = req.file;
    console.log(req.file);
    res.status(200).json({
      status: "success",
      message: "Media file uploaded successfully",
      data: {
        url: secure_url,
        name,
        size,
        type: mimetype,
        public_id,
      }
    });
});
  
  