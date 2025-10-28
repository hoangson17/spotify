import axiosInstance from "../axiosConfig";

export const trackService = {
    getAllTracks() {
        return axiosInstance.get("/track");
    }
}