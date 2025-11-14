import  axiosInstance  from "../axiosConfig";

export const playlistService = {
    getPlaylist: async () => {
        const response = await axiosInstance.get(`/playlist`);
        return response;
    },
    getPlaylistById: async (id: number) => {
        const response = await axiosInstance.get(`/playlist/${id}`);
        return response;
    },
    createPlaylist: async (playlist: any) => {
        const response = await axiosInstance.post(`/playlist`, playlist);
        return response;
    },
    updatePlaylist: async (id: number, playlist: any, config:{}) => {
        const response = await axiosInstance.patch(`/playlist/${id}`, playlist,config);
        return response;
    },
    deletePlaylist: async (id: number) => {
        const response = await axiosInstance.delete(`/playlist/${id}`);
        return response;
    },
    syncTrack: async (userId: number,id: number, trackIds: number[]) => {
        const response = await axiosInstance.patch(`/playlist-track/sync/${userId}`,{ playlistId:id , trackIds });
        return response;
    },

    addTrack: async (userId: number,id: number, trackIds: number[]) => {
        const response = await axiosInstance.post(`/playlist-track/add/${userId}`, { playlistId:id , trackIds });
        return response;
    },

    removeTrack: async (userId: number,id: number, trackIds: number[]) => {
        const response = await axiosInstance.patch(`/playlist/${id}/remove/${userId}`, { trackIds });
        return response;
    },

}