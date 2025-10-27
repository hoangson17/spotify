import axiosInstance from "../axiosConfig";

export const artistService = {
    createTrack(data: any) {
        return axiosInstance.post("/track", data);
    },

    getAllTracks() {
        return axiosInstance.get("/track");
    }
}