import axiosIntante from "../axiosConfig";

export const albumService =  {
    getAllAlbum: () => axiosIntante.get('/album'),
    getAlbumById: (id: number) => axiosIntante.get(`/album/${id}`),
};