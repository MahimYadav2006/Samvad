const User = require("../Models/User");
const catchAsync = require("../utilities/catchAsync");

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
})


// UPDATE AVATAR



// UPDATE PASSWORD



// GET USERS



// START CONVERSATIONS



// GET CONVERSATIONS



