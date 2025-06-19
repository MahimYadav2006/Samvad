const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true, // to remove the spaces before and after the name
    },
    jobTitle:{
        type: String,
    },
    bio:{
        type: String,
        trim: true,
    },
    country:{
        type: String,
    },
    avatar:{
        type: String,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        validate: {
            validator: function(value){
                return validator.isEmail(value);
            },
            message: (props) => `${props.value} is not a valid email address`,
        },
        unique: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    passwordChangedAt: {
        type: Date,
    },
    verified:{
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    otp:{
        type: String,
    },
    otp_expiry_time:{
        type: Date,
    },
    status:{
        type: String,
        enum: ["Online","Offline","Busy"],
        default: "Offline",
    },
    socketId:{
        type: String,
    }
},{timestamps: true})


// Pre save hook
userSchema.pre("save", async function(next){ // Everyttime before the user is saved, this function will be executed
    // Run only if the OTP is modified
    if(this.otp && this.isModified("otp")){
        // Hash the OTP with cost of 12     
        this.otp = await bcrypt.hash(this.otp.toString(), 12);
        console.log("From Pre save hook " , this.otp);
    }
    if(this.password && this.isModified("password")){
        // Hash the Pass with cost of 12     
        this.password = await bcrypt.hash(this.password, 12);
        console.log("From Pre save hook " , this.password);
    }
    next();
});


// Methods
userSchema.methods.correctOTP = async function(candidateOTP){
    return await bcrypt.compare(candidateOTP, this.otp);
}
userSchema.methods.correctPassword = async function(candidatePassword,userPassword){
    return await bcrypt.compare(candidatePassword,userPassword);
}
userSchema.methods.changedPasswordAfter = function (JWTimestamp){
    if(this.passwordChangedAt){
        const changedTimeStamp = parseInt(this.passwordChangedAt.getTime()/1000,10);
        return JWTimestamp < changedTimeStamp;
    }
    return false;
}

// TODO -> Update Password


// Modeling the Schema
const User = new mongoose.model("User", userSchema); // This name User will show as a collection in the database
module.exports = User;