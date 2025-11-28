import actionTypes from "../actions/actionTypes";

const initialState = {
    albums: [] as any,
    loading: false,
    error: null as string | null,
};

const albumReducer = (state = initialState, action: any) => {
    switch (action.type) {
        case actionTypes.GET_ALBUMS_SUCCESS:
            return {
                ...state,
                albums: action.albums,
                loading: false,
                error: null,
            };
        case actionTypes.GET_ALBUMS_FAIL:
        case actionTypes.GET_ALBUMS_ERROR:
            return {
                ...state,
                albums: [],
                loading: false,
                error: action.error,
            };
        default:
            return state;
    }
};

export default albumReducer;