const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config({path: "../config.env"});
const config = process.env;

const verifyTokenSocket = (socket,next) => {
    const token = socket.handshake.auth?.token;

    try{
        const decoded = jwt.verify(token,config.TOKEN_KEY);
        socket.user = decoded;
    }catch(err){
        const socketError = new Error("NOT AUTHORIZED");
        return next(socketError);
    }
    next();
}

module.exports = verifyTokenSocket;