import actionTypes from "./actionTypes";
import { authService } from "../../services/authService";

export const login = (email: string, password: string) => async (dispatch: any) => {
  dispatch({ type: actionTypes.LOGIN_REQUEST });
  try {
    const res = await authService.login(email, password);

    authService.saveTokens(res.data.accessToken, res.data.refreshToken);

    dispatch({ type: actionTypes.LOGIN_SUCCESS, payload: res.data });
  } catch (err: any) {
    dispatch({
      type: actionTypes.LOGIN_FAILURE,
      payload: err.response?.data?.message || "Login failed",
    });
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
