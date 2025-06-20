const User = require("../Models/User");
const catchAsync = require("../utilities/catchAsync");
const Conversation = require("../models/Conversation");

// GET ME
exports.getMe = catchAsync(async (req,res,next)=>{
    const {user} = req;


    res.status(200).json({
        status: "success",
        message: "User Info Found Successfully",
        data:{
            user,
        }
    })
})

// UPDATE ME
exports.updateMe = catchAsync(async (req,res,next)=>{
    const {name,jobTitle,bio,country} = req.body;
    const {_id} = req.user;

    const updateUser = await User.findByIdAndUpdate(_id,{name,jobTitle,bio,country},{new:true, validateModifiedOnly: true});
    res.status(200).json({
        status: "success",
        message: "Profile Info Updated Successfully",
        data:{
            user: updateUser,
        }
    });
});


// UPDATE AVATAR
exports.updateAvatar = catchAsync(async (req,res,next)=>{
    const {avatar} = req.body;
    const {_id} = req.user;

    const updateUser = await User.findByIdAndUpdate(_id,{avatar},{new:true, validateModifiedOnly: true});
    res.status(200).json({
        status: "success",
        message: "Avatar Updated Successfully",
        data:{
            user: updateUser,
        }
    });
});


// UPDATE PASSWORD
exports.updatePassword = catchAsync(async (req,res,next)=>{
    const {currentPassword,newPassword} = req.body;
    const {_id} = req.user;

    const user = User.findById(_id).select("+password");
    if(!user || !(await user.correctPassword(currentPassword, user.password))){
        return res.status(400).json({
            status: "Error",
            message: "Invalid User or Password",
        });
    }

    user.password = newPassword;
    user.passwordChangedAt = Date.now();
    await user.save({});
    res.status(200).json({
        status: "success",
        message: "Password Updated Successfully",
    });
})


// GET USERS
exports.getUsers = catchAsync(async (req,res,next)=>{
    const {_id} = req.user;
    const other_verified_users = User.find({_id : {$ne: _id}, verified: true}).select("name avatar _id status");

    res.status(200).json({
        status: "success",
        message: "Users Found Successfully",
        data:{
            users: other_verified_users,
        }
    });
});


// START CONVERSATIONS
exports.startConversation = catchAsync(async (req,res,next)=>{
    const {userId} = req.body; // Other person's Id
    const {_id} = req.user; // Our own Id

    // Check if an conversation between both users alreasy exist
    let conversation = await Conversation.findOne({
        participants: {$all: [userId, _id]},
    }).populate("messages").populate("participants");

    if(conversation){
        res.status(200).json({
            status: "success",
            message: "Conversation Found Successfully",
            data: {
                conversation,
            }
        });
    }
    else{
        let newConversation = await Conversation.create({
            participants: [_id, userId],
        });

        newConversation = await Conversation.findById(newConversation._id).populate("messages").populate("participants");
        
        res.status(201).json({ // New record created - 201
            status: "success",
            message: "New Conversation Created Successfully",
            data: {
                conversation: newConversation,
            }
        });
    }
});


// GET CONVERSATIONS
exports.getConversations = catchAsync(async (req,res,next)=>{  
    const {_id} = req.user;

    const conversations = await Conversation.find({
        participants: {$in: [_id],},
    }).populate("messages").populate("participants");

    res.status(200).json({
        status: "success",
        message: "Conversations Found Successfully",
        data: {
            conversations,
        }
    });
});

