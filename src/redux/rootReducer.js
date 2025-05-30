import { combineReducers } from '@reduxjs/toolkit';
import storage from 'redux-persist/lib/storage';

// Importing the slices
import appReducer from "./slices/app";


const rootPersistConfig = {
    key: "root",
    storage,
    keyPrefix: "redux-",
};

const rootReducer = combineReducers({
    app: appReducer,
});

export{rootPersistConfig, rootReducer};
// This configuration is used to persist the Redux store using local storage.