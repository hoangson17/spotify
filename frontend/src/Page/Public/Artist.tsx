import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useLocation, Link } from "react-router-dom";
import { getArtistById } from "@/stores/actions/artistActions";
import { Play, Heart, MoreHorizontal } from "lucide-react";
import { queue, setCurrentSong } from "@/stores/actions/playerActions";

const Artist = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const location = useLocation();

  const { artists } = useSelector((state: any) => state.artists);
    
  const handlePlayTrack = (track: any) => dispatch(queue([track]));

  const handlePlayTracks = () => {
    if (artists?.tracks?.length) {
      dispatch(queue(artists.tracks)); 
    }
  };

  useEffect(() => {
    if (id) dispatch(getArtistById(Number(id)) as any);
  }, [id, location.pathname]);

  return (
    <div className="relative text-white">
      {artists && (
        <div className="fade-in">
          {/* HEADER */}
          <div className="p-8 flex gap-6 items-end bg-gradient-to-b from-[#202020] to-transparent">
            <img
              src={artists.avatar}
              alt=""
              className="w-48 h-48 rounded-full object-cover shadow-xl"
            />
            <div>
              <p className="text-sm text-gray-300 font-medium">Artist</p>
              <h1 className="text-7xl font-bold mt-2">{artists.name}</h1>

              {artists.country && (
                <p className="mt-2 text-gray-300 text-sm">From {artists.country}</p>
              )}

              <p className="text-gray-300 mt-3 text-sm">
                {artists.followers?.length || 0} Followers
              </p>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-6 px-8 py-4 border-b border-white/10">
            <button onClick={handlePlayTracks} className="bg-green-500 hover:bg-green-400 h-16 w-16 rounded-full flex items-center justify-center hover:scale-105 transition">
              <Play className="text-black" size={34} />
            </button>
            <Heart className="hover:text-green-400 cursor-pointer" size={30} />
            <MoreHorizontal className="hover:text-green-400 cursor-pointer" size={30} />
          </div>

          {/* POPULAR SONGS */}
          <h2 className="px-8 mt-8 mb-4 text-2xl font-bold">Popular</h2>

          {artists.tracks?.map((track: any, index: number) => (
            <div
              key={track.id}
              className="group grid grid-cols-[50px_1fr_80px] items-center px-8 py-3 hover:bg-white/10 cursor-pointer transition"
              onClick={() => handlePlayTrack(track)}
            >
              <div className="text-gray-400">
                <span className="group-hover:hidden">{index + 1}</span>
                <Play className="hidden group-hover:block text-white" size={18} />
              </div>

              <div className="flex items-center gap-3">
                <img src={track.image_url} className="w-12 h-12 rounded object-cover" />
                <span className="text-sm font-medium">{track.title}</span>
              </div>

              <span className="text-gray-300 text-sm text-right">
                {track.duration || "--:--"}
              </span>
            </div>
          ))}

          {/* ALBUMS */}
          <h2 className="px-8 mt-12 mb-4 text-2xl font-bold">Albums</h2>

          <div className="px-8 grid grid-cols-6 gap-6 pb-12">
            {artists.albums?.map((album: any) => (
              <Link 
                to={`/album/${album.id}`}
                key={album.id}
                className="group cursor-pointer hover:bg-white/10 p-3 rounded-lg transition"
              >
                <img
                  src={album.cover_image}
                  className="w-full h-44 object-cover rounded-lg shadow"
                />
                <p className="font-medium mt-3">{album.title}</p>
                <p className="text-gray-400 text-sm">{album.year || ""}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Artist;
