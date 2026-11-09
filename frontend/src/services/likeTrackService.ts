import AxiosInstance from "../axiosConfig";
import type { PaginationParams } from "@/types/pagination";

export const likeTrackService = {
    getLikeTracks: async (userId: string, params: PaginationParams = {}) =>
        AxiosInstance.get(`/like-tracks/${userId}`, { params }),
    addLikeTracks: async (userId: string, trackIds: string[]) => AxiosInstance.post("/like-tracks/add", { userId, trackIds }),
    removeLikeTracks: async (userId: string, trackIds: string[]) => AxiosInstance.delete("/like-tracks/delete", { data: { userId, trackIds }}), // delete đặt trong data
    syncLikeTracks: async (userId: string, trackIds: string[]) => AxiosInstance.post("/like-tracks/sync", { userId, trackIds }),
}
