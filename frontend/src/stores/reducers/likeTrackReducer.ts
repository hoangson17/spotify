import actionTypes from "../actions/actionTypes";

const initialState = {
  likedTracks: [] as any,
  loading: false,
  error: null as string | null,
};

const likeTrackReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case actionTypes.GET_LIKE_TRACK_SUCCESS:
      return {
        ...state,
        likedTracks: action.likedTracks,
        loading: false,
        error: null,
      };

    case actionTypes.GET_LIKE_TRACK_FAIL:
      return {
        ...state,
        likedTracks: [],
        loading: false,
        error: action.error,
      };

    case actionTypes.LIKE_TRACK:
      return {
        ...state,
        likedTracks: [...state.likedTracks, action.payload],
      };

    case actionTypes.UNLIKE_TRACK:
      return {
        ...state,
        likedTracks: state.likedTracks.filter((track: any) => track.id !== action.payload.id),
      };

    default:
      return state;
  }
};

export default likeTrackReducer;
