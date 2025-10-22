import actionTypes from "../actions/actionTypes";

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: false,
  error: null,
  isAuthenticated: false,
};

const authReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case actionTypes.LOGIN_REQUEST:
      return { ...state, loading: true, error: null };

    case actionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
      };

    case actionTypes.LOGIN_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case actionTypes.LOGOUT:
      return { ...initialState };

    case actionTypes.SET_PROFILE:
      return { ...state, user: action.payload };

    case actionTypes.REFRESH_TOKEN:
      return { ...state, accessToken: action.payload };

    default:
      return state;
  }
};

export default authReducer;
