import axiosInstance from "../axiosConfig";

export const trackService = {
    getAllTracks() {
        return axiosInstance.get("/track");
    },
    search: (keyword:any) => axiosInstance.get(`/track/search?keyword=${keyword}`),


}