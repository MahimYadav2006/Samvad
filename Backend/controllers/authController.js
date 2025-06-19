// Importing Utilities and libraries
const catchAsync = require('../utilities/catchAsync');
const optGenerator = require('otp-generator');
const jwt = require("jsonwebtoken");
const promisify = require("util");


// Importing Models
import User from '../Models/User';


// Functions
const signToken = (userId) => jwt.sign({userId},process.env.TOKEN_KEY);


// Register New User
exports.register = catchAsync(async(req,res,next)=>{
    const {name,email,password} = req.body;
    const existingUser = await User.findOne({email: email});

    

    if(existingUser && existingUser.verified){
        return res.status(400).json({
            status: "error",
            message: "User already exists and verified ",
        });
    }
    else if(existingUser && !existingUser.verified){
        // delete the existing user
        await User.findOneAndDelete({email: email});
    }
    else{
        const new_user = await User.create({name,email,password});
    }

    req.userId = new_user._id;
    next();
});

// Send OTP
exports.sendOTP = catchAsync(async(req,res,next)=>{
    const {userId} = req;

    // Generate OTP
    const new_otp = optGenerator.generate(4,{
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false,
    });

    // Send OTP to user
    const otp_expiry_time = Date.now() + 10*60*1000; // Convert into ms 
    const user = await User.findByIdAndUpdate(userId, {otp_expiry_time: otp_expiry_time},{new: true, validateModifiedOnly: true});
    user.otp = new_otp;
    await user.save({});

    // Send OTP Via Mail to User

    // Send status
    res.status(200).json({
        status: "success",
        message: "OTP Sent Successfully",
    });
});

// Verify OTP
exports.verifyOTP = catchAsync(async(req,res,next)=>{
    const {email,otp} = req.body;
    const user = await User.findOne({email: email, otp_expiry_time: {$gt: Date.now()}});
    if(!user){
        return res.status(400).json({
            status: "error",
            message: "User not found or otp expired",
        });
    }

    if(user.verified){
        return res.status(400).json({
            status: "error",
            message: "User already verified",
        });
    }

    if(!(await user.correctOTP(otp))){
        return res.status(400).json({
            status: "error",
            message: "Invalid OTP",
        });
    }
    
    // This means that the OTP Is correct
    user.verified = true;               
    user.otp = undefined;
    user.otp_expiry_time = undefined;
    await user.save({new: true, validateModifiedOnly: true});

    const token = signToken(user._id);

    res.status(200).json({
        status: "success",
        message: "Email Verified Successfully",
        token: token,
        user_id: user._id
    });
});

// Resend OTP
exports.resendOTP = catchAsync(async (req,res,next)=>{
    const {email} = req.body;
    const user = await User.findOne({email,});

    if(!user){
        return res.status(400).json({
        status: "error",
        message: "Email is invalid",
        })
    }

    // Generate OTP
    const new_otp = optGenerator.generate(4,{
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false,
    });

    // Send OTP to user
    const otp_expiry_time = Date.now() + 10*60*1000; // Convert into ms 

    user.otp_expiry_time = otp_expiry_time;
    user.otp = new_otp;
    await user.save({});

    // TODO -> Send OTP Via Mail


    return res.status(200).json({
        status: "success",
        message: "OTP Sent Successfully!",
    });
});


// Login
exports.login = catchAsync(async (req,res,next)=>{
    const {email,password} = req.body;

    if(!email || !password){
        return res.status(400).json({
            status: "error",
            message : "Both email and password are required",
        });
    }

    const user = await User.findOne({email: email}).select("+password");

    if(!user || !user.password){
        return res.status(400).json({
            status: "error",
            message: "No record found for this email",
        });
    }

    if(!user || !(await user.correctPassword(password,user.password))){
        return res.status(400).json({
            status: "error",
            message: "Incorrect Password"
        })
    }

    const token = signToken(user._id);

    res.status(200).json({
        status: "success",
        message : "Logged In Successfully",
        token,
        user_id : user._id
    })
});


// Protect
exports.protect = catchAsync(async (req,res,next)=>{
    try{
        // Try to get token
        let token;
        if(req.headers.authorization && req.headers.authorization.startsWith('bearer')){
            token = req.headers.authorization.split(" ")[1];
        }
        else if(req.cookies.jwt){
            token = req.cookies.jwt
        }

        // Check if token exist
        if(!token){
            return res.status(401).json({ // 401 -> Authorization Error Code
                status: "error",
                message : "You are not logged in. Please Login to continue.",
            });
        }

        // Step 2-> Verify the token
        const decoded = await promisify(jwt.verify)(token,process.env.TOKEN_KEY);

        console.log("Message from protect of authcontroller: Value of decoded is ",decoded);

        // Step 3-> Check if User Still Exist
        const this_user = User.findById(decoded.userId);
        if(!this_user){
            return res.status(401).json({
                message: "The user belonging to this token no longer exists",
            });
        }

        // Step 4-> check if user changed password aftr the token was issued
        if(this_user.changedPasswordAfter(decoded.iat)){
            return res.status(401).json({
                status: "error",
                message: "Password was changed recently. Please Login Again",
            });
        }

        // Final Step-> Give access to the protected routes
        req.user = this_user;
        next();

    }catch(error){
        console.log(error);
        console.log("Protect End Point Reached");
        return res.status(400).json({
            status: "error",
            message : "Authentication failed",
        })
    }
});




