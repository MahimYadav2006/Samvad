import { createSlice } from '@reduxjs/toolkit';
import axios from '../../utils/axios';
import {toast} from "react-toastify";
import { getSocket } from '../../utils/socket';
import { isJwtToken } from '../../utils/authToken';
import { decryptMessage, getStoredPrivateKey } from '../../utils/encryption';

const initialState = {
    isLoading: false,
    error: null,
    user: {},
    currConversation: null, // to store current conversation ID
    currMessages: [],
    oppositeUser: {},
    socket: null,
};

const slice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setError(state,action){
            state.error = action.payload;
        },
        setLoading(state,action){
            state.isLoading = action.payload;
        },
        setUser(state,action){
            state.user = action.payload;
        },
        setCurrentConversation(state, action) {
            state.currConversation = action.payload;
        },
        setCurrMessages(state,action){
            state.currMessages = action.payload;
        },
        setOppositeUser(state, action) {
            state.oppositeUser = action.payload;
        },
        setSocket(state, action) {
            state.socket = action.payload;
        },
        addCurrMessage(state, action) {
            state.currMessages.push(action.payload);
        },
        updateOppositeUserStatus(state, action) {
            const { userId, status } = action.payload;
            if (state.oppositeUser && state.oppositeUser._id === userId) {
                state.oppositeUser = { ...state.oppositeUser, status };
            }
        },
        reset: () => initialState,
    }
});

export default slice.reducer;
const { addCurrMessage } = slice.actions;
export { addCurrMessage };

export const { reset } = slice.actions;
const {setLoading,setError,setUser,setCurrentConversation,setCurrMessages,setOppositeUser,setSocket} = slice.actions;
export {setSocket};
export const { updateOppositeUserStatus } = slice.actions;

const getAuthToken = (getState) => {
    const token = getState().auth.token;
    return isJwtToken(token) ? token : null;
};

/**
 * Decrypt an array of messages using the current user's private key.
 * Messages without encryption fields are returned as-is.
 */
async function decryptMessages(messages, currentUserId) {
    if (!messages || !messages.length || !currentUserId) return messages;
    const privateKeyJwk = getStoredPrivateKey(currentUserId);
    if (!privateKeyJwk) return messages;

    const decrypted = await Promise.all(
        messages.map(async (msg) => {
            if (!msg.iv || !msg.encryptedKeys) return msg;
            try {
                const encKeys = msg.encryptedKeys instanceof Map
                    ? Object.fromEntries(msg.encryptedKeys)
                    : (typeof msg.encryptedKeys === 'object' ? msg.encryptedKeys : {});
                const wrappedKey = encKeys[currentUserId];
                if (!wrappedKey) {
                    // No wrapped key for this user — message was not encrypted
                    // for us (e.g. sender didn't have our public key at the time)
                    return { ...msg, content: "🔒 Unable to decrypt message" };
                }
                const plaintext = await decryptMessage(
                    msg.content,
                    msg.iv,
                    wrappedKey,
                    privateKeyJwk
                );
                return { ...msg, content: plaintext };
            } catch (err) {
                console.error("[E2EE] Decryption failed for message:", msg._id, err);
                return { ...msg, content: "🔒 Unable to decrypt message" };
            }
        })
    );
    return decrypted;
}

export function findUser(currId) {
    return async (dispatch, getState) => {
        dispatch(setError(null));
        dispatch(setLoading(true));
        if(currId === null || currId === undefined){
            dispatch(setLoading(false));
            return;
        }
        const token = getAuthToken(getState);
        if (!token) {
            dispatch(setError({ message: "Invalid auth token" }));
            dispatch(setLoading(false));
            return;
        }
        try {
            const res = await axios.get(`/user/someone?userId=${currId}`, {
                headers: {
                    authorization: `bearer ${token}`,
                },
            });
            dispatch(setUser(res.data.data.user));
        } catch (err) {
            dispatch(setError(err));
            toast.error(err?.message || 'Something went wrong');
        } finally {
            dispatch(setLoading(false));
        }
    };
}

export function updateUserDetails(formData) {
    return async (dispatch,getState) =>{
        dispatch(setError(null));
        dispatch(setLoading(true));
        const token = getAuthToken(getState);
        if (!token) {
            dispatch(setError({ message: "Invalid auth token" }));
            dispatch(setLoading(false));
            return;
        }
        const reqBody = {...formData};

        // API CALL
        await axios.patch("/user/me",reqBody,{
            headers:{
                "Content-Type": "application/json",
                "authorization": `bearer ${token}`,
            },
        }).then((response)=>{
            const {message} = response.data;
            toast.success(message || "User details updated Successfully");
        }).catch((error)=>{
            dispatch(setError(error));
            toast.error(error?.message || "Something Went Wrong");
        }).finally(()=>{
            dispatch(setLoading(false));
        });
    }
}

export function updateAvatar(formData) {
  return async (dispatch, getState) => {
    dispatch(setError(null));
    dispatch(setLoading(true));
    const token = getAuthToken(getState);
    if (!token) {
      dispatch(setError({ message: "Invalid auth token" }));
      dispatch(setLoading(false));
      return;
    }

    try {
      const response = await axios.patch("/user/update-avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          authorization: `bearer ${token}`,
        },
      });

      const { message, data } = response.data;

      // Update user in Redux with new avatar
      if (data?.user) {
        dispatch(setUser(data.user)); // this updates avatar/profile image
      }

      toast.success(message || "Avatar updated successfully");
    } catch (error) {
      dispatch(setError(error));
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      dispatch(setLoading(false));
    }
  };
}

export function updatePassword(formData){
    return async (dispatch,getState) =>{
        dispatch(setError(null));
        dispatch(setLoading(true));
        const token = getAuthToken(getState);
        if (!token) {
            dispatch(setError({ message: "Invalid auth token" }));
            dispatch(setLoading(false));
            return;
        }
        const reqBody = {...formData};

        // API CALL
        await axios.patch("/user/update-password",reqBody,{
            headers:{
                "Content-Type": "application/json",
                "authorization": `bearer ${token}`,
            },
        }).then((response)=>{
            const {message} = response.data;
            toast.success(message || "Password Updated Successfully");
        }).catch((error)=>{
            dispatch(setError(error));
            toast.error(error?.message || "Something Went Wrong");
        }).finally(()=>{
            dispatch(setLoading(false));
        });
    }
}


export function findOppositeUser(oppId) {
    return async (dispatch, getState) => {
        dispatch(setError(null));
        dispatch(setLoading(true));
        if(oppId === null || oppId === undefined){
            dispatch(setLoading(false));
            return;
        }
        const token = getAuthToken(getState);
        if (!token) {
            dispatch(setError({ message: "Invalid auth token" }));
            dispatch(setLoading(false));
            return;
        }
        try {
            const res = await axios.get(`/user/someone?userId=${oppId}`, {
                headers: {
                    authorization: `bearer ${token}`,
                },
            });
            dispatch(setOppositeUser(res.data.data.user));
        } catch (err) {
            dispatch(setError(err));
            toast.error(err?.message || 'Something went wrong');
        } finally {
            dispatch(setLoading(false));
        }
    };
}

export function fetchMessages(convId) {
    return async (dispatch, getState) => {
        dispatch(setError(null));
        dispatch(setLoading(true));
        const newData = {
            conversationId: convId,
        }
        const socket = getSocket();
        if (!socket) {
            toast.error("Socket connection lost.");
            dispatch(setLoading(false));
            return;
        }
        socket.emit('direct-chat-history', newData, async (response) => {
            if (response?.error) {
                toast.error(response.message || "Failed to fetch messages");
            } else {
                toast.success("Messages retrieved successfully");
                const currentUserId = getState().auth.user?._id;
                const history = response.data.history || [];
                const decryptedHistory = await decryptMessages(history, currentUserId);
                dispatch(setCurrMessages(decryptedHistory));
            }
            dispatch(setLoading(false));
        });
    };
}


export function startConversation(data) {
    return async (dispatch, getState) => {
        dispatch(setError(null));
        dispatch(setLoading(true));
        const token = getAuthToken(getState);
        if (!token) {
            dispatch(setError({ message: "Invalid auth token" }));
            dispatch(setLoading(false));
            return;
        }
        if (!data?.userId) {
            dispatch(setError({ message: "User Id is required to start conversation" }));
            dispatch(setLoading(false));
            return;
        }

        try {
            const res = await axios.post('/user/start-conversation', { userId: data.userId }, {
                headers: {
                    authorization: `bearer ${token}`,
                },
            });
            const { data: responseData } = res.data;
            await dispatch(setCurrMessages([])); // Clear current messages
            await dispatch(setCurrentConversation(responseData.conversation._id));

            // E2EE: decrypt messages loaded with conversation
            const currentUserId = getState().auth.user?._id;
            const rawMessages = responseData.conversation.messages || [];
            const decryptedMessages = await decryptMessages(rawMessages, currentUserId);
            await dispatch(setCurrMessages(decryptedMessages));

            await dispatch(findOppositeUser(data.userId));
            // await dispatch(fetchMessages(responseData.conversation._id));
            // dispatch(setCurrMessages(responseData.conversation.messages || []));
        } catch (err) {
            dispatch(setError(err));
            toast.error(err?.message || 'Something went wrong');
        } finally {
            dispatch(setLoading(false));
        }
    };
}


