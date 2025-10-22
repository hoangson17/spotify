import axiosInstance from "../../axiosConfig";
import actionTypes from "./actionTypes";

export const login = (email: string, password:string) => async (dispatch : any) => {
  dispatch({ type: actionTypes.LOGIN_REQUEST });
  try {
    const res = await axiosInstance.post(`/auth/login`, { email, password });
    dispatch({ type: actionTypes.LOGIN_SUCCESS, payload: res.data });

    localStorage.setItem("accessToken", res.data.accessToken);
    localStorage.setItem("refreshToken", res.data.refreshToken);
  } catch (err:any) {
    dispatch({
      type: actionTypes.LOGIN_FAILURE,
      payload: err.response?.data?.message || "Login failed",
    });
  }
};

export const loginWithGoogle = (accessTokenFromGoogle: string) => async (dispatch:any) => {
  dispatch({ type: actionTypes.LOGIN_REQUEST });
  try {
    const res = await axiosInstance.post(`/auth/google/callback`, {
      accessToken: accessTokenFromGoogle,
    });

    // Lưu token
    localStorage.setItem("accessToken", res.data.accessToken);
    localStorage.setItem("refreshToken", res.data.refreshToken);

    dispatch({ type: actionTypes.LOGIN_SUCCESS, payload: res.data });
  } catch (err:any) {
    dispatch({
      type: actionTypes.LOGIN_FAILURE,
      payload: err.response?.data?.message || "Google login failed",
    });
  }
};

export const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  return { type: actionTypes.LOGOUT };
};

export const refreshAccessToken = (token:any) => ({
  type:  actionTypes.REFRESH_TOKEN,
  payload: token,
});

export const setProfile = (data:any) => ({
  type: actionTypes.SET_PROFILE,
  payload: data,
});
