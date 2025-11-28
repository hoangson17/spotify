import actionTypes from "../actions/actionTypes";

const initialState = {
    artists: [] as any,
    loading: false,
    error: null as string | null,
};

const artistReducer = (state = initialState,action: any)=>{
    switch (action.type){
        case actionTypes.GET_ARTISTS_SUCCESS:
            return {
                ...state,
                artists: action.artists,
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