import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/axios';
import {toast} from "react-toastify";
// import { dispatch } from '../store';
import { connectSocket, disconnectSocket } from "../../utils/socket";


const initialState = {
    isLoading: false,
    error: null,
    token: null,
    user: {},
    isLoggedIn: false,
};

const slice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setError(state,action){
            state.error = action.payload;
        },
        setLoading(state,action){
            state.isLoading = action.payload;
        },
        loginSuccess(state,action){
            state.token = action.payload;
            state.isLoggedIn = true;
        },
        logOutSuccess(state,action){
            state.token = null;
            state.isLoggedIn = false;
        },
        addUserId(state,action){
            state.user =  action.payload;
        },
        reset: () => initialState,
    }
});

export default slice.reducer;
export const { reset } = slice.actions;
const {setLoading,setError,loginSuccess,logOutSuccess,addUserId} = slice.actions;

// Registering new User
export function RegisterUser(formData,navigate){
    return async (dispatch,getState)=>{
        // Check if prev state is disturbed
        dispatch(setError(null));
        dispatch(setLoading(true));

        // Make API Call
        const reqBody = {...formData};
        await axios.post("/auth/signup", reqBody,{
            headers:{
                "Content-Type": "application/json",
            },
        }).then(function (response){
            console.log("Inside Auth Slice ",response);
            toast.success(response.data.message);
        }).catch(function (error){
            console.log("Inside auth Slice ",error);
            toast.error(error?.message || "Something went wrong"
);
            dispatch(setError(error));
        }).finally(()=>{
            dispatch(setLoading(false));
            if(!getState().auth.error){
                navigate(`/auth/verify?email=${formData.email}`)
            }
        });
    }
}

// // Resend OTP
export function ResendOTP(email){
    return async(dispatch,getState) => {
        dispatch(setError(null));
        dispatch(setLoading(true));

        // API CALL
        await axios.post("/auth/resend-otp",{email},{
            headers:{
                "Content-Type": "application/json",
            },
        }).then((response)=>{
            console.log("Inside auth slice" , response.data);
            toast.success(response.data.message);
        }).catch((error)=>{
            console.log("Inside auth slice",error);
            dispatch(setError(error));
            toast.error("Something Went Wrong");
        }).finally(()=>{
            dispatch(setLoading(false));
        })
    }
};

// Verify OTP
export function VerifyOTP(formValues,navigate){ // cuz if it is verified then we want user to be navigated to the dashboard
    return async(dispatch,getState) => {
        dispatch(setError(null));
        dispatch(setLoading(true));

        // API CALL
        await axios.post("/auth/verify",{...formValues},{
            headers:{
                "Content-Type": "application/json",
            },
        }).then((response)=>{
            console.log("Inside auth slice" , response.data);

            const {token,message,user_id} = response.data;

            dispatch(loginSuccess(token));
            dispatch(addUserId({ _id: user_id }));
            toast.success(message || "Email Verified Successfully");
        }).catch((error)=>{
            console.log("Inside auth slice",error);
            dispatch(setError(error));
            toast.error(error?.message || "Something Went Wrong");
        }).finally(()=>{
            dispatch(setLoading(false));
            if(!getState().auth.error){
                navigate("/dashboard");
            }
        })
    }
}

// Login user
export function LoginUser(formValues,navigate){ // cuz if it is verified then we want user to be navigated to the dashboard
    return async(dispatch,getState) => {
        dispatch(setError(null));
        dispatch(setLoading(true));

        // API CALL
        await axios.post("/auth/login",{...formValues},{
            headers:{
                "Content-Type": "application/json",
            },
        }).then((response)=>{
            console.log("Inside auth slice" , response.data);

            const {token,message,user_id} = response.data;

            dispatch(loginSuccess(token));
            dispatch(addUserId({ _id: user_id }));
            toast.success(message || "Logged In Successfully");
        }).catch((error)=>{
            console.log("Inside auth slice",error);
            dispatch(setError(error));
            toast.error(error?.message || "Something Went Wrong");
        }).finally(()=>{
            dispatch(setLoading(false));
            if(!getState().auth.error){
                navigate("/dashboard");
            }
        })
    }
}

// Sign Out
export function LogoutUser(navigate){
    console.log("HI I entered the logout function");
    return async(dispatch,getState) => {
        try{
            dispatch(logOutSuccess());
            navigate("/");
            toast.success("Logout Success");
        }catch(error){
            console.log("Error in LogoutUser: ", error);
        }
    }
}