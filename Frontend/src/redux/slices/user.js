import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/axios';
import {toast} from "react-toastify";

const initialState = {
    isLoading: false,
    error: null,
    user: {},
    currConversation: null, // to store current conversation ID
    currMessages: [],
    oppositeUser: {},
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
    }
});

export default slice.reducer;

const {setLoading,setError,setUser,setCurrentConversation,setCurrMessages,setOppositeUser} = slice.actions;


export function updateUserDetails(formData) {
    return async (dispatch,getState) =>{
        dispatch(setError(null));
        dispatch(setLoading(true));
        const reqBody = {...formData};

        // API CALL
        await axios.patch("/user/me",reqBody,{
            headers:{
                "Content-Type": "application/json",
                "authorization": `bearer ${getState().auth.token}`,
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

    try {
      const response = await axios.patch("/user/update-avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          authorization: `bearer ${getState().auth.token}`,
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
        const reqBody = {...formData};

        // API CALL
        await axios.patch("/user/update-password",reqBody,{
            headers:{
                "Content-Type": "application/json",
                "authorization": `bearer ${getState().auth.token}`,
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
        if(oppId === null || oppId === undefined) return;
        try {
            const res = await axios.get(`/user/someone?userId=${oppId}`, {
                headers: {
                    authorization: `bearer ${getState().auth.token}`,
                },
            });
            const { message, data } = res.data;
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


export function startConversation(data) {
    // console.log("Entered start Conversation");
    return async (dispatch, getState) => {
        dispatch(setError(null));
        dispatch(setLoading(true));

        try {
            const res = await axios.post('/user/start-conversation', { userId: data.userId }, {
                headers: {
                    authorization: `bearer ${getState().auth.token}`,
                },
            });
            const { data: responseData } = res.data;

            dispatch(setCurrentConversation(responseData.conversation._id));
            dispatch(setCurrMessages(responseData.conversation.messages || []));
            // console.log("Inside startConversation", responseData);
            // console.log("Opp Person's Id is (inside startConversation.js): ",data.userId);
            // also fetch the opposite user
            await dispatch(findOppositeUser(data.userId));

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

