import { createSlice } from '@reduxjs/toolkit';
import axios from '../../utils/axios';
import {toast} from "react-toastify";
import { getSocket } from '../../utils/socket';
import { isJwtToken } from '../../utils/authToken';

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
        reset: () => initialState,        
    }
});

export default slice.reducer;
const { addCurrMessage } = slice.actions;
export { addCurrMessage };

export const { reset } = slice.actions;
const {setLoading,setError,setUser,setCurrentConversation,setCurrMessages,setOppositeUser,setSocket} = slice.actions;
export {setSocket};

const getAuthToken = (getState) => {
    const token = getState().auth.token;
    return isJwtToken(token) ? token : null;
};

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
            // console.log("Inside findOppositeUser Function".data.user);
            dispatch(setUser(res.data.data.user));
            // toast.success(message || 'User found successfully');
        } catch (err) {
            console.error('Inside FindUser  error', err);
            dispatch(setError(err));
            console.log("Inside findUser error", err);
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
            console.log("Inside user slice" , response.data);
            const {message} = response.data;
            toast.success(message || "User details updated Successfully");
        }).catch((error)=>{
            console.log("Inside user slice",error);
            dispatch(setError(error));
            toast.error(error?.message || "Something Went Wrong");
        }).finally(()=>{
            console.log("Reached Finally");
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
      console.log("Inside updateAvatar error", error);
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
            console.log("Inside user slice" , response.data);
            const {message} = response.data;
            toast.success(message || "Password Updated Successfully");
        }).catch((error)=>{
            console.log("Inside user slice",error);
            dispatch(setError(error));
            toast.error(error?.message || "Something Went Wrong");
        }).finally(()=>{
            console.log("Reached Finally");
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
            // console.log("Inside findOppositeUser Function".data.user);
            dispatch(setOppositeUser(res.data.data.user));
            // toast.success(message || 'User found successfully');
        } catch (err) {
            console.error('findOppositeUser error', err);
            dispatch(setError(err));
            console.log("Inside findOppositeUser error", err);
            toast.error(err?.message || 'Something went wrong');
        } finally {
            dispatch(setLoading(false));
        }
    };
}

export function fetchMessages(convId) {
    console.log("Entered Fetch Messages with id", convId);
    return async (dispatch) => {
        dispatch(setError(null));
        dispatch(setLoading(true));
        const newData = {
            conversationId: convId,
        }
        const socket = getSocket();
        if (!socket) {
            console.error("Socket is not connected.");
            toast.error("Socket connection lost.");
            dispatch(setLoading(false));
            return;
        }
        socket.emit('direct-chat-history', newData, (response) => {
            if (response?.error) {
                console.error("Error fetching message history:", response.message || "Unknown error");
                toast.error(response.message || "Failed to fetch messages");
            } else {
                console.log("New history retrieved", response);
                toast.success("Messages retrieved successfully");
                dispatch(setCurrMessages(response.data.history || []));
            }
            dispatch(setLoading(false));
        });        
    };
}


export function startConversation(data) {
    // console.log("Entered start Conversation");
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
            // console.log("Inside startConversation", responseData);
            await dispatch(setCurrMessages([])); // Clear current messages
            await dispatch(setCurrentConversation(responseData.conversation._id));
            await dispatch(setCurrMessages(responseData.conversation.messages || []));
            await dispatch(findOppositeUser(data.userId));
            // await dispatch(fetchMessages(responseData.conversation._id));
            // dispatch(setCurrMessages(responseData.conversation.messages || []));
        } catch (err) {
            console.error('startConversation error', err);
            console.log("Inside startConversation error", err);
            dispatch(setError(err));
            toast.error(err?.message || 'Something went wrong');
        } finally {
            dispatch(setLoading(false));
        }
    };
}


