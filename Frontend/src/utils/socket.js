import { io } from "socket.io-client";
import { setSocket, updateOppositeUserStatus } from "../redux/slices/user";
import { setTypingIndicator, updateUserOnlineStatus } from "../redux/slices/chat";
import { isJwtToken } from "./authToken";
import { getBackendUrl } from "./networkConfig";
import { decryptMessage, getStoredPrivateKey } from "./encryption";

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

  socket.on("new-direct-chat", async (data) => {
    const { getState, dispatch } = store;
    const state = getState();

    if (state.user.currConversation === data.conversationId) {
      let message = { ...data.message };

      // E2EE: decrypt content if encrypted
      const currentUserId = state.auth.user?._id;
      if (message.iv && message.encryptedKeys && currentUserId) {
        try {
          const privateKeyJwk = getStoredPrivateKey(currentUserId);
          const encKeys = message.encryptedKeys instanceof Map
            ? Object.fromEntries(message.encryptedKeys)
            : (typeof message.encryptedKeys === 'object' ? message.encryptedKeys : {});
          const wrappedKey = encKeys[currentUserId];
          if (!privateKeyJwk || !wrappedKey) {
            // Private key missing or message was not encrypted for us
            message.content = "🔒 Unable to decrypt message";
          } else {
            message.content = await decryptMessage(
              message.content,
              message.iv,
              wrappedKey,
              privateKeyJwk
            );
          }
        } catch (err) {
          console.error("[E2EE] Decryption failed for incoming message:", err);
          message.content = "🔒 Unable to decrypt message";
        }
      }

      dispatch({
        type: "user/addCurrMessage",
        payload: message,
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
