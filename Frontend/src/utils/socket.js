import { io } from "socket.io-client";
import { reset as resetUser } from "../redux/slices/user";
import { reset as resetAuth } from "../redux/slices/auth";
import { reset as resetChat } from "../redux/slices/chat";
import { reset as resetApp } from "../redux/slices/app";
import { setSocket } from "../redux/slices/user";
import { isJwtToken } from "./authToken";
// import { dispatch } from "../redux/store";
let socket = null;
let BASE_URL = "http://localhost:8000";

export const connectSocket =  (token, store) => {
  if (!isJwtToken(token)) {
    return null;
  }

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  const { dispatch } = store;
  socket = io(BASE_URL, {
    auth: { token },
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected!  and setted socket ID:", socket.id);
    dispatch(setSocket(socket));
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
    if (store?.dispatch) {
      const { dispatch } = store;

      // Reset all slices
      dispatch(resetUser());
      dispatch(resetAuth());
      dispatch(resetChat());
      dispatch(resetApp());
    }
  }
};
