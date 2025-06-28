import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/axios';
import {toast} from "react-toastify";

const initialState = {
    isLoading: false,
    error: null,
    user: {},
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
    }
});

export default slice.reducer;

const {setLoading,setError,setUser} = slice.actions;


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

