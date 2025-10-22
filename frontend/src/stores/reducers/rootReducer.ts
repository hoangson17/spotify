// src/redux/reducers/rootReducer.js
import { combineReducers } from "redux";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "./authReducer";

const persistConfig = {
  key: "auth",
  storage,
  whitelist: ["auth"], // chỉ lưu auth
};

const rootReducer = combineReducers({
  auth: authReducer,
});

export default persistReducer(persistConfig, rootReducer);
