import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    modals:{
        gif: false,
        voice: false,
        media: false,
        document: false,
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
        },
        updateMediaModal(state,action){
            state.modals.media = action.payload;
        },
        updateDocumentModal(state,action){
            state.modals.document = action.payload;
        },
    },
});

export default slice.reducer;

export const toggleGifModal = (payload) => (dispatch) => {
  dispatch(slice.actions.updateGifModal(payload));
}

export const toggleAudioModal = (payload) =>  (dispatch)=>{
    dispatch(slice.actions.updateAudioModal(payload));
}

export const toggleMediaModal = (payload)=> (dispatch)=>{ 
    // console.log("Hi");
    dispatch(slice.actions.updateMediaModal(payload));
}

export const toggleDocumentModal = (payload)=> (dispatch)=>{
    dispatch(slice.actions.updateDocumentModal(payload));
}