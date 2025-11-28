import { getAllUsers, register } from "@/stores/actions/authActions";
import axiosInstance from "../axiosConfig";

export const authService = {
  login: (email: string, password: string) =>
    axiosInstance.post("/auth/login", { email, password }),

  loginWithGoogle: (accessTokenFromGoogle: string) =>
    axiosInstance.post("/auth/google/callback", {
      accessToken: accessTokenFromGoogle,
    }),

  register: (body: any) => axiosInstance.post("/auth/register", body),

  logout: () => {
    localStorage.removeItem("persist:auth");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },

  saveTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  },

  forgotPassword(email: string) {
    return axiosInstance.post("/auth/forgot-password", { email });
  },

  resetPassword(data: { email: string; otp: string; newPassword: string }) {
    return axiosInstance.post("/auth/reset-password", data);
  },

  updateProfile(userId: number, formData: FormData) {
    return axiosInstance.patch(`/user/${userId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data", // axios sẽ tự set boundary
      },
    });
  },

  getAllUsers: (token: any) => 
  axiosInstance.get("/user/all", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }),

  deleteUser: (id: number, token: any) => 
  axiosInstance.delete(`/user/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }),

};
