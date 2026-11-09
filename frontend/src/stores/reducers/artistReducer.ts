import actionTypes from "../actions/actionTypes";
import { emptyPagination } from "../../types/pagination";

const initialState = {
    artists: [] as any,
    loading: false,
    error: null as string | null,
    meta: emptyPagination,
};

const artistReducer = (state = initialState,action: any)=>{
    switch (action.type){
        case actionTypes.GET_ARTISTS_REQUEST:
            return { ...state, loading: true, error: null };
        case actionTypes.GET_ARTISTS_SUCCESS:
            return {
                ...state,
                artists: action.artists,
                meta: action.meta,
                loading: false,
                error: null,
            };
        case actionTypes.GET_ARTISTS_FAIL:
        case actionTypes.GET_ARTISTS_ERROR:
            return {
                ...state,
                artists: [],
                loading: false,
                error: action.error,
            };
        default:
            return state;
    }
}

export default artistReducer
