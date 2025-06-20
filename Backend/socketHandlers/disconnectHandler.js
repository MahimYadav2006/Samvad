const User = require("../Models/User")

const disconnectHandler = async (socket,io)=>{
    // Log the connection
    console.log(`User with socker ${socket.id} got disconnected in disconnectHandler.js`);

    // Update the user set the socker Id to undefined and status to offline
    const user = await User.findOneAndUpdate({socketId: socket.id},{socketId: undefined,status:"Offline"},{new:true, validateModifiedOnly: true});
    
    if(user){
        // broadcast to everyone that new user got disconnected
        socket.broadcast.emit('user-disconnected',{
            message: `${user.name} got disconnected in disconnectHandler.js`,
            userId: user.id,
            status: "Offline",
        });
        
    }
    else{
        console.log(`User with Id ${socker.id} not found in newConnectionHandler.js`)
    }
}

module.exports = disconnectHandler;