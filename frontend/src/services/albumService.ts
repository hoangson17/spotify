import axiosIntante from "../axiosConfig";

export const albumService =  {
    getAllAlbum: () => axiosIntante.get('/album'),
    getAlbumById: (id: number) => axiosIntante.get(`/album/${id}`),
    removeAlbum: (id: number) => axiosIntante.delete(`/album/${id}`),
    createAlbum: (formData: FormData) => axiosIntante.post('/album', formData, {
        headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
    }),
    updateAlbum: (id: number, formData: FormData) => axiosIntante.patch(`/album/${id}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
    }),
};