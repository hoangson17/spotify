import actionTypes from "../actions/actionTypes";

const initialState = {
  playlist: [] as any[],
  playListSearch: [] as any[],
  playlistId: null as any,
  loading: false,
  error: null as string | null,
};

const playlistReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case actionTypes.GET_PLAYLIST_SUCCESS:
      return {
        ...state,
        playlist: action.playlist,
        playListSearch: action.playlist,
        loading: false,
        error: null,
      };

    case actionTypes.GET_PLAYLIST_ID_SUCCESS:
      return {
        ...state,
        playlistId: action.playlistId,
        loading: false,
        error: null,
      };

    case actionTypes.ADD_PLAYLIST:
      return {
        ...state,
        playlist: [...state.playlist, action.payload],
      };

    case actionTypes.UPDATE_PLAYLIST:
      return {
        ...state,
        playlist: state.playlist.map((pl) =>
          pl.id === action.payload.id ? { ...pl, ...action.payload } : pl
        ),
      };

    case actionTypes.DELETE_PLAYLIST:
      return {
        ...state,
        playlist: state.playlist.filter((pl) => pl.id !== action.payload),
      };

    case actionTypes.GET_PLAYLIST_FAIL:
    case actionTypes.GET_PLAYLIST_ERROR:
      return {
        ...state,
        playlist: [],
        loading: false,
        error: action.error,
      };

    case actionTypes.PLAYLIST_TRACKS_SUCCESS:
      return {
        ...state,
        playlist: state.playlist.map((pl) =>
          pl.id === action.payload.playlistId
            ? { ...pl, tracks: action.payload.tracks }
            : pl
        ),
      };

    case actionTypes.PLAYLIST_TRACKS_FAIL:
    case actionTypes.PLAYLIST_TRACKS_ERROR:
      return {
        ...state,
        error: action.error || "Failed to update playlist tracks",
      };

    default:
      return state;
  }
};

export default playlistReducer;
