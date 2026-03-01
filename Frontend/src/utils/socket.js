import { io } from "socket.io-client";
import { setSocket } from "../redux/slices/user";
import { isJwtToken } from "./authToken";

let socket = null;
const BASE_URL = "http://localhost:8000";

export const connectSocket = (token, store) => {
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
    console.log("Socket connected, ID:", socket.id);
    dispatch(setSocket(socket));
  });

  socket.on("connect_error", (err) => {
    console.error("Socket connection error:", err.message);
  });

  socket.on("new-direct-chat", (data) => {
    const { getState, dispatch } = store;
    const state = getState();

    if (state.user.currConversation === data.conversationId) {
      dispatch({
        type: "user/addCurrMessage",
        payload: data.message,
      });
    }
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
