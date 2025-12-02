import axiosInstance from "../axiosConfig";

export const trackService = {
    getAllTracks() {
        return axiosInstance.get("/track");
    },
    search: (keyword:any) => axiosInstance.get(`/track/search?keyword=${keyword}`),

    createTrack: (formData: FormData) => axiosInstance.post('/track', formData, {
        headers: {
          "Content-Type": "multipart/form-data", // axios sẽ tự set boundary
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
    }),

    updateTrack: (id: number, data: any) => axiosInstance.patch(`/track/${id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
    }),

    deleteTrack: (id: number) => axiosInstance.delete(`/track/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
    }),

}