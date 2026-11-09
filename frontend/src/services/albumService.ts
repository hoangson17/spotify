import axiosIntante from "../axiosConfig";
import type { PaginationParams } from "@/types/pagination";

export const albumService =  {
    getAllAlbum: (params: PaginationParams = {}) =>
        axiosIntante.get('/album', { params }),
    getAlbumById: (id: string) => axiosIntante.get(`/album/${id}`),
    removeAlbum: (id: string) => axiosIntante.delete(`/album/${id}`),
    createAlbum: (formData: FormData) => axiosIntante.post('/album', formData, {
        headers: {
            "Content-Type": "multipart/form-data",

        },
    }),
    updateAlbum: (id: string, formData: FormData) => axiosIntante.patch(`/album/${id}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",

        },
    }),
};
