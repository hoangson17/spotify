import actionTypes from "../actions/actionTypes";

const initialState = {
  currentSong: null,
  isPlaying: true,
};

const playerReducer = (state = initialState, action: any) => {
  switch (action.type) {
     case actionTypes.SET_CURRENT_SONG:
      return {
        ...state,
        currentSong: action.payload,
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
