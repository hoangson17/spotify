import { getPlaylistById } from "@/stores/actions/playlistActions";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useParams } from "react-router-dom";
import { Play, MoreHorizontal, Heart, Download, Shuffle } from "lucide-react";
import { queue, setCurrentSong } from "@/stores/actions/playerActions";
import { trackService } from "@/services/trackService";
import { playlistService } from "@/services/playlistService";
import { Button } from "@/components/ui/button";

const Playlist = () => {
  const dispatch = useDispatch();
  const { playlist } = useSelector((state: any) => state.playlist);
  const { playlistId } = useSelector((state: any) => state.playlist);
  // console.log(tracks);
  const [search, setSearch] = React.useState("");
  const [results, setResults] = React.useState([]);
  const [isShowSearch, setIsShowSearch] = React.useState(true);
  const auth = localStorage.getItem("persist:auth");
  const user = auth ? JSON.parse(JSON.parse(auth).user) : null;
  const { id } = useParams();
  const location = useLocation();

  const handlePlayTrack = (track: any) => dispatch(queue([track]));

  const handlePlayTracks = () => {
    if (playlistId?.tracks?.length) {
      dispatch(queue(playlistId.tracks)); 
    }
  };

  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      const res = await trackService.search(search);
      setResults(res.data);
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    if (!id) return;
    dispatch(getPlaylistById(Number(id)) as any);
  }, [id, location.pathname, playlist]);

  const handleAddTrack = async (trackIds: number) => {
    if (!trackIds) return;

    try {
      console.log("Adding track:", trackIds, "to playlist:", id);

      const res = await playlistService.addTrack(Number(id), [trackIds]);
      console.log("API response:", res.data);

      await dispatch(getPlaylistById(Number(id)) as any);
      console.log("Playlist updated");
    } catch (error: any) {
      console.error(
        "Failed to add track:",
        error.response?.data?.message || error.message
      );
    }
  };

  return (
    <div className="text-white relative">
      <div className="fade-in">
        {/* HEADER */}
        {playlistId?.id && (
          <div className="flex items-end gap-6 p-6 bg-gradient-to-b from-[#3d3d3d] to-transparent">
            <img
              src={playlistId.cover_image || playlistId.cover_image}
              className="w-48 h-48 rounded shadow-lg object-cover"
              alt=""
            />
            <div>
              <p className="text-sm text-gray-300 font-semibold">Playlist</p>
              <h1 className="text-6xl font-bold mt-2">{playlistId.title}</h1>

              {playlistId.description && (
                <p className="text-gray-300 mt-3 text-sm">
                  {playlistId.description}
                </p>
              )}

              <p className="mt-3 text-sm text-gray-300 flex gap-2 items-center">
                <img src="/spotify.png" className="w-5 h-5" />
                Spotify · saves · {playlistId.tracks?.length || 0} songs
              </p>
            </div>
          </div>
        )}
        {/* SEARCH */}
        { isShowSearch && 
          user.id === playlistId?.users.id && (
          <div className="px-6 py-6 border-b border-white/10">
            <h2 className="text-xl font-semibold mb-3">
              Let's find something for your playlist
            </h2>

            <div className="flex items-center justify-between">
              <input
              className="w-[300px] bg-[#2A2A2A] p-3 rounded-md outline-none"
              placeholder="Search for songs or artists"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              />
              <Button
                onClick={() => setIsShowSearch(false)}
                variant="ghost"
                // size="icon"
                className="text-3xl w-5 h-5 p-5 hover:bg-vertical hover:text-white cursor-pointer"
              >
                x
              </Button>
            </div>

            {results.length > 0 && (
              <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                {results.map((track: any) => (
                  <div
                    key={track.id}
                    className="flex items-center justify-between p-2 hover:bg-white/10 rounded transition"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={track.image_url}
                        className="w-10 h-10 rounded object-cover"
                      />
                      <div>
                        <p className="font-medium">{track.title}</p>
                        <p className="text-gray-400 text-sm">{track.artist}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddTrack(track.id)}
                      className="text-green-400 hover:text-green-300 text-sm"
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex items-center gap-6 px-6 py-4 border-b border-white/10">
          <button onClick={handlePlayTracks} className="bg-green-500 hover:bg-green-400 h-16 w-16 rounded-full flex items-center justify-center hover:scale-105 transition">
            <Play className="text-black" size={34} />
          </button>
          <Heart className="hover:text-green-400 cursor-pointer" size={28} />
          <Shuffle className="hover:text-green-400 cursor-pointer" size={28} />
          <Download className="hover:text-green-400 cursor-pointer" size={28} />
          <MoreHorizontal
            className="hover:text-green-400 cursor-pointer"
            size={28}
          />
        </div>

        {/* TABLE HEADER */}
        <div className="flex items-center justify-between py-3 px-6 text-sm text-gray-400 border-b border-white/10">
          <div className="flex items-center gap-10">
            <span>#</span>
            <span>Title</span>
          </div>
          <span>⏱</span>
        </div>

        {playlistId?.tracks?.map((track: any, index: number) => (
          <div
            key={track.id}
            className="flex items-center justify-between items-center py-2 px-6 text-sm hover:bg-white/10 cursor-pointer transition"
            onClick={() => handlePlayTrack(track)}
          >
            <div className="flex items-center gap-10">
              <div className="text-gray-400 flex items-center ">
                <span className="group-hover:hidden">{index + 1}</span>
                <Play
                  className="hidden group-hover:block text-white"
                  size={18}
                />
              </div>

              <div className="flex items-center gap-3">
                <img
                  src={track.image_url}
                  className="w-10 h-10 rounded object-cover"
                />
                <div>
                  <p className="font-medium">{track.title}</p>
                  <p className="text-gray-400">{track.artist}</p>
                </div>
              </div>
            </div>
            <span className="text-gray-300">{track.duration || "--:--"}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Playlist;
