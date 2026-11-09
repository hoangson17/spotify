import { getAlbums } from "@/stores/actions/albumActions";
import { getArtist } from "@/stores/actions/artistActions";
import { getPlaylist } from "@/stores/actions/playlistActions";
import { useEffect } from "react";
import { useDispatch,useSelector } from "react-redux";
import music from "../../assets/music.jpg";
import { Footer, List } from "../../components/index";
import { getTracks } from "../../stores/actions/trackActions";

const HomePage = () => {
  const dispatch = useDispatch();
  const { tracks, loading: tracksLoading } = useSelector((state: any) => state.tracks);
  const { artists, loading: artistsLoading } = useSelector((state: any) => state.artists);
  const { playlist, loading: playlistsLoading } = useSelector((state: any) => state.playlist);
  const { albums, loading: albumsLoading } = useSelector((state: any) => state.albums);

  useEffect(() => {
    if (!tracksLoading && (!Array.isArray(tracks) || !tracks.length))
      dispatch(getTracks(1, 12) as any);
    if (!artistsLoading && (!Array.isArray(artists) || !artists.length))
      dispatch(getArtist(1, 12) as any);
    if (!playlistsLoading && (!Array.isArray(playlist) || !playlist.length))
      dispatch(getPlaylist(1, 12) as any);
    if (!albumsLoading && (!Array.isArray(albums) || !albums.length))
      dispatch(getAlbums(1, 12) as any);
  }, [dispatch]);


  return (
    <div className="text-white p-6 space-y-12">
      <List title="Nghệ sĩ đề xuất" items={Array.isArray(artists) ? artists : []} loading={artistsLoading} isArtist imgNone={music} seeAllTo="/browse/artists" />
      <List title="Bài hát mới" items={Array.isArray(tracks) ? tracks : []} loading={tracksLoading} imgNone={music} seeAllTo="/browse/tracks" />
      <List title="Playlist" items={Array.isArray(playlist) ? playlist : []} loading={playlistsLoading} playlistTracks={Array.isArray(playlist) ? playlist : []} imgNone={music} seeAllTo="/browse/playlists" />
      <List title="Album nổi bật" items={Array.isArray(albums) ? albums : []} loading={albumsLoading} albumTracks={Array.isArray(albums) ? albums : []} imgNone={music} seeAllTo="/browse/albums" />
      <Footer />
    </div>
  );
};

export default HomePage;
