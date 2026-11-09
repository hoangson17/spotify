import { searchService } from "@/services/searchService";
import actionTypes from "./actionTypes";
import { trackService } from "@/services/trackService";
import { albumService } from "@/services/albumService";
import { artistService } from "@/services/artistService";
import { playlistService } from "@/services/playlistService";

export const searchAll = (query: string, page = 1, limit = 12) => async (dispatch: any) => {
  try {
    dispatch({ type: actionTypes.SEARCH_REQUEST });

    const res = await searchService.search(query, { page, limit });
    // console.log(res);
    
    const metas = [res.data.tracks.meta, res.data.albums.meta, res.data.artists.meta];
    const totalPages = Math.max(...metas.map((meta) => meta.totalPages));
    dispatch({
      type: actionTypes.SEARCH_SUCCESS,
      results: {
        tracks: res.data.tracks.items,
        albums: res.data.albums.items,
        artists: res.data.artists.items,
      },
      meta: {
        ...res.data.tracks.meta,
        total: metas.reduce((sum, meta) => sum + meta.total, 0),
        totalPages,
        hasPreviousPage: page > 1,
        hasNextPage: page < totalPages,
      },
    });
  } catch (error: any) {
    dispatch({
      type: actionTypes.SEARCH_FAIL,
      error: error.message,
    });
  }
};

export const getDataSearch = () => async (dispatch: any) => {
  try {
    const [tracksRes, albumsRes, artistsRes, playlistsRes] = await Promise.all([
      trackService.getAllTracks({ page: 1, limit: 100 }),
      albumService.getAllAlbum({ page: 1, limit: 100 }),
      artistService.getAllArtists({ page: 1, limit: 100 }),
      playlistService.getPlaylist({ page: 1, limit: 100 })
    ]);

    const tracks = tracksRes?.data?.items || [];
    const albums = albumsRes?.data?.items || [];
    const artists = artistsRes?.data?.items || [];
    const playlists = playlistsRes?.data?.items || [];

    const suggestions = [
      ...artists.map((a: any) => ({
        type: "artist",
        name: a.name,
        data: a
      })),
      ...playlists.map((p: any) => ({
        type: "playlist",
        name: p.title,
        data: p
      })),
      ...albums.map((al: any) => ({
        type: "album",
        name: al.title,
        data: al
      })),
      ...tracks.map((t: any) => ({
        type: "track",
        name: t.title,
        data: t
      })),
    ];    

    dispatch({
      type: actionTypes.GET_DATA_SEARCH_SUCCESS,
      data: suggestions,
    });
  } catch (error: any) {
    dispatch({
      type: actionTypes.GET_DATA_SEARCH_FAIL,
      error: error.message,
    });
  }
};
