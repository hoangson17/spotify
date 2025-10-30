import  AxiosInstance  from "../axiosConfig";

export const playlistService = {
    getPlaylist: async () => {
        const response = await AxiosInstance.get(`/playlist`);
        return response;
    }
}