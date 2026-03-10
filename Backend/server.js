const dotenv = require("dotenv");
const path = require("path");

// Load env vars BEFORE any other require so that modules like
// cloudinary.js read the correct process.env values at load time.
dotenv.config({ path: path.resolve(__dirname, "config.env") });

const app = require('./app');
const socketServer = require('./socketServer');
const mongoose = require('mongoose');
const http = require('http');
const net = require('net');
const User = require('./Models/User');

const PORT = Number(process.env.PORT || 8000);
const server = http.createServer(app);
socketServer.registerSocketServer(server);

const isPortAvailable = (port) =>
    new Promise((resolve, reject) => {
        const tester = net
            .createServer()
            .once("error", (error) => {
                if (error.code === "EADDRINUSE") {
                    resolve(false);
                    return;
                }
                reject(error);
            })
            .once("listening", () => {
                tester.close((closeError) => {
                    if (closeError) {
                        reject(closeError);
                        return;
                    }
                    resolve(true);
                });
            });

        tester.listen(port);
    });

const resetUserPresence = async () => {
    await User.updateMany(
        {},
        { $set: { status: "Offline" }, $unset: { socketId: 1 } }
    );
    // console.log("✅ Reset all users to Offline state");
};

const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const available = await isPortAvailable(PORT);
        if (!available) {
            console.error(
                `❌ Port ${PORT} is already in use. Stop the existing backend process or change PORT in your environment.`
            );
            await mongoose.connection.close();
            process.exit(1);
            return;
        }

        await resetUserPresence();

        server.listen(PORT, () => {
            console.log("✅ MongoDB Connected and Server started on PORT", PORT);
        });
    } catch (err) {
        console.error("❌ Startup failed");
        console.error(err.message);
        process.exit(1);
    }
};

server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
        console.error(
            `❌ Port ${PORT} is already in use. Stop the existing backend process or change PORT in your environment.`
        );
    } else {
        console.error("❌ Server failed to start:", error.message);
    }
    mongoose.connection.close().finally(() => process.exit(1));
});

startServer();
