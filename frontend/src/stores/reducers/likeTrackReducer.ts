import actionTypes from "../actions/actionTypes";

const initialState = {
    likeTrack: [] as any,
    loading: false,
    error: null as string | null,
};

const likeTrackReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case actionTypes.GET_LIKE_TRACK_SUCCESS:
      return {
        ...state,
        likeTrack: action.likeTrack,
        loading: false,
        error: null,
      };

    case actionTypes.LIKE_TRACK:
      return {
        ...state,
        likeTrack: action.payload,  
        loading: false,
        error: null,
      };

    case actionTypes.UNLIKE_TRACK:
      return {
        ...state,
        likeTrack: [],   
        loading: false,
        error: null,
      };

    default:
      return state;
  }
};


export default likeTrackReducer