import actionTypes from "./actionTypes";
import { trackService } from "../../services/trackService";

export const getTracks = (page = 1, limit = 12) => async (dispatch: any) => {
  dispatch({ type: actionTypes.GET_TRACKS_REQUEST });
  try {
    const response = await trackService.getAllTracks({ page, limit });
    // console.log( response );
    if (response?.status === 200) {
      dispatch({
        type: actionTypes.GET_TRACKS_SUCCESS,
        tracks: response.data.items,
        meta: response.data.meta,
      });
    } else {
      dispatch({
        type: actionTypes.GET_TRACKS_FAIL,
        error: response.data?.message || "Failed to fetch tracks",
      });
    }
  } catch (error: any) {
    dispatch({
      type: actionTypes.GET_TRACKS_ERROR,
      error: error?.message || "Network error",
    });
  }
};
