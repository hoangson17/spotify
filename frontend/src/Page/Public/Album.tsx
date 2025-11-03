import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Play, Heart, MoreHorizontal } from "lucide-react";
import { getAlbumById } from "@/stores/actions/albumActions";
import { setCurrentSong } from "@/stores/actions/playerActions";

const Album = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
    
  const { albums } = useSelector((state: any) => state.albums);

  const handlePlayTrack = (track: any) => dispatch(setCurrentSong(track));

  useEffect(() => {
    if (id) dispatch(getAlbumById(Number(id)) as any);
  }, [id]);
  

  return (
    <div className="relative text-white">

      {albums && (
        <div className="fade-in">
          {/* HEADER */}
          <div className="flex items-end gap-6 p-6 bg-gradient-to-b from-[#3d3d3d] to-transparent">
            <img
              src={albums.cover_image}
              alt=""
              className="w-48 h-48 rounded shadow-lg object-cover"
            />

            <div>
              <p className="text-sm text-gray-300 font-semibold">Album</p>
              <h1 className="text-6xl font-bold mt-2">{albums.title}</h1>

              <p className="mt-3 text-gray-300 text-sm">
                {albums.artist?.name} · {albums.total_tracks} songs
              </p>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-6 px-6 py-4 border-b border-white/10">
            <button className="bg-green-500 hover:bg-green-400 h-16 w-16 rounded-full flex items-center justify-center hover:scale-105 transition">
              <Play className="text-black" size={34} />
            </button>
            <Heart className="hover:text-green-400 cursor-pointer" size={28} />
            <MoreHorizontal className="hover:text-green-400 cursor-pointer" size={28} />
          </div>

          {/* TRACK LIST */}
          <div className="grid grid-cols-[50px_2fr_1fr_60px] py-3 px-6 text-sm text-gray-400 border-b border-white/10">
            <span>#</span>
            <span>Title</span>
            <span>Artist</span>
            <span>⏱</span>
          </div>

          {albums.tracks?.map((track: any, index: number) => (
            <div
              key={track.id}
              className="group grid grid-cols-[50px_2fr_1fr_60px] items-center py-2 px-6 text-sm hover:bg-white/10 cursor-pointer"
              onClick={() => handlePlayTrack(track)}
            >
              <div className="text-gray-400 w-[50px] flex items-center">
                <span className="group-hover:hidden">{index + 1}</span>
                <Play className="hidden group-hover:block text-white" size={18} />
              </div>

              <div className="flex items-center gap-3">
                <img src={track.image_url} className="w-10 h-10 rounded object-cover" />
                <div>
                  <p className="font-medium">{track.title}</p>
                </div>
              </div>

              <span className="text-gray-300">{track.artistNames}</span>
              <span className="text-gray-300">{track.duration || "--:--"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Album;
