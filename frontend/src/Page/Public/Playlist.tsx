import { getPlaylistById } from "@/stores/actions/playlistActions";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useParams } from "react-router-dom";
import { Play, MoreHorizontal, Heart, Download, Shuffle } from "lucide-react";
import { setCurrentSong } from "@/stores/actions/playerActions";


const Playlist = () => {
  const dispatch = useDispatch();
  const { playlist } = useSelector((state: any) => state.playlist);
  const { id } = useParams();
  const location = useLocation();

  const handlePlayTrack = (track: any) => dispatch(setCurrentSong(track));

  useEffect(() => {
    if (!id) return;
    dispatch(getPlaylistById(Number(id)) as any);
  }, [id, location.pathname]);

  return (
    <div className="text-white relative">
      <div className="fade-in">
        {/* HEADER */}
        {playlist?.id && (
          <div className="flex items-end gap-6 p-6 bg-gradient-to-b from-[#3d3d3d] to-transparent">
            <img
              src={playlist.cover_image || playlist.image_url}
              className="w-48 h-48 rounded shadow-lg object-cover"
              alt=""
            />
            <div>
              <p className="text-sm text-gray-300 font-semibold">Playlist</p>
              <h1 className="text-6xl font-bold mt-2">{playlist.title}</h1>

              {playlist.description && (
                <p className="text-gray-300 mt-3 text-sm">{playlist.description}</p>
              )}

              <p className="mt-3 text-sm text-gray-300 flex gap-2 items-center">
                <img src="/spotify.png" className="w-5 h-5" />
                Spotify · saves ·{" "}
                {playlist.tracks?.length || 0} songs
              </p>
            </div>
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex items-center gap-6 px-6 py-4 border-b border-white/10">
          <button className="bg-green-500 hover:bg-green-400 h-16 w-16 rounded-full flex items-center justify-center hover:scale-105 transition">
            <Play className="text-black" size={34} />
          </button>
          <Heart className="hover:text-green-400 cursor-pointer" size={28} />
          <Shuffle className="hover:text-green-400 cursor-pointer" size={28} />
          <Download className="hover:text-green-400 cursor-pointer" size={28} />
          <MoreHorizontal className="hover:text-green-400 cursor-pointer" size={28} />
        </div>

        {/* TABLE HEADER */}
        <div className="flex items-center justify-between py-3 px-6 text-sm text-gray-400 border-b border-white/10">
          <div className="flex items-center gap-10"> 
            <span>#</span>
            <span>Title</span>
          </div>
          <span>⏱</span>
        </div>

        {playlist?.tracks?.map((track: any, index: number) => (
          <div
            key={track.id}
            className="flex items-center justify-between items-center py-2 px-6 text-sm hover:bg-white/10 cursor-pointer transition"
            onClick={() => handlePlayTrack(track)}
          >
            <div className="flex items-center gap-10"> 
            <div className="text-gray-400 flex items-center ">
              <span className="group-hover:hidden">{index + 1}</span>
              <Play className="hidden group-hover:block text-white" size={18} />
            </div>

            <div className="flex items-center gap-3">
              <img src={track.image_url} className="w-10 h-10 rounded object-cover" />
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
