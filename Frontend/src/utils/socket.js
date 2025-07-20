import { io } from "socket.io-client";
import { reset as resetUser } from "../redux/slices/user";
import { reset as resetAuth } from "../redux/slices/auth";
import { reset as resetChat } from "../redux/slices/chat";
import { reset as resetApp } from "../redux/slices/app";
let socket = null;

export const connectSocket =  (token, store) => {
  socket = io("http://localhost:8000", {
    auth: { token },
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected! ID:", socket.id);
  });

  socket.on("connect_error", (err) => {
    console.error("❌ Socket connection error:", err.message);
  });

  socket.on("new-direct-chat", (data) => {
    console.log("New Message Received from backend", data);

    const { getState, dispatch } = store;

    const state = getState();

    if (state.user.currConversation === data.conversationId) {
      // ✅ update only if conversation matches
      dispatch({
        type: "user/addCurrMessage",
        payload: data.message,
      });
    } else {
      // optionally increment unread counter or something else
      console.log("Message for another conversation");
    }
  });

  socket.on("chat-history",(data)=>{
    console.log("Data of chat History Received", data);
  })

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = (store) => {
  if (socket) {
    socket.disconnect();

    socket = null;
    console.log("🔌 Socket disconnected.");
    const { dispatch } = store;

    // Reset all slices
    dispatch(resetUser());
    dispatch(resetAuth());
    dispatch(resetChat());
    dispatch(resetApp());
  }
};
