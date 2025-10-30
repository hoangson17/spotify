import AxiosInstance from "../axiosConfig";

export const artistService = {
    getAllArtists() {
        return AxiosInstance.get("/artists");
    },
    getArtistById(id: number) {
        return AxiosInstance.get(`/artists/${id}`);
    },
};