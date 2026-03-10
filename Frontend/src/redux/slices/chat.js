import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/axios';
import {toast} from "react-toastify";
import { getSocket } from '../../utils/socket';
import { isJwtToken } from '../../utils/authToken';
import { encryptMessage, getStoredPrivateKey } from '../../utils/encryption';

const initialState = {
    userList: [],
    isLoading: false,
    error: null,
    typingIndicators: {}, // { [conversationId]: boolean }
};

const slice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        updateUserList(state, action) {
            state.userList = action.payload;
        },
        setError(state, action) {
            state.error = action.payload;
        },
        setLoading(state, action) {
            state.isLoading = action.payload;
        },
        setTypingIndicator(state, action) {
            const { conversationId, typing } = action.payload;
            if (typing) {
                state.typingIndicators[conversationId] = true;
            } else {
                delete state.typingIndicators[conversationId];
            }
        },
        updateUserOnlineStatus(state, action) {
            const { userId, status } = action.payload;
            state.userList = state.userList.map((user) =>
                user._id === userId ? { ...user, status } : user
            );
        },
        reset: () => initialState,
    }
});

export default slice.reducer;
export const { reset, setTypingIndicator, updateUserOnlineStatus } = slice.actions;
const { setLoading, setError, updateUserList } = slice.actions;

const getAuthToken = (getState) => {
    const token = getState().auth.token;
    return isJwtToken(token) ? token : null;
};

// Fetching User List
export function fetchUserList(){
    return async (dispatch,getState)=>{
        // Check if prev state is disturbed
        dispatch(setError(null));
        dispatch(setLoading(true));
        const token = getAuthToken(getState);
        if (!token) {
            dispatch(setError({ message: "Invalid auth token" }));
            dispatch(setLoading(false));
            return;
        }
        // Make API Call
        await axios.get("/user/users", {
        headers: {
          authorization: `bearer ${token}`,
        },
      }).then(function (response){
            dispatch(updateUserList(response.data.data.users));
            // toast.success(response.data.message);
        }).catch(function (error){
            toast.error(error?.message || "Something went wrong"
);
            dispatch(setError(error));
        }).finally(()=>{
            dispatch(setLoading(false));
        });
    }
}

// Direct Message
export function newDirectMessage(data) {
    return async (dispatch, getState) => {
        dispatch(setError(null));
        dispatch(setLoading(true));

        const socket = getSocket();
        if (!socket) {
            toast.error("Socket connection lost.");
            dispatch(setLoading(false));
            return;
        }

        let messagePayload = { ...data };

        // E2EE: encrypt text content if both participants have public keys
        const state = getState();
        const currentUserId = state.auth.user?._id;
        const oppositeUser = state.user.oppositeUser;
        const currentUser = state.user.user;
        const token = getAuthToken(getState);

        if (
            messagePayload.content &&
            currentUserId &&
            oppositeUser?._id
        ) {
            try {
                // Always fetch the latest public key for the receiver from the
                // backend to avoid using a stale key if they rotated.
                let receiverPubKey = null;
                let senderPubKey = null;

                if (token) {
                    const freshRes = await axios.get(
                        `/user/someone?userId=${oppositeUser._id}`,
                        { headers: { authorization: `bearer ${token}` } }
                    );
                    const freshPubKeyRaw = freshRes.data?.data?.user?.publicKey;
                    if (freshPubKeyRaw) {
                        receiverPubKey = typeof freshPubKeyRaw === "string"
                            ? JSON.parse(freshPubKeyRaw) : freshPubKeyRaw;
                    }
                }

                // For the sender's own key, derive from the locally stored private
                // key so we never rely on a possibly-stale Redux value.
                const ownPrivateKey = getStoredPrivateKey(currentUserId);
                if (ownPrivateKey) {
                    // Strip RSA private fields to get the public JWK
                    const RSA_PRIVATE_FIELDS = ["d", "dp", "dq", "p", "q", "qi"];
                    senderPubKey = Object.fromEntries(
                        Object.entries(ownPrivateKey).filter(([key]) => !RSA_PRIVATE_FIELDS.includes(key))
                    );
                    // Fix key_ops for public key usage
                    senderPubKey.key_ops = ["wrapKey"];
                } else if (currentUser?.publicKey) {
                    senderPubKey = typeof currentUser.publicKey === "string"
                        ? JSON.parse(currentUser.publicKey) : currentUser.publicKey;
                }

                if (senderPubKey && receiverPubKey) {
                    const publicKeysMap = {
                        [currentUserId]: senderPubKey,
                        [oppositeUser._id]: receiverPubKey,
                    };

                    const { encryptedContent, iv, encryptedKeys } = await encryptMessage(
                        messagePayload.content,
                        publicKeysMap
                    );

                    messagePayload.content = encryptedContent;
                    messagePayload.iv = iv;
                    messagePayload.encryptedKeys = encryptedKeys;
                } else {
                    console.warn("[E2EE] Missing public key(s), sending plaintext.",
                        { hasSender: !!senderPubKey, hasReceiver: !!receiverPubKey });
                }
            } catch (err) {
                console.error("[E2EE] Encryption failed, sending plaintext:", err);
            }
        }

        const newData = {
            message: messagePayload,
            conversationId: getState().user.currConversation,
        };

        socket.emit('new-message', newData, (response) => {
            if (response?.error) {
                toast.error(response.error || "Failed to send message");
            } else {
                // dispatch(fetchMessages(getState().user.currConversation));
                toast.success("Message sent successfully");
            }
            dispatch(setLoading(false));
        });
    };
}

// Upload Doc
export const uploadDocument = createAsyncThunk(
    "chat/uploadDocument",
    async (file, { getState, rejectWithValue }) => {
      try {
        const formData = new FormData();
        formData.append("document", file);

        const token = getAuthToken(getState);
        if (!token) {
          return rejectWithValue({ message: "Invalid auth token" });
        }

        const res = await axios.post("/chat/upload-doc", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            authorization: `bearer ${token}`,
          },
        });

        return res.data.data; // {url, name, size, type, public_id}
      } catch (err) {
        return rejectWithValue(err?.response?.data || err.message);
      }
    }
  );


// Upload the audio message
export function uploadAudioMessage(file) {
    return async (dispatch, getState) => {
        dispatch(setError(null));
        dispatch(setLoading(true));
        const token = getAuthToken(getState);
        if (!token) {
            dispatch(setError({ message: "Invalid auth token" }));
            dispatch(setLoading(false));
            return null;
        }

        try {
            const formData = new FormData();
            formData.append("audio", file);

            const response = await axios.post("/chat/upload-audio", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    authorization: `bearer ${token}`,
                },
            });

            const audioUrl = response.data.data.audioUrl;
            toast.success("Audio uploaded successfully");
            // optionally return or dispatch audioUrl here
            return audioUrl;

        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to upload audio");
            dispatch(setError(err));
            return null;
        } finally {
            dispatch(setLoading(false));
        }
    };
}

// Upload Media
export function uploadMedia(file) {
    return async (dispatch, getState) => {
      dispatch(setError(null));
      dispatch(setLoading(true));
      const token = getAuthToken(getState);
      if (!token) {
        dispatch(setError({ message: "Invalid auth token" }));
        dispatch(setLoading(false));
        return null;
      }

      try {
        const formData = new FormData();
        formData.append("media", file); // Single file

        const response = await axios.post("/chat/upload-media", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            authorization: `bearer ${token}`,
          },
        });

        const uploadedFile = response.data.data;
        toast.success("Media uploaded successfully");
        return uploadedFile;

      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to upload media");
        dispatch(setError(err));
        return null;
      } finally {
        dispatch(setLoading(false));
      }
    };
  }
