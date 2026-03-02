import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/axios';
import {toast} from "react-toastify";
import { getSocket } from '../../utils/socket';
import { isJwtToken } from '../../utils/authToken';

const initialState = {
    userList: [],
    isLoading: false,
    error: null,
    typingIndicators: {}, // { [conversationId]: boolean }
};

const slice = createSlice({
    name: "user",
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
            console.log("Inside Chat Slice ",response.data.data.users);
            // toast.success(response.data.message);
        }).catch(function (error){
            console.log("Inside Chat Slice ",error);
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
            console.error("Socket is not connected.");
            toast.error("Socket connection lost.");
            dispatch(setLoading(false));
            return;
        }

        const newData = {
            message: data,
            conversationId: getState().user.currConversation,
        };
        console.log("New Direct Message Data: ", newData);

        socket.emit('new-message', newData, (response) => {
            if (response?.error) {
                console.error("Error sending message:", response.error);
                toast.error(response.error || "Failed to send message");
            } else {
                console.log("New direct message sent", newData);
                console.log("Fetching Messages from Server");
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
  
        console.log("✅ Document uploaded:", res.data.data);
        return res.data.data; // {url, name, size, type, public_id}
      } catch (err) {
        console.error("❌ Upload document failed:", err);
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
            console.error(" Failed to upload audio:", err);
            toast.error(err?.response?.data?.message || "Failed to upload audio");
            dispatch(setError(err));
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
        console.error("Upload failed:", err);
        toast.error(err?.response?.data?.message || "Failed to upload media");
        dispatch(setError(err));
        return null;
      } finally {
        dispatch(setLoading(false));
      }
    };
  }
  
  


  



