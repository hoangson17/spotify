import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, Link } from "react-router-dom";
import { searchAll } from "@/stores/actions/searchActions";
import { Play } from "lucide-react";
import { setCurrentSong } from "@/stores/actions/playerActions";

const Search = () => {
  const dispatch = useDispatch();
  const { results, loading } = useSelector((state: any) => state.search);
  const query = new URLSearchParams(useLocation().search).get("q") || "";

    const handlePlayTrack = (track: any) => dispatch(setCurrentSong(track));
  

  useEffect(() => {
    if (query) dispatch(searchAll(query) as any);
  }, [query]);

  if (loading)
    return <div className="text-white p-6 text-xl font-semibold">Searching...</div>;

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-8">Search results for "{query}"</h1>

      {/* Tracks */}
      {results?.tracks?.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Songs</h2>
          <div className="flex flex-col">
            {results.tracks.map((track: any, index: number) => (
              <div
                key={track.id}
                onClick={() => handlePlayTrack(track)}
                className="group flex items-center justify-between px-4 py-2 rounded hover:bg-white/10 transition relative"
              >
                <div className="flex items-center gap-4">
                  <span className="w-6 text-gray-400 text-right">{index + 1}</span>
                  <img
                    src={track.image_url}
                    alt={track.title}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div className="flex flex-col">
                    <span className="font-semibold">{track.title}</span>
                    <span className="text-gray-400 text-sm">{track.artistNames}</span>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition">
                  <button className="bg-green-500 p-2 rounded-full hover:scale-110 transition">
                    <Play size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Artists */}
      {results?.artists?.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Artists</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {results.artists.map((artist: any) => (
              <Link
                key={artist.id}
                to={`/artist/${artist.id}`}
                className="group relative flex flex-col items-center cursor-pointer transform transition hover:scale-105"
              >
                <div className="w-24 h-24 rounded-full overflow-hidden relative">
                  <img
                    src={artist.avatar}
                    alt={artist.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition rounded-full">
                    <Play size={28} className="text-white" />
                  </div>
                </div>
                <span className="mt-2 text-center font-medium">{artist.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Albums */}
      {results?.albums?.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Albums</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {results.albums.map((album: any) => (
              <Link
                key={album.id}
                to={`/album/${album.id}`}
                className="group relative flex flex-col cursor-pointer transform transition hover:scale-105"
              >
                <div className="w-32 h-32 rounded overflow-hidden relative">
                  <img
                    src={album.cover_image}
                    alt={album.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition rounded">
                    <Play size={28} className="text-white" />
                  </div>
                </div>
                <span className="mt-2 text-center font-medium">{album.title}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
