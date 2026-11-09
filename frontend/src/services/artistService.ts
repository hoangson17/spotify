import AxiosInstance from "../axiosConfig";
import type { PaginationParams } from "@/types/pagination";

export const artistService = {
    getAllArtists(params: PaginationParams = {}) {
        return AxiosInstance.get("/artists", { params });
    },
    getArtistById(id: string) {
        return AxiosInstance.get(`/artists/${id}`);
    },
    removeArtist(id: string) {
        return AxiosInstance.delete(`/artists/${id}`);
    },
    createArtist(data: any) {
        return AxiosInstance.post("/artists", data,{
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },
    updateArtist(id: string, data: any) {
        return AxiosInstance.patch(`/artists/${id}`, data,{
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },
    deleteTracks(artistId: string) {
        return AxiosInstance.delete(`/artist-track/delete`, { data: { artistId } });
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
