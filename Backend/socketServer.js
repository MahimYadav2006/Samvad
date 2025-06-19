const authSocket = require('./middleware/authsocket');
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
        console.log("A user connected");
        console.log(socket.id);

        // TODO: New Connection Handler

        // TODO: Disconnet handler
        socket.on("disconnect",()=>{

        })

        // TODO: newMessageHandler
        socket.on("new-messgage",(data)=>{

        });

        // TODO: chatHistoryHandler
        socket.on("direct-chat-history",(data)=>{

        })

        // TODO: Start typing handler
        socket.on("start-typing",(data)=>{

        });

        // TODO: Stop typing handler
        socket.on("stop-typing",(data)=>{
            
        });
        
    })

    // return io;
}

module.exports = {registerSocketServer};