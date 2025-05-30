import { configureStore } from "@reduxjs/toolkit";
import {
  useDispatch as useAppDispatch,
  useSelector as useAppSelector,
} from "react-redux";
import { rootReducer } from "./rootReducer";
import { rootPersistConfig } from "./rootReducer";

import { persistStore, persistReducer } from "redux-persist";

const store = configureStore({
  reducer: persistReducer(rootPersistConfig, rootReducer),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
});

const persistor = persistStore(store);
const { dispatch } = store;
// const useSelector = useAppSelector;
// const useDispatch = () => useAppDispatch;
export const useSelector = useAppSelector;
export const useDispatch = useAppDispatch;
export { store, persistor, dispatch };
