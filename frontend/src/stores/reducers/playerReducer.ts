import actionTypes from "../actions/actionTypes";
import { queue } from "../actions/playerActions";

const initialState = {
  currentSong: null,
  queue: [] as any[],
  currentIndex: -1,
  isPlaying: true,
};

const playerReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case actionTypes.SET_CURRENT_SONG:
      return {
        ...state,
        currentSong: action.payload,
      };
    case actionTypes.QUEUE:
      return {
        ...state,
        queue: action.payload,
      };

    case actionTypes.TOGGLE_PLAY:
      return {
        ...state,
        isPlaying: !state.isPlaying,
      };
    default:
      return state;
  }
};

export default playerReducer;
