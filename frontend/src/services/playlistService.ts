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
}