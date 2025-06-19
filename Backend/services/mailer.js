const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const OTPTemplate = require('../templates/OTP');


dotenv.config({path: "../config.env"});
const NODEMAILER_USER = process.env.NODEMAILER_USER;
const NODEMAILER_APP_PASSWORD = process.env.NODEMAILER_APP_PASSWORD;

// Create a transporter object using your email service
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    service: 'gmail',
    auth:{
        user: NODEMAILER_USER,
        pass: NODEMAILER_APP_PASSWORD
    },
});

const Mailer =  async (async ({name,otp,email})=>{
    const mailOptions = {
        to: email,
        subject: 'Verify your Samvad Account',
        html: OTPTemplate({name, otp}),
    };

    try{
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent to: %s", email);
    }
    catch (error) {
        console.log('Error sending email:', error);
        throw new Error('Failed to send email');
    }
});

module.exports = Mailer;