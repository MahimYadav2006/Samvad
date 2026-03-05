import { createSlice } from '@reduxjs/toolkit';
import axios from '../../utils/axios';
import {toast} from "react-toastify";
import { isJwtToken } from "../../utils/authToken";
// import { dispatch } from '../store';


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
            state.token = isJwtToken(action.payload) ? action.payload : null;
            state.isLoggedIn = Boolean(state.token);
        },
        setAuthSession(state, action) {
            const { token, userId } = action.payload || {};
            state.token = isJwtToken(token) ? token : null;
            state.user = userId ? { _id: userId } : {};
            state.isLoggedIn = Boolean(state.token);
        },
        logOutSuccess(state){
            state.token = null;
            state.user = {};
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
const {setLoading,setError,setAuthSession,logOutSuccess} = slice.actions;

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
            toast.success(response.data.message);
        }).catch(function (error){
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
    return async(dispatch) => {
        dispatch(setError(null));
        dispatch(setLoading(true));

        // API CALL
        await axios.post("/auth/resend-otp",{email},{
            headers:{
                "Content-Type": "application/json",
            },
        }).then((response)=>{
            toast.success(response.data.message);
        }).catch((error)=>{
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

            const {token,message,user_id} = response.data;

            dispatch(setAuthSession({ token, userId: user_id }));
            toast.success(message || "Email Verified Successfully");
        }).catch((error)=>{
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

            const {token,message,user_id} = response.data;

            dispatch(setAuthSession({ token, userId: user_id }));
            toast.success(message || "Logged In Successfully");
        }).catch((error)=>{
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

// Login / Signup with Google
export function GoogleAuthUser(accessToken, navigate) {
    return async (dispatch, getState) => {
        dispatch(setError(null));
        dispatch(setLoading(true));

        await axios.post("/auth/google", { accessToken }, {
            headers: {
                "Content-Type": "application/json",
            },
        }).then((response) => {

            const { token, message, user_id } = response.data;

            dispatch(setAuthSession({ token, userId: user_id }));
            toast.success(message || "Google authentication successful");
        }).catch((error) => {
            dispatch(setError(error));
            toast.error(error?.response?.data?.message || error?.message || "Something Went Wrong");
        }).finally(() => {
            dispatch(setLoading(false));
            if (!getState().auth.error) {
                navigate("/dashboard");
            }
        });
    };
}

// Sign Out
export function LogoutUser(navigate){
    return async(dispatch) => {
        dispatch(logOutSuccess());
        navigate("/");
        toast.success("Logout Success");
    }
}
