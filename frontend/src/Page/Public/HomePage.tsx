import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTracks } from "../../stores/actions/trackActions";
import { List, Item } from "../../components/index";
import { getArtist } from "@/stores/actions/artistActions";
import { getPlaylist } from "@/stores/actions/playlistActions";

const HomePage = () => {
  const dispatch = useDispatch();
  const { tracks, loading } = useSelector((state: any) => state.tracks);
  const { artists } = useSelector((state: any) => state.artists);
  const { playlist } = useSelector((state: any) => state.playlist);

  useEffect(() => {
    dispatch(getTracks() as any);
    dispatch(getArtist() as any);
    dispatch(getPlaylist() as any);
  }, [dispatch]);

  if (loading) return <div className="text-white p-4">Loading tracks...</div>;

  return (
    <div className="text-white p-6 space-y-12">
      {/* <List title="Your Playlist" items={tracks || []} /> */}
      <List title="Suggested artists" items={artists || []} isArtist />
      <List title="Your playlist" items={playlist || []} />
    </div>
  );
};

export default HomePage;
