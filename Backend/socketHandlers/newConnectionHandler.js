// Firstly uopdated the socketId and the status in the User model

const User = require("../Models/User");

let newConnectionHandler = async (socket,io)=>{
    const {userId} = socket.user;

    // Log new user connected
    console.log("New User Connected: (In newConnectionHandler.js): ",socket.id);

    const user = await User.findByIdAndUpdate(userId,{sockerId: socket.id, status: "Online"},{new: true, validateModifiedOnly: true});

    if(user){
        // broadcast to everyone that new user got connected
        socket.broadcast.emit('user-connected',{
            message: `${user.name} got connected`,
            userId: user.id,
            status: "Online",
        });

    }
    else{
        console.log(`User with Id ${userId} not found in newConnectionHandler.js`)
    }
     


}




module.exports = newConnectionHandler;