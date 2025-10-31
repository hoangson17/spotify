import React from "react";
import clsx from "clsx";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setCurrentSong } from "@/stores/actions/playerActions";
import { Play } from "lucide-react";

interface Track {
  id: number | string;
  title: string;
  artist: string;
  image_url: string;
  audio_url: string;
  duration?: number;
}

interface ItemProps {
  id?: number | string;
  title?: string;
  artist?: string;
  image_url?: string;
  isArtist?: boolean;
  avatar?: string;
  name?: string;
  audio_url?: string;
  playlistTracks?: Track[];
  albumTracks?: Track[];
  className?: string;
  cover_image?: string,
  track?: Track;
  type?: "artist" | "album" | "playlist" | "track";
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
  playlistTracks,
  albumTracks,
  className,
  type
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [imgError, setImgError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const displayTitle = isArtist ? name : title;
  const imgSrc = imgError 
    ? "/default-image.png" 
    : (isArtist ? avatar : image_url);

  const handleImageError = () => {
    setImgError(true);
  };

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();

    let tracks: Track[] = [];
    let trackToPlay: Track | null = null;

    console.log(playlistTracks);
    

    if (playlistTracks && playlistTracks.length > 0) {
      tracks = playlistTracks;
    } else if (albumTracks && albumTracks.length > 0) {
      tracks = albumTracks;
    } else if (audio_url && title && artist && image_url && id) {
      trackToPlay = { 
        id, 
        title, 
        artist, 
        image_url, 
        audio_url 
      };
      tracks = [trackToPlay];
    }

    if (tracks.length > 0) {
      trackToPlay = tracks[0];
      dispatch(setCurrentSong(trackToPlay));
    }
  };

  const handleClick = (e: React.MouseEvent) => {
  e.stopPropagation();

  if (!id) return;

  switch (type) {
    case "artist":
      navigate(`/artist/${id}`);
      break;
    case "album":
      navigate(`/album/${id}`);
      break;
    case "playlist":
      navigate(`/playlist/${id}`);
      break;
    case "track":
      break;
    default:
      break;
  }
};

  

  const showPlayButton = playlistTracks?.length || albumTracks?.length || audio_url;


  return (
    <div
      onClick={handleClick}
      className={clsx(
        "group flex flex-col gap-3 p-3 rounded-lg cursor-pointer",
        "transition-all duration-300 hover:bg-[#2a2a2a]",
        "hover:shadow-[0_8px_20px_rgba(0,0,0,0.4)]",
        isLoading && "opacity-50 pointer-events-none",
        className
      )}
      role="button"
      tabIndex={0}
      aria-label={isArtist ? `View artist ${displayTitle}` : `Open ${displayTitle}`}
    >
      <div className="relative w-full">
        <img
          className={clsx(
            "w-full aspect-square object-cover transition-all duration-300",
            isArtist ? "rounded-full" : "rounded-md",
            isLoading && "animate-pulse"
          )}
          src={imgSrc}
          alt={displayTitle || "Media item"}
          onError={handleImageError}
          loading="lazy"
        />

        {showPlayButton && (
          <button
            onClick={handlePlay}
            className={clsx(
              "absolute right-2 bottom-2 p-3 rounded-full bg-green-500 text-black",
              "shadow-xl shadow-green-900/40 hover:bg-green-400 hover:scale-105",
              "translate-y-3 opacity-0 scale-90",
              "group-hover:translate-y-0 group-hover:opacity-100 group-hover:scale-100",
              "transition-all duration-300 cursor-pointer",
              "focus:translate-y-0 focus:opacity-100 focus:scale-100 focus:outline-none"
            )}
            aria-label={`Play ${displayTitle}`}
          >
            <Play size={18} fill="currentColor" />
          </button>
        )}
      </div>

      <div className="overflow-hidden min-h-[40px]">
        <p 
          className="font-semibold text-sm truncate" 
          title={displayTitle}
        >
          {displayTitle}
        </p>

        {artist && typeof artist === "string" && (
          <p 
            className="text-gray-400 text-xs truncate" 
            title={artist}
          >
            {artist}
          </p>
        )}
      </div>
    </div>
  );
};

export default Item;