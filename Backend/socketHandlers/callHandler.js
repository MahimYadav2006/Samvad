// Handle all WebRTC signaling events

const callHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected for calls:", socket.id);

    // User calls another user
    socket.on("call:initiate", ({ to, offer, from, callerName }) => {
      console.log(`Call initiated from ${from} to ${to}`);
      io.to(to).emit("call:incoming", {
        from,
        offer,
        callerName,
      });
    });

    // User answers the call
    socket.on("call:answer", ({ to, answer }) => {
      console.log(`Call answered, sending to ${to}`);
      io.to(to).emit("call:answered", { answer });
    });

    // ICE candidate exchange
    socket.on("call:ice-candidate", ({ to, candidate }) => {
      io.to(to).emit("call:ice-candidate", { candidate });
    });

    // End call
    socket.on("call:end", ({ to }) => {
      console.log("Call ended");
      io.to(to).emit("call:ended");
    });

    // Reject call
    socket.on("call:reject", ({ to }) => {
      io.to(to).emit("call:rejected");
    });

    // User is busy
    socket.on("call:busy", ({ to }) => {
      io.to(to).emit("call:user-busy");
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};

module.exports = callHandler;
