import actionTypes from "./actionTypes";
import { authService } from "../../services/authService";
import { toast } from "sonner";

export const login = (email: string, password: string) => async (dispatch: any) => {
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


export const loginWithGoogle = (accessTokenFromGoogle: string) => async (dispatch: any) => {
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
  }
};

export const logout = () => {
  authService.logout();
  return { type: actionTypes.LOGOUT };
};

export const refreshAccessToken = (token: any) => ({
  type: actionTypes.REFRESH_TOKEN,
  payload: token,
});

export const setProfile = (data: any) => ({
  type: actionTypes.SET_PROFILE,
  payload: data,
});

export const getAllUsers = () => async (dispatch: any) => {
  dispatch({ type: actionTypes.GET_ALL_USERS_REQUEST });
  try {
    const token = localStorage.getItem("accessToken"); 
    const res = await authService.getAllUsers(token); 
    dispatch({ type: actionTypes.GET_ALL_USERS_SUCCESS, payload: res.data });
  } catch (err: any) {
    dispatch({
      type: actionTypes.GET_ALL_USERS_FAILURE,
      payload: err.response?.data?.message || "Failed to fetch users",
    });
  }
};

