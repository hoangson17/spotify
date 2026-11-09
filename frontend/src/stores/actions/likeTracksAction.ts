import { likeTrackService } from "@/services/likeTrackService";
import actionTypes from "./actionTypes";

export const getLikeTracks = (id: string, page = 1, limit = 20) => async (dispatch: any) => {
  try {
    const response = await likeTrackService.getLikeTracks(id, { page, limit });

    if (response?.status === 200) {
      dispatch({
        type: actionTypes.GET_LIKE_TRACK_SUCCESS,
        likedTracks: response.data.items,
        meta: response.data.meta,
      });
    } else {
      dispatch({
        type: actionTypes.GET_LIKE_TRACK_FAIL,
        error: response.data?.message || "Failed to fetch tracks",
      });
    }
  } catch (error: any) {
    dispatch({
      type: actionTypes.GET_LIKE_TRACK_FAIL,
      error: error?.message || "Network error",
    });
  }
};

export const addLikeTrack = (track: any) => {
  return {
    type: actionTypes.LIKE_TRACK,
    payload: track,
  };
};

export const removeLikeTrack = (track: any) => {
  return {
    type: actionTypes.UNLIKE_TRACK,
    payload: track,
  };
};
