import axiosInstance from "../axiosConfig";
import type { PaginationParams } from "@/types/pagination";

export const categoryService = {
  getAll: (params: PaginationParams = {}) =>
    axiosInstance.get("/category", { params }),
  getById: (id: string) => axiosInstance.get(`/category/${id}`),
  create: (formData: FormData) =>
    axiosInstance.post("/category", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id: string, formData: FormData) =>
    axiosInstance.patch(`/category/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  remove: (id: string) => axiosInstance.delete(`/category/${id}`),
};
