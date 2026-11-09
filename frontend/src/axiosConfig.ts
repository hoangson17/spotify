import axios from "axios";
import { store } from "./redux";
import { clearTokens, saveTokens } from "./services/authTokens";
import actionTypes from "./stores/actions/actionTypes";
import { loadUploadLimits, validateUploadFile } from "./utils/upload";

export const apiBaseUrl = String(import.meta.env.VITE_SERVER_API ?? "").replace(
  /\/+$/,
  "",
);

export const apiUrl = (path: string) =>
  `${apiBaseUrl}/${path.replace(/^\/+/, "")}`;

const instance = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
});
let refreshPromise: Promise<string> | null = null;
let refreshSession: string | null = null;
const authRequest = (url = "") =>
  /\/auth\/(login|register|google|refresh-token|logout|forgot-password|reset-password)(\/|$)/.test(
    url
  );

instance.interceptors.request.use(async (config) => {
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    const files = [...config.data.entries()].filter(
      (entry): entry is [string, File] => entry[1] instanceof Blob
    );
    if (files.length) {
      const limits = await loadUploadLimits();
      for (const [field, file] of files)
        validateUploadFile(file, field === "audio" ? "audio" : "image", limits);
      config.timeout = 120000;
    }
  }
  const token = store.getState().auth.accessToken;
  if (token && !authRequest(config.url))
    config.headers.Authorization = `Bearer ${token}`;
  // Logout also authenticates, while login and password recovery do not.
  if (token && config.url === "/auth/logout")
    config.headers.Authorization = `Bearer ${token}`;
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (
      !original ||
      error.response?.status !== 401 ||
      original._retry ||
      (authRequest(original.url) && original.url !== "/auth/logout")
    ) {
      return Promise.reject(error);
    }
    original._retry = true;
    const auth = store.getState().auth;
    if (!auth.refreshToken) return Promise.reject(error);
    // A request started before another request finished refreshing may use its result.
    if (
      auth.accessToken &&
      original.headers.Authorization !== `Bearer ${auth.accessToken}`
    ) {
      original.headers.Authorization = `Bearer ${auth.accessToken}`;
      return instance(original);
    }
    const sessionRefresh = auth.refreshToken;
    try {
      if (!refreshPromise || refreshSession !== sessionRefresh) {
        refreshSession = sessionRefresh;
        refreshPromise = axios
          .post(
            apiUrl("/auth/refresh-token"),
            { refreshToken: sessionRefresh },
            { timeout: 10000 }
          )
          .then(({ data }) => {
            if (store.getState().auth.refreshToken !== sessionRefresh)
              throw new Error("Session changed");
            saveTokens(data.accessToken, data.refreshToken);
            store.dispatch({
              type: actionTypes.REFRESH_TOKEN,
              payload: data.accessToken,
            });
            return data.accessToken as string;
          })
          .finally(() => {
            if (refreshSession === sessionRefresh) {
              refreshPromise = null;
              refreshSession = null;
            }
          });
      }
      const token = await refreshPromise;
      if (store.getState().auth.refreshToken !== sessionRefresh)
        throw new Error("Session changed");
      original.headers.Authorization = `Bearer ${token}`;
      return instance(original);
    } catch (refreshError) {
      if (store.getState().auth.refreshToken === sessionRefresh) {
        clearTokens();
        store.dispatch({ type: actionTypes.LOGOUT });
      }
      return Promise.reject(refreshError);
    }
  }
);

export default instance;
