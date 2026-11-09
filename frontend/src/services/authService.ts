import axiosInstance from "../axiosConfig";
import { saveTokens } from "./authTokens";
import type { PaginationParams } from "@/types/pagination";

export const authService = {
  login: (email: string, password: string) =>
    axiosInstance.post("/auth/login", { email, password }),

  loginWithGoogle: (code: string) =>
    axiosInstance.post("/auth/google/callback", {
      code,
    }),

  register: (body: any) => axiosInstance.post("/auth/register", body),

  logout: () => axiosInstance.post("/auth/logout"),

  saveTokens,

  forgotPassword(email: string) {
    return axiosInstance.post("/auth/forgot-password", { email });
  },

  resetPassword(data: { email: string; otp: string; newPassword: string }) {
    return axiosInstance.post("/auth/reset-password", data);
  },

  updateProfile(userId: string, formData: FormData) {
    return axiosInstance.patch(`/user/${userId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  getAllUsers: (params: PaginationParams = {}) =>
    axiosInstance.get("/user/all", {
      params,
      headers: {
        "Content-Type": "application/json",
      },
    }),

  deleteUser: (id: string) =>
    axiosInstance.delete(`/user/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
    }),

  restoreUser: (id: string) =>
    axiosInstance.patch(
      `/user/restore/${id}`,
      {}, // body rỗng
      {
        headers: {},
      }
    ),

  getUserLock: (params: PaginationParams = {}) =>
    axiosInstance.get("/user/lock", {
      params,
      headers: {
        "Content-Type": "application/json",
      },
    }),

  hardDeleteUser: (id: string) =>
    axiosInstance.delete(`/user/hard-delete/${id}`, {
      headers: {},
    }),
};
