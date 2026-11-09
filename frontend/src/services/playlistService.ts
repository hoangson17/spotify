import axiosInstance from "../axiosConfig";
import type { PaginationParams } from "@/types/pagination";

export const playlistService = {
    getPlaylist: async (params: PaginationParams = {}) => {
        const response = await axiosInstance.get(`/playlist`, { params });
        return response;
    },
    getPlaylistById: async (id: string) => {
        const response = await axiosInstance.get(`/playlist/${id}`);
        return response;
    },
    createPlaylist: async (playlist: any) => {
        const response = await axiosInstance.post(`/playlist`, playlist,{
            headers: {
                'Content-Type': 'multipart/form-data',
                'Accept': 'application/json'
            },
        });
        return response;
    },
    updatePlaylist: async (id: string, playlist: any) => {
        const response = await axiosInstance.patch(`/playlist/${id}`, playlist,{
            headers: {
                'Content-Type': 'multipart/form-data',
                'Accept': 'application/json'
            },
        });
        return response;
    },
    deletePlaylist: async (id: string) => {
        const response = await axiosInstance.delete(`/playlist/${id}`);
        return response;
    },
    syncTrack: async (userId: string,id: string, trackIds: string[]) => {
        const response = await axiosInstance.post(`/playlist-track/sync/${userId}`,{ playlistId:id , trackIds });
        return response;
    },
    
    addTrack: async (userId: string,id: string, trackIds: string[]) => {
        console.log(userId,id,trackIds);
        const response = await axiosInstance.post(`/playlist-track/add/${userId}`, { playlistId:id , trackIds });
        return response;
    },

    removeTrack: async (userId: string,id: string, trackIds: string[]) => {
        const response = await axiosInstance.patch(`/playlist-track/remove/${userId}`, { playlistId: id, trackIds });
        return response;
    },

}
