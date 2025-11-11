import { combineReducers } from "redux";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "./authReducer";
import trackReducer from "./trackReducer";
import artistReducer from "./artistReducer";
import playerReducer from "./playerReducer";
import playlistReducer from "./playlistReducer";
import albumReducer from "./albumReducer";
import searchReducer from "./searchReducer";
import actionTypes from "../actions/actionTypes";
import likeTrackReducer from "./likeTrackReducer";

const authPersistConfig = {
  key: "auth",
  storage,
  whitelist: ["user", "isAuthenticated"],
};

const appReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  tracks: trackReducer,
  artists: artistReducer,
  player: playerReducer,
  playlist: playlistReducer,
  albums: albumReducer,
  search: searchReducer,
  likedTracks: likeTrackReducer,
});

const rootReducer = (state:any, action:any) => {
  if (action.type === actionTypes.LOGOUT) {
    state = {...state, auth: { user: null, accessToken: null, refreshToken: null, isAuthenticated: false }};
    storage.removeItem("persist:auth");
    storage.removeItem("accessToken");
    storage.removeItem("refreshToken");
  }
  return appReducer(state, action);
};

export default rootReducer;
