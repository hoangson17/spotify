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
    delete axiosInstance.defaults.headers.common["Authorization"];
  },

  saveTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    axiosInstance.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${accessToken}`;
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
        "Content-Type": "multipart/form-data",
      },
    });
  },

  getAllUsers: () =>
    axiosInstance.get("/user/all", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    }),

  deleteUser: (id: number) =>
    axiosInstance.delete(`/user/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    }),

  restoreUser: (id: number) =>
    axiosInstance.patch(
      `/user/restore/${id}`,
      {}, // body rỗng
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    ),

  getUserLock: () =>
    axiosInstance.get("/user/lock", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    }),

  hardDeleteUser: (id: number) =>
    axiosInstance.delete(`/user/hard-delete/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    }),
};
