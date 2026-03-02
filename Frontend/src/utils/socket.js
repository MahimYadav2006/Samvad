import { io } from "socket.io-client";
import { setSocket, updateOppositeUserStatus } from "../redux/slices/user";
import { setTypingIndicator, updateUserOnlineStatus } from "../redux/slices/chat";
import { isJwtToken } from "./authToken";
import { getBackendUrl } from "./networkConfig";

let socket = null;
const BASE_URL = getBackendUrl();

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

  // Typing indicator listener
  socket.on("typing-indicator", (data) => {
    dispatch(setTypingIndicator({
      conversationId: data.conversationId,
      typing: data.typing,
    }));
  });

  // Online status listeners
  socket.on("user-connected", (data) => {
    dispatch(updateUserOnlineStatus({
      userId: data.userId,
      status: "Online",
    }));
    dispatch(updateOppositeUserStatus({
      userId: data.userId,
      status: "Online",
    }));
  });

  socket.on("user-disconnected", (data) => {
    dispatch(updateUserOnlineStatus({
      userId: data.userId,
      status: "Offline",
    }));
    dispatch(updateOppositeUserStatus({
      userId: data.userId,
      status: "Offline",
    }));
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
