import { albumService } from "@/services/albumService";
import actionTypes from "./actionTypes";

export const getAlbums = () => async (dispatch: any) => {
    try {
        const response = await albumService.getAllAlbum();
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