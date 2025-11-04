import actionTypes from "../actions/actionTypes";

const initialState = {
  tracks: [] as any,
  loading: false,
  error: null as string | null,
};

const trackReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case actionTypes.GET_TRACKS_SUCCESS:
      return {
        ...state,
        tracks: action.tracks,
        loading: false,
        error: null,
      };
    case actionTypes.GET_TRACKS_FAIL:
    case actionTypes.GET_TRACKS_ERROR:
      return {
        ...state,
        tracks: [],
        loading: false,
        error: action.error,
      };
    default:
      return state;
  }
};

export default trackReducer;
