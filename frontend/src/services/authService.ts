import axiosInstance from "../axiosConfig";

export const authService = {
  login: (email: string, password: string) =>
    axiosInstance.post("/auth/login", { email, password }),

  loginWithGoogle: (accessTokenFromGoogle: string) =>
    axiosInstance.post("/auth/google/callback", {
      accessToken: accessTokenFromGoogle,
    }),

  logout: () => {
    localStorage.removeItem("persist:auth");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },

  saveTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  },
};
