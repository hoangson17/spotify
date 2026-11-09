import { albumService } from "@/services/albumService";
import actionTypes from "./actionTypes";

export const getAlbums = (page = 1, limit = 12) => async (dispatch: any) => {
    dispatch({ type: actionTypes.GET_ALBUMS_REQUEST });
    try {
        const response = await albumService.getAllAlbum({ page, limit });
        // console.log( response);
        if (response?.status === 200) {
            dispatch({
                type: actionTypes.GET_ALBUMS_SUCCESS,
                albums: response.data.items,
                meta: response.data.meta,
            });
        } else {
            dispatch({
                type: actionTypes.GET_ALBUMS_FAIL,
                error: response.data?.message || "Failed to fetch tracks",
            });
        }
    } catch (error: any) {
        dispatch({
            type: actionTypes.GET_ALBUMS_ERROR,
            error: error?.message || "Network error",
        });
    }
};

export const getAlbumById = (id: string) => async (dispatch: any) => {
    dispatch({ type: actionTypes.GET_ALBUMS_REQUEST });
    try {
        const response = await albumService.getAlbumById(id);
        // console.log( response);
        if (response?.status === 200) {
            dispatch({
                type: actionTypes.GET_ALBUMS_SUCCESS,
                albums: response.data,
            });
        } else {
            dispatch({
                type: actionTypes.GET_ALBUMS_FAIL,
                error: response.data?.message || "Failed to fetch tracks",
            });
        }
    } catch (error: any) {
        dispatch({
            type: actionTypes.GET_ALBUMS_ERROR,
            error: error?.message || "Network error",
        });
    }
};
