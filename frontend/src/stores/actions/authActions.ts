import { toast } from "sonner";
import { authService } from "../../services/authService";
import { clearTokens } from "../../services/authTokens";
import actionTypes from "./actionTypes";

export const login =
  (email: string, password: string) => async (dispatch: any) => {
    dispatch({ type: actionTypes.LOGIN_REQUEST });
    try {
      const res = await authService.login(email, password);

      authService.saveTokens(res.data.accessToken, res.data.refreshToken);

      dispatch({ type: actionTypes.LOGIN_SUCCESS, payload: res.data });
    } catch (err: any) {
      dispatch({
        type: actionTypes.LOGIN_FAILURE,
        payload: err.response?.data?.message || "Sai tài khoản hoặc mật khẩu",
      });
    }
  };

export const register = (body: any) => async (dispatch: any) => {
  try {
    const res = await authService.register(body);

    dispatch({
      type: actionTypes.REGISTER_SUCCESS,
      payload: res.data,
    });

    toast.success("Đăng ký thành công");
    return res.data;
  } catch (err: any) {
    const errorMessage =
      err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.";

    dispatch({
      type: actionTypes.REGISTER_FAIL,
      payload: errorMessage,
    });

    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

export const loginWithGoogle =
  (accessTokenFromGoogle: string) => async (dispatch: any) => {
    dispatch({ type: actionTypes.LOGIN_REQUEST });
    try {
      const res = await authService.loginWithGoogle(accessTokenFromGoogle);

      authService.saveTokens(res.data.accessToken, res.data.refreshToken);

      dispatch({ type: actionTypes.LOGIN_SUCCESS, payload: res.data });
    } catch (err: any) {
      dispatch({
        type: actionTypes.LOGIN_FAILURE,
        payload: err.response?.data?.message || "Google login failed",
      });
      throw err;
    }
  };

export const logout = () => async (dispatch: any, getState: any) => {
  const sessionRefresh = getState().auth.refreshToken;
  try {
    await authService.logout();
  } catch {
    // Local logout must still complete if the server session already expired.
  } finally {
    if (getState().auth.refreshToken === sessionRefresh) {
      clearTokens();
      dispatch({ type: actionTypes.LOGOUT });
    }
  }
};

export const refreshAccessToken = (token: any) => ({
  type: actionTypes.REFRESH_TOKEN,
  payload: token,
});

export const setProfile = (data: any) => ({
  type: actionTypes.SET_PROFILE,
  payload: data,
});

export const getAllUsers = (page = 1, limit = 20) => async (dispatch: any) => {
  dispatch({ type: actionTypes.GET_ALL_USERS_REQUEST });
  try {
    const res = await authService.getAllUsers({ page, limit });
    dispatch({
      type: actionTypes.GET_ALL_USERS_SUCCESS,
      payload: res.data.items,
      meta: res.data.meta,
    });
  } catch (err: any) {
    dispatch({
      type: actionTypes.GET_ALL_USERS_FAILURE,
      payload: err.response?.data?.message || "Failed to fetch users",
    });
  }
};
export const getLockedUsers = (page = 1, limit = 20) => async (dispatch: any) => {
  dispatch({ type: actionTypes.GET_LOCKED_USERS_REQUEST });
  try {
    const res = await authService.getUserLock({ page, limit });
    dispatch({
      type: actionTypes.GET_LOCKED_USERS_SUCCESS,
      payload: res.data.items,
      meta: res.data.meta,
    });
  } catch (err: any) {
    dispatch({
      type: actionTypes.GET_LOCKED_USERS_FAILURE,
      payload: err.response?.data?.message || "Failed to fetch users",
    });
  }
};
