import actionTypes from "../actions/actionTypes";

const initialState = {
  results: null,
  loading: false,
  error: null,
};

const searchReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case actionTypes.SEARCH_REQUEST:
      return { ...state, loading: true, error: null };
    case actionTypes.SEARCH_SUCCESS:
      return { ...state, loading: false, results: action.results };
    case actionTypes.SEARCH_FAIL:
      return { ...state, loading: false, error: action.error };
    default:
      return state;
  }
};

export default searchReducer;
