import AxiosInstance from "../axiosConfig";

export const likeTrackService = {
    getLikeTracks:async (userId: number) => AxiosInstance.get(`/like-tracks/${userId}`),
    addLikeTracks: async (userId: number, trackIds: number[]) => AxiosInstance.post("/like-tracks/add", { userId, trackIds }),
    removeLikeTracks: async (userId: number, trackIds: number[]) => AxiosInstance.delete("/like-tracks/delete", { data: { userId, trackIds }}), // delete đặt trong data 
    syncLikeTracks: async (userId: number, trackIds: number[]) => AxiosInstance.post("/like-tracks/sync", { userId, trackIds }),
}