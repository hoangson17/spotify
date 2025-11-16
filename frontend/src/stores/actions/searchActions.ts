import { searchService } from "@/services/searchService";
import actionTypes from "./actionTypes";
import { trackService } from "@/services/trackService";
import { albumService } from "@/services/albumService";
import { artistService } from "@/services/artistService";
import { playlistService } from "@/services/playlistService";

export const searchAll = (query: string) => async (dispatch: any) => {
  try {
    dispatch({ type: actionTypes.SEARCH_REQUEST });

    const res = await searchService.search(query);
    // console.log(res);
    
    dispatch({
      type: actionTypes.SEARCH_SUCCESS,
      results: res.data,
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
      trackService.getAllTracks(),
      albumService.getAllAlbum(),
      artistService.getAllArtists(),
      playlistService.getPlaylist()
    ]);

    const tracks = tracksRes?.data || [];
    const albums = albumsRes?.data || [];
    const artists = artistsRes?.data || [];
    const playlists = playlistsRes?.data || [];

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
