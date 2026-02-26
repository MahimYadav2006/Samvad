// Importing Utilities and libraries
const catchAsync = require('../utilities/catchAsync');
const optGenerator = require('otp-generator');
const jwt = require("jsonwebtoken");
const { promisify } = require('util');
const crypto = require("crypto");



// Importing Models
const User = require("../Models/User");
const Mailer = require("../services/mailer");


// Functions
const signToken = (userId) => jwt.sign({userId},process.env.TOKEN_KEY);
const GOOGLE_TOKEN_INFO_URL = "https://oauth2.googleapis.com/tokeninfo";
const GOOGLE_USER_INFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";
const JWT_TOKEN_REGEX = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;

const fetchGoogleTokenInfo = async (accessToken) => {
    try {
        const tokenInfoResponse = await fetch(`${GOOGLE_TOKEN_INFO_URL}?access_token=${encodeURIComponent(accessToken)}`);
        if (!tokenInfoResponse.ok) return null;
        return tokenInfoResponse.json();
    } catch (error) {
        return null;
    }
};

const fetchGoogleUserInfo = async (accessToken) => {
    try {
        const userInfoResponse = await fetch(GOOGLE_USER_INFO_URL, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        if (!userInfoResponse.ok) return null;
        return userInfoResponse.json();
    } catch (error) {
        return null;
    }
};


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
    let new_user;
    if (existingUser && existingUser.verified) {
        return res.status(400).json({
            status: "error",
            message: "User already exists and verified ",
        });
    } else if (existingUser && !existingUser.verified) {
        await User.findOneAndDelete({ email: email });
    }
    new_user = await User.create({ name, email, password });
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
    Mailer({name: user.name, email: user.email, otp: new_otp});

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
        return res.status(405).json({
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

    Mailer({name: user.name, email: user.email, otp: new_otp});

    res.status(200).json({
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

// Google Login / Signup
exports.googleAuth = catchAsync(async (req, res, next) => {
    const { accessToken } = req.body;

    if (!accessToken) {
        return res.status(400).json({
            status: "error",
            message: "Google access token is required",
        });
    }

    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    if (!googleClientId) {
        return res.status(500).json({
            status: "error",
            message: "Google auth is not configured on the server",
        });
    }

    const tokenInfo = await fetchGoogleTokenInfo(accessToken);
    if (!tokenInfo) {
        return res.status(401).json({
            status: "error",
            message: "Invalid Google access token",
        });
    }

    if (tokenInfo.aud !== googleClientId) {
        return res.status(401).json({
            status: "error",
            message: "Google token audience mismatch",
        });
    }

    const googleUser = await fetchGoogleUserInfo(accessToken);
    if (!googleUser) {
        return res.status(401).json({
            status: "error",
            message: "Failed to fetch Google account details",
        });
    }

    const {
        email,
        email_verified: emailVerified,
        name,
        picture,
    } = googleUser;

    if (!email || (emailVerified !== true && emailVerified !== "true")) {
        return res.status(400).json({
            status: "error",
            message: "Google account email is not verified",
        });
    }

    const normalizedEmail = email.toLowerCase();
    let user = await User.findOne({ email: normalizedEmail });
    let isNewUser = false;

    if (!user) {
        isNewUser = true;
        const generatedPassword = `google-${crypto.randomUUID()}-${Date.now()}`;
        user = await User.create({
            name: name || normalizedEmail.split("@")[0],
            email: normalizedEmail,
            password: generatedPassword,
            verified: true,
            avatar: picture || undefined,
        });
    } else {
        let shouldSave = false;

        if (!user.verified) {
            user.verified = true;
            user.otp = undefined;
            user.otp_expiry_time = undefined;
            shouldSave = true;
        }

        if (!user.name && name) {
            user.name = name;
            shouldSave = true;
        }

        if (!user.avatar && picture) {
            user.avatar = picture;
            shouldSave = true;
        }

        if (shouldSave) {
            await user.save({ validateModifiedOnly: true });
        }
    }

    const token = signToken(user._id);

    return res.status(200).json({
        status: "success",
        message: isNewUser ? "Signed up with Google successfully" : "Logged in with Google successfully",
        token,
        user_id: user._id,
    });
});

// Protect
exports.protect = catchAsync(async (req,res,next)=>{
    // Try to get token
    const authHeader = req.headers.authorization || req.headers.Authorization;
    let token = null;

    if (typeof authHeader === "string" && /^bearer\s+/i.test(authHeader)) {
        token = authHeader.replace(/^bearer\s+/i, "").trim();
    } else if (req.cookies && typeof req.cookies.jwt === "string") {
        token = req.cookies.jwt.trim();
    }

    if (!token || token.toLowerCase() === "undefined" || token.toLowerCase() === "null") {
        return res.status(401).json({
            status: "error",
            message : "You are not logged in. Please Login to continue.",
        });
    }

    if (!JWT_TOKEN_REGEX.test(token)) {
        return res.status(401).json({
            status: "error",
            message: "Invalid authentication token format",
        });
    }

    let decoded;
    try {
        decoded = await promisify(jwt.verify)(token,process.env.TOKEN_KEY);
    } catch (error) {
        return res.status(401).json({
            status: "error",
            message: "Authentication failed",
        });
    }

    // Step 3-> Check if User Still Exist
    const this_user = await User.findById(decoded.userId);
    if(!this_user){
        return res.status(401).json({
            status: "error",
            message: "The user belonging to this token no longer exists",
        });
    }

    // Step 4-> check if user changed password aftr the token was issued
    if(await this_user.changedPasswordAfter(decoded.iat)){
        return res.status(401).json({
            status: "error",
            message: "Password was changed recently. Please Login Again",
        });
    }

    // Final Step-> Give access to the protected routes
    req.user = this_user;
    next();
});

