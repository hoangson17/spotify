import { combineReducers } from "redux";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import actionTypes from "../actions/actionTypes";
import albumReducer from "./albumReducer";
import artistReducer from "./artistReducer";
import authReducer from "./authReducer";
import likeTrackReducer from "./likeTrackReducer";
import playerReducer from "./playerReducer";
import playlistReducer from "./playlistReducer";
import searchReducer from "./searchReducer";
import trackReducer from "./trackReducer";

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

const rootReducer = (state: any, action: any) => {
  if (action.type === actionTypes.LOGOUT) {
    state = undefined;
  }
  return appReducer(state, action);
};

export default rootReducer;
