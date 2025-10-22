import axios from "axios";
import reduxStore from "./redux";
import { refreshAccessToken, logout } from "./stores/actions/authActions";

const instance = axios.create({
  baseURL: import.meta.env.VITE_SERVER_API,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// request interceptor
instance.interceptors.request.use(
  (config) => {
    const state = reduxStore().store.getState();
    const token = state.auth?.accessToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// response interceptor
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const refreshToken = reduxStore().store.getState().auth.refreshToken;
        if (!refreshToken) throw new Error("No refresh token");

        const res = await axios.post(
          `${import.meta.env.VITE_SERVER_API}/auth/refresh-token`,
          { refreshToken }
        );
        const { accessToken } = res.data;

        // Cập nhật redux
        reduxStore().store.dispatch(refreshAccessToken(accessToken));

        // Retry request cũ
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return instance(originalRequest);
      } catch (err) {
        reduxStore().store.dispatch(logout());
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
