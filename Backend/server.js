const app = require('./app');
const dotenv = require("dotenv");
const socketServer = require('./socketServer');
dotenv.config({path: "./config.env"});

const mongoose = require('mongoose');
const PORT = process.env.port || process.env.API_PORT;
const http = require('http');
const server = http.createServer(app);  
socketServer.registerSocketServer(server);


mongoose.connect(process.env.MONGO_URI).then(() => {
    server.listen(PORT,()=>{
        console.log("MongoDB Connected and Server started on PORT",PORT);
    })
}).catch((err)=>{
    console.log("MONGODB Connection Failed and server not started ");
    console.log(err);
})


