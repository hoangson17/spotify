import axiosInstance from "../axiosConfig";
import type { AxiosProgressEvent } from "axios";
import type { PaginationParams } from "@/types/pagination";

export const trackService = {
    getAllTracks(params: PaginationParams & { categoryId?: string } = {}) {
        return axiosInstance.get("/track", { params });
    },
    search: (keyword: string, params: PaginationParams = {}) =>
        axiosInstance.get("/track/search", { params: { keyword, ...params } }),

    createTrack: (
      formData: FormData,
      onUploadProgress?: (event: AxiosProgressEvent) => void,
    ) => axiosInstance.post('/track', formData, {
        headers: {
          "Content-Type": "multipart/form-data", // axios sẽ tự set boundary

        },
        onUploadProgress,
    }),

    updateTrack: (
      id: string,
      data: FormData,
      onUploadProgress?: (event: AxiosProgressEvent) => void,
    ) => axiosInstance.patch(`/track/${id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",

        },
        onUploadProgress,
    }),

    deleteTrack: (id: string) => axiosInstance.delete(`/track/${id}`, {
        headers: {

        },
    }),

}
