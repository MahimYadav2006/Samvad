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

export function fetchUser() {
    return (dispatch, getState) => {
        const user = getState().auth.user; 
        console.log("Inside User Slice: fetching user from state", user);

        if (!user) {
            console.log("Inside User Slice: user not found in state");
            dispatch(setError("No user found in auth slice"));
            return;
        }

        dispatch(setUser(user));
    };
}

export function updateUserDetails(formData) {
    return async (dispatch, getState) => {
        dispatch(setError(null));
        dispatch(setLoading(true));
        console.log("Hello At Least I enterted updateUserDetails");
        try {
            let currUser = getState().user.user;
            if (!currUser || Object.keys(currUser).length === 0) {
                await dispatch(fetchUser());
                currUser = getState().user.user;
            }
            const reqBody = { body: {...formData}, user: currUser };
            const response = await axios.patch("/user/me", reqBody, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            console.log("Inside User Slice", response);
            toast.success(response.data.message);
        } catch (error) {
            console.log("Inside User Slice", error);
            toast.error(error?.message || "Something went wrong");
            dispatch(setError(error));
        } finally {
            dispatch(setLoading(false));
        }
    };
}

export function updateAvatar(formData){
    return async (dispatch,getState) =>{
        dispatch(setError(null));
        dispatch(setLoading(true));
        let curriUser = {};
        try{
            let currUser = getState().user.user;
            if (!currUser || Object.keys(currUser).length === 0) {
                await dispatch(fetchUser());
                currUser = getState().user.user;
            }
            curriUser = currUser;
        }catch(error){
            console.log("User does not exist: From User Slice");
            toast.error("User not Logged In");
            dispatch(setError(error));
            return;
        }
        const reqBody = {body: {...formData},user: curriUser};
        // API CALL
        await axios.post("/user/update-avatar",reqBody,{
            headers:{
                "Content-Type": "application/json",
            },
        }).then((response)=>{
            console.log("Inside auth slice" , response.data);
            const {message} = response.data;
            toast.success(message || "Email Verified Successfully");
        }).catch((error)=>{
            console.log("Inside auth slice",error);
            dispatch(setError(error));
            toast.error(error?.message || "Something Went Wrong");
        }).finally(()=>{
            dispatch(setLoading(false));
        });
    }
}


export function updatePassword(formData){
    return async (dispatch,getState) =>{
        dispatch(setError(null));
        dispatch(setLoading(true));
        let curriUser = {};
        try{
            let currUser = getState().user.user;
            if (!currUser || Object.keys(currUser).length === 0) {
                await dispatch(fetchUser());
                currUser = getState().user.user;
            }
            curriUser = currUser;
        }catch(error){
            console.log("User does not exist: From User Slice");
            toast.error("User not Logged In");
            dispatch(setError(error));
            dispatch(setLoading(false));
            return;
        }
        const reqBody = {...formData, user: curriUser};

        // API CALL
        await axios.patch("/user/update-password",reqBody,{
            headers:{
                "Content-Type": "application/json",
                "authorization": `bearer ${getState().auth.token}`,
            },
        }).then((response)=>{
            console.log("Inside auth slice" , response.data);
            const {message} = response.data;
            toast.success(message || "Email Verified Successfully");
        }).catch((error)=>{
            console.log("Inside auth slice",error);
            dispatch(setError(error));
            toast.error(error?.message || "Something Went Wrong");
        }).finally(()=>{
            console.log("Reached Finally");
            dispatch(setLoading(false));
        });
    }
}

