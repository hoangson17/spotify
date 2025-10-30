import React from "react";
import clsx from "clsx";
import { useDispatch } from "react-redux";
import { setCurrentSong } from "@/stores/actions/playerActions";
import { Play } from "lucide-react";
import { getPlaylist } from "@/stores/actions/playlistActions"; // ✅ Thêm

interface ItemProps {
  id?: string;
  title: string;
  artist?: string;
  image_url: string;
  isArtist?: boolean;
  avatar?: string;
  name?: string;
  audio_url?: string;
  album?: any;
}

const Item: React.FC<ItemProps> = ({
  id,
  title,
  artist,
  image_url,
  avatar,
  name,
  isArtist,
  audio_url,
  album
}) => {
  const dispatch = useDispatch();

  const imgSrc = album?.cover_image || (isArtist ? avatar : image_url);

  const displayArtist =
    artist ||
    (album?.artists?.length
      ? album.artists.map((a: any) => a.name).join(", ")
      : "");

  const displayTitle = isArtist ? name : title;

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(
      setCurrentSong({
        id,
        title,
        artist: displayArtist,
        image_url: imgSrc,
        audio_url,
      })
    );
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
 
  };

  return (
    <div
      onClick={handleClick}
      className={clsx(
        "group flex flex-col gap-3 p-3 rounded-lg cursor-pointer",
        "transition-all duration-300 hover:bg-[#2a2a2a]",
        "hover:shadow-[0_8px_20px_rgba(0,0,0,0.4)]"
      )}
    >
      <div className="relative w-full">
        <img
          className={clsx(
            "w-full aspect-square object-cover transition-all duration-300",
            isArtist ? "rounded-full" : "rounded-md"
          )}
          src={imgSrc}
          alt={displayTitle}
        />

        {!isArtist && (
          <button
            onClick={handlePlay}
            className={clsx(
              "absolute right-2 bottom-2 p-3 rounded-full bg-green-500 text-black",
              "shadow-xl shadow-green-900/40",
              "translate-y-3 opacity-0 scale-90",
              "group-hover:translate-y-0 group-hover:opacity-100 group-hover:scale-100",
              "transition-all duration-300 cursor-pointer"
            )}
          >
            <Play size={18} />
          </button>
        )}
      </div>

      <div className="overflow-hidden">
        <p className="font-semibold text-sm truncate" title={displayTitle}>
          {displayTitle}
        </p>

        {displayArtist && !isArtist && (
          <p className="text-gray-400 text-xs truncate" title={displayArtist}>
            {displayArtist}
          </p>
        )}

        {album && (
          <p className="text-gray-500 text-[11px] truncate" title={album.title}>
            {album.title}
          </p>
        )}
      </div>
    </div>
  );
};

export default Item;
