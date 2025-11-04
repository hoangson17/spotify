import actionTypes from "../actions/actionTypes";

const initialState = {
  playlist: [] as any[],
  loading: false,
  error: null as string | null,
};

const playlistReducer = (state = initialState, action: any) => {
  switch (action.type) {

    case actionTypes.GET_PLAYLIST_SUCCESS:
      return {
        ...state,
        playlist: action.playlist, 
        loading: false,
        error: null,
      };
    case action.ADD_PLAYLIST:
    return {
      ...state,
      playlist: [...state.playlist, action.payload],
    };
    case actionTypes.GET_PLAYLIST_FAIL:
    case actionTypes.GET_PLAYLIST_ERROR:
      return {
        ...state,
        playlist: [], 
        loading: false,
        error: action.error,
      };

    default:
      return state;
  }
};

export default playlistReducer;
