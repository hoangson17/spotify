import { data } from "react-router-dom";
import AxiosInstance from "../axiosConfig";

export const artistService = {
    getAllArtists() {
        return AxiosInstance.get("/artists");
    },
    getArtistById(id: number) {
        return AxiosInstance.get(`/artists/${id}`);
    },
    removeArtist(id: number) {
        return AxiosInstance.delete(`/artists/${id}`);
    },
    createArtist(data: any) {
        return AxiosInstance.post("/artists", data,{
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },
    updateArtist(id: number, data: any) {
        return AxiosInstance.patch(`/artists/${id}`, data,{
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },
    deleteTracks(artistId: number) {
        return AxiosInstance.delete(`/artist-track/delete/${artistId}`);
    },
    syncTrack(data:any){
        return AxiosInstance.post(`/artist-track/sync`,data);
    },
    createTrack(data:any){
        console.log(data);
        return AxiosInstance.post(`/artist-track/create`,{artistId: data.artistId, trackId: [data.trackId]});
    },
    deleteTrack(data:any){
        return AxiosInstance.delete(`/artist-track/delete`,{data});
    }
};