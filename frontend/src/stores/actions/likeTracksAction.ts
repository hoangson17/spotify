import { likeTrackService } from "@/services/likeTrackService";
import actionTypes from "./actionTypes";

// Lấy danh sách liked tracks
export const getLikeTrack = (userId: number) => async (dispatch: any) => {
  try {
    const response = await likeTrackService.getTracks(userId);
    if(response.status === 200){
      dispatch({ type: actionTypes.GET_LIKE_TRACK_SUCCESS, payload: response.data });
    }
  } catch(err:any){
    console.error(err);
  }
};

// Like track
export const likeTracks = (userId: number, trackIds: number[]) => async(dispatch: any) => {
  try{
    const response = await likeTrackService.likeTrack(userId, trackIds);
    if(response.status === 200){
      dispatch({ type: actionTypes.LIKE_TRACK, payload: response.data });
    }
  }catch(err:any){
    console.error(err);
  }
};

// Unlike track
export const unlikeTracks = (userId: number, trackId: number) => async(dispatch: any) => {
  try{
    await likeTrackService.unlikeTrack();
    dispatch({ type: actionTypes.UNLIKE_TRACK, payload: trackId });
  }catch(err:any){
    console.error(err);
  }
};
