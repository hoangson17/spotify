import { queue,setCurrentSong } from "@/stores/actions/playerActions";
import clsx from "clsx";
import { Play } from "lucide-react";
import React from "react";
import { useDispatch,useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import none from "../assets/none.png";
import { mediaUrl } from "@/utils/media";

interface Track {
  id: string;
  title: string;
  artist: string;
  image_url: string;
  audio_url: string;
  duration?: number;
}

interface ItemProps {
  id?: string;
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
  const [isLoading] = React.useState(false);

  const displayTitle = isArtist ? name : title;
  const imgSrc = imgError 
    ? none
    : (isArtist ? avatar : image_url);

  const handleImageError = () => {
    setImgError(true);
  };

  const user = useSelector((state: any) => state.auth.user);

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    let tracks: Track[] = [];
    let trackToPlay: Track | null = null;

    

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
      dispatch(queue(tracks));
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
          src={mediaUrl(imgSrc, none)}
          alt={displayTitle || "Media item"}
          onError={handleImageError}
          loading="lazy"
        />

        <button
          type="button"
          onClick={handlePlay}
          className={clsx(
            "absolute right-3 bottom-3 z-10 flex h-12 w-12 items-center justify-center",
            "rounded-full bg-green-500 text-black shadow-xl shadow-black/40",
            "translate-y-3 scale-90 opacity-0",
            "transition-all duration-200 ease-out",
            "group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100",
            "hover:scale-105 hover:bg-green-400",
            "focus-visible:translate-y-0 focus-visible:scale-100 focus-visible:opacity-100",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          )}
          aria-label={`Phát ${displayTitle}`}
        >
          <Play className="ml-0.5 cursor-pointer" size={21} fill="currentColor" />
        </button>
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
