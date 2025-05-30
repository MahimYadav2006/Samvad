import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    modals:{
        gif: false,
        voice: false,
    },
    selectedGifUrl : "",
};

const slice = createSlice({
    name: "app",
    initialState,
    reducers: {
        updateGifModal(state,action){
            state.modals.gif = action.payload.value;
            state.selectedGifUrl = action.payload.url;
        },
        updateAudioModal(state,action){
            state.modals.audio = action.payload;
        }
    },
});

export default slice.reducer;

// export const toggleGifModal = (value) => async (dispatch,getState) =>{
//     dispatch(slice.actions.updateGifModal.value);
// }

export const toggleGifModal = (payload) => (dispatch) => {
  dispatch(slice.actions.updateGifModal(payload));
}

export const toggleAudioModal = (payload) =>  (dispatch)=>{
    dispatch(slice.actions.updateAudioModal(payload));
}
