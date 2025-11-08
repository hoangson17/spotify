import { getTracks } from "@/stores/actions/trackActions";
import axiosInstance from "../axiosConfig";

export const likeTrackService = {
    getTracks: (userId: number) => axiosInstance.post(`/like-tracks/get`,userId),
    likeTrack: (userId: number,trackIds: number[]) => axiosInstance.post(`/like-tracks/add`,{userId,trackIds}),
    unlikeTrack: () => axiosInstance.delete(`/like-tracks/delete`),
}