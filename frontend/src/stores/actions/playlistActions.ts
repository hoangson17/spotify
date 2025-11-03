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