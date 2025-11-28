import actionTypes from "./actionTypes";
import { playlistService } from "../../services/playlistService";

export const getPlaylist = () => async (dispatch: any) => {    
    try {
        const response = await playlistService.getPlaylist();
        // console.log( response );
        if (response?.status === 200) {
            dispatch({
                type: actionTypes.GET_PLAYLIST_SUCCESS,
                playlist: response.data, 
            });
        } else {
            dispatch({
                type: actionTypes.GET_PLAYLIST_FAIL,
                error: response?.data.message || "Failed to fetch playlist",
            });
        }
    } catch (error: any) {
        dispatch({
            type: actionTypes.GET_PLAYLIST_ERROR,
            error: error?.message || "Network error",
        });
    }
};

export const getPlaylistById = (id: number) => async (dispatch: any) => {    
    try {
        const response = await playlistService.getPlaylistById(id);
        // console.log( response );
        if (response?.status === 200) {
            dispatch({
                type: actionTypes.GET_PLAYLIST_ID_SUCCESS,
                playlistId: response.data, 
            });
        } else {
            dispatch({
                type: actionTypes.GET_PLAYLIST_FAIL,
                error: response?.data.message || "Failed to fetch playlist",
            });
        }
    } catch (error: any) {
        dispatch({
            type: actionTypes.GET_PLAYLIST_ERROR,
            error: error?.message || "Network error",
        });
    }
};

export const addPlaylist = (playlist: any) => ({
  type: actionTypes.ADD_PLAYLIST,
  payload: playlist,
});

export const updatePlaylist = (updatedPlaylist: any) => ({
  type: actionTypes.UPDATE_PLAYLIST,
  payload: updatedPlaylist ,
});

export const deletePlaylist = (id: number) => ({
  type: actionTypes.DELETE_PLAYLIST,
  payload: id,
});



export const addTrackToPlaylist = (userId: number,playlistId: number, trackIds: number[]) => async (dispatch: any) => {
  try {
    const res = await playlistService.addTrack(userId,playlistId, trackIds);
    if (res.status === 200) {
      dispatch({
        type: actionTypes.PLAYLIST_TRACKS_SUCCESS,
        payload: { playlistId, tracks: res.data.tracks },
      });
    } else {
      dispatch({ type: actionTypes.PLAYLIST_TRACKS_FAIL });
    }
  } catch (err) {
    dispatch({ type: actionTypes.PLAYLIST_TRACKS_ERROR, error: err });
  }
};

// Xóa track khỏi playlist
export const removeTrackFromPlaylist = (userId: number,playlistId: number, trackIds: number[]) => async (dispatch: any) => {
  try {
    const res = await playlistService.removeTrack(userId,playlistId, trackIds);
    if (res.status === 200) {
      dispatch({
        type: actionTypes.PLAYLIST_TRACKS_SUCCESS,
        payload: { playlistId, tracks: res.data.tracks },
      });
    } else {
      dispatch({ type: actionTypes.PLAYLIST_TRACKS_FAIL });
    }
  } catch (err) {
    dispatch({ type: actionTypes.PLAYLIST_TRACKS_ERROR, error: err });
  }
};

// Đồng bộ toàn bộ track của playlist
export const syncPlaylistTracks = (userId: number,playlistId: number, trackIds: number[]) => async (dispatch: any) => {
  try {
    const res = await playlistService.syncTrack(userId,playlistId, trackIds);
    if (res.status === 200) {
      dispatch({
        type: actionTypes.PLAYLIST_TRACKS_SUCCESS,
        payload: { playlistId, tracks: res.data.tracks },
      });
    } else {
      dispatch({ type: actionTypes.PLAYLIST_TRACKS_FAIL });
    }
  } catch (err) {
    dispatch({ type: actionTypes.PLAYLIST_TRACKS_ERROR, error: err });
  }
};