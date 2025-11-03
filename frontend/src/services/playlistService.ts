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
}