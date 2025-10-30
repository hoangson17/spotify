import actionTypes from "./actionTypes";
import { artistService } from "../../services/artistService";

export const getArtist = () => async (dispatch: any) => {
    try {
        const response = await artistService.getAllArtists();
        // console.log( response );
        if (response?.status === 200) {
            dispatch({
                type: actionTypes.GET_ARTISTS_SUCCESS,
                artists: response.data, 
            });
        } else {
            dispatch({
                type: actionTypes.GET_ARTISTS_FAIL,
                error: response.data?.message || "Failed to fetch tracks",
            });
        }
    } catch (error: any) {
        dispatch({
            type: actionTypes.GET_ARTISTS_ERROR,
            error: error?.message || "Network error",
        });
    }
};


