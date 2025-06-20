const authSocket = require('./middleware/authsocket');
const newConnectionHandler = require('./socketHandlers/newConnectionHandler');
const disconnectHandler = require('./socketHandlers/disconnectHandler');
const startTypingHandler = require('./socketHandlers/startTypingHandler');
const stopTypingHandler = require('./socketHandlers/stopTypingHandler');
const chatHistoryHandler = require('./socketHandlers/getMessageHistory');
const newMessageHandler = require('./socketHandlers/newMessageHandler').default;


const registerSocketServer = (server) => {
    const io = require('socket.io')(server,{
        cors:{
            origin: "*",
            methods: ["GET", "POST"],
        }
    });

    io.use((socket,next)=>{
        authSocket(socket,next);
    })

    io.on('connection',(socket)=>{
        console.log("Inside sockerServer.js , A user connected");
        console.log(socket.id);

        // New Connection Handler
        newConnectionHandler(socket,io);

        //  Disconnet handler
        socket.on("disconnect",()=>{
            disconnectHandler(socket,io);
        })

        // newMessageHandler
        socket.on("new-messgage",(data)=>{
            newMessageHandler(socket,data,io);
        });

        //chatHistoryHandler
        socket.on("direct-chat-history",(data)=>{
            chatHistoryHandler(socket,data);
        })

        // Start typing handler
        socket.on("start-typing",(data)=>{
            startTypingHandler(socket,data,io);
        });

        //Stop typing handler
        socket.on("stop-typing",(data)=>{
            stopTypingHandler(socket,data,io);
        });
        
    })

    // return io;
}

module.exports = {registerSocketServer};