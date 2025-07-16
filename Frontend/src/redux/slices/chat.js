import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/axios';
import {toast} from "react-toastify";
// import { dispatch } from '../store';


const initialState = {
    userList: [],
    isLoading: false,
    error: null,
};

const slice = createSlice({
    name: "user",
    initialState,
    reducers: {
        updateUserList(state,action){
            state.userList = action.payload;
        },
        setError(state,action){
            state.error = action.payload;
        },
        setLoading(state,action){
            state.isLoading = action.payload;
        },
    }
});

export default slice.reducer;

const {setLoading,setError,updateUserList} = slice.actions;

// Fetching User List
export function fetchUserList(){
    return async (dispatch,getState)=>{
        // Check if prev state is disturbed
        dispatch(setError(null));
        dispatch(setLoading(true));
        // Make API Call
        await axios.get("/user/users", {
        headers: {
          authorization: `bearer ${getState().auth.token}`,
        },
      }).then(function (response){
            dispatch(updateUserList(response.data.data.users));
            console.log("Inside Chat Slice ",response.data.data.users);
            toast.success(response.data.message);
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

