import { combineReducers } from "redux";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "./authReducer";
import trackReducer from "./trackReducer";
import artistReducer from "./artistReducer";
import playerReducer from "./playerReducer";
import playlistReducer from "./playlistReducer";

const authPersistConfig = {
  key: "auth",
  storage,
  whitelist: ["user", "isAuthenticated"], 
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  tracks: trackReducer,
  artists: artistReducer,
  player: playerReducer,
  playlist: playlistReducer
});

export default rootReducer;
