import actionTypes from "./actionTypes";
import { trackService } from "../../services/trackService";

export const getTracks = () => async (dispatch: any) => {
  try {
    const response = await trackService.getAllTracks();
    // console.log( response );
    if (response?.status === 200) {
      dispatch({
        type: actionTypes.GET_TRACKS_SUCCESS,
        tracks: response.data, 
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
