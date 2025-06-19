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

        // New Connection Handler
    })

    setInterval(()=>{
        // emit online users
    },[1000*8])

    // return io;
}

module.exports = {registerSocketServer};