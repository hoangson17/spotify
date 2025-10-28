import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTracks } from "../../stores/actions/trackActions";

const HomePage = () => {
  const dispatch = useDispatch();
  const { tracks, loading } = useSelector((state: any) => state.tracks);

  useEffect(() => {
    dispatch(getTracks() as any);
  }, [dispatch]);

  if (loading) return <div className="text-white p-4">Loading tracks...</div>;

  return (
    <div className="text-white p-6 bg-gray-900">
      <h1 className="text-3xl font-bold mb-6">Your Playlist</h1>
      {tracks?.length ? (
        <ul className="space-y-4">
          {tracks.map((t: any, index: number) => (
            <li
              key={t.id}
              className="flex items-center p-3 rounded hover:bg-gray-800 transition duration-200"
            >
              <span className="w-6 text-gray-400">{index + 1}</span>
              <img
                className="w-16 h-16 object-cover rounded mr-4"
                src={t.image_url}
                alt={t.title}
              />
              <div className="flex-1">
                <p className="font-semibold text-lg">{t.title}</p>
                {t.artist && (
                  <p className="text-gray-400 text-sm">{t.artist}</p>
                )}
                <audio
                  src={t.audio_url}
                  controls
                  className="w-full mt-2"
                ></audio>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400">No tracks found.</p>
      )}
    </div>
  );
};

export default HomePage;
