const jwt = require('jsonwebtoken');

const verifyTokenSocket = (socket,next) => {
    const token = socket.handshake.auth?.token;

    if (!token || typeof token !== "string") {
        const socketError = new Error("NOT AUTHORIZED");
        return next(socketError);
    }

    try{
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);
        socket.user = decoded;
    }catch(err){
        const socketError = new Error("NOT AUTHORIZED");
        return next(socketError);
    }
    next();
}

module.exports = verifyTokenSocket;
