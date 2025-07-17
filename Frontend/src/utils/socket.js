import { io } from "socket.io-client";

let socket = null;

export const connectSocket = (token) => {
  socket = io("http://localhost:8000", {
    auth: { token },
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected! ID:", socket.id);
  });

  socket.on("connect_error", (err) => {
    console.error("❌ Socket connection error:", err.message);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("🔌 Socket disconnected.");
  }
};
