import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTracks } from "../../stores/actions/trackActions";
import { List, Item } from "../../components/index";
import { getArtist } from "@/stores/actions/artistActions";
import { getPlaylist } from "@/stores/actions/playlistActions";
import { getAlbums } from "@/stores/actions/albumActions";
import music from "../../assets/music.jpg";

const HomePage = () => {
  const dispatch = useDispatch();
  // const { tracks, loading } = useSelector((state: any) => state.tracks);
  const { artists } = useSelector((state: any) => state.artists);
  const { playlist } = useSelector((state: any) => state.playlist);
  const { albums } = useSelector((state: any) => state.albums);

  useEffect(() => {
    dispatch(getTracks() as any);
    dispatch(getArtist() as any);
    dispatch(getPlaylist() as any);
    dispatch(getAlbums() as any);
  }, [dispatch]);


  return (
    <div className="text-white p-6 space-y-12">
      <List title="Suggested artists" items={artists || []} isArtist imgNone={music} />
      <List title="Your playlist" items={playlist || []} playlistTracks={playlist || []} imgNone={music}  />
      <List title="Top album" items={albums || []} albumTracks={albums || []} imgNone={music}  />
    </div>
  );
};

export default HomePage;
