import actionTypes from "../actions/actionTypes";
import { emptyPagination } from "../../types/pagination";

const initialState = {
  tracks: [] as any,
  loading: false,
  error: null as string | null,
  meta: emptyPagination,
};

const trackReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case actionTypes.GET_TRACKS_REQUEST:
      return { ...state, loading: true, error: null };
    case actionTypes.GET_TRACKS_SUCCESS:
      return {
        ...state,
        tracks: action.tracks,
        meta: action.meta,
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
