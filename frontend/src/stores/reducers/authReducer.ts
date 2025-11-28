import actionTypes from "../actions/actionTypes";

const initialState = {
  user: null,
  allUser: [] as any[],
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

    case actionTypes.REGISTER_SUCCESS:
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
      return {
        user: null,
        accessToken: null,
        refreshToken: null,
        loading: false,
        error: null,
        isAuthenticated: false,
      };

    case actionTypes.SET_PROFILE:
      return { ...state, user: action.payload };

    case actionTypes.REFRESH_TOKEN:
      return { ...state, accessToken: action.payload };
    case actionTypes.GET_ALL_USERS_REQUEST:
      return { ...state, loading: true, error: null };

    case actionTypes.GET_ALL_USERS_SUCCESS:
      return { ...state, loading: false, allUser: action.payload };

    case actionTypes.GET_ALL_USERS_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};

export default authReducer;
