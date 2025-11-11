import React, { useEffect, useRef, useState } from "react";
import icons from "../utils/icons";
import { Slider } from "@/components/ui/slider";
import songImg from "../assets/none.png";
import { useSelector, useDispatch } from "react-redux";
import { togglePlay } from "@/stores/actions/playerActions";
import { toast } from "sonner";
import { likeTrackService } from "@/services/likeTrackService";
import { addLikeTrack, removeLikeTrack } from "@/stores/actions/likeTracksAction";

const {
  FaPlay,
  FaPause,
  FaStepForward,
  FaStepBackward,
  FaRandom,
  FaRedoAlt,
  FaVolumeUp,
  FaHeart,
} = icons;

const Playbar: React.FC = () => {
  const dispatch = useDispatch();
  const { queue, isPlaying } = useSelector((state: any) => state.player);
  const { likedTracks } = useSelector((state: any) => state.likedTracks);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playQueue, setPlayQueue] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const auth = localStorage.getItem("persist:auth");
  const user = auth ? JSON.parse(JSON.parse(auth).user) : null;
  // Đồng bộ playQueue khi queue thay đổi
  useEffect(() => {
    if (queue.length > 0) {
      setPlayQueue(queue);
      setCurrentIndex(0);
    }
  }, [queue]);

  // Khi currentIndex thay đổi, load bài mới
  useEffect(() => {
    const track = playQueue[currentIndex];
    if (track && audioRef.current) {
      audioRef.current.src = track.audio_url;
      audioRef.current.load();
      if (isPlaying) audioRef.current.play().catch((err) => console.warn(err));
    }
  }, [currentIndex, playQueue]);

  // Khi play/pause
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch((err) => console.warn(err));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Audio events
  const handleTimeUpdate = () => {
    if (audioRef.current) setProgress(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const handleEnded = () => {
    handleNext();
  };

  // Nút điều khiển
  const handleNext = () => {
    if (!playQueue.length) return;
    const nextIndex = (currentIndex + 1) % playQueue.length;
    setCurrentIndex(nextIndex);
  };

  const handlePrev = () => {
    if (!playQueue.length) return;
    const prevIndex = (currentIndex - 1 + playQueue.length) % playQueue.length;
    setCurrentIndex(prevIndex);
  };

  const handleReplay = () => {
    if (!playQueue.length || !audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play();
  };

  const handleShuffle = () => {
    if (!playQueue.length) return;
    const randomIndex = Math.floor(Math.random() * playQueue.length);
    setCurrentIndex(randomIndex);
  };

  // Slider
  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setProgress(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const vol = value[0] / 100;
    setVolume(vol);
    if (audioRef.current) audioRef.current.volume = vol;
  };

  // Format time mm:ss
  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const currentTrack = playQueue[currentIndex];
  const isLiked = likedTracks?.some((t: any) => t.id === currentTrack?.id);

  const handleLikeTrack = async (userId: number, trackId: number) => {
  try {
    if (!userId) {
      toast.error("Bạn cần đăng nhập để thích bài hát");
      return;
    }

    if (!isLiked) {
      const response = await likeTrackService.addLikeTracks(userId, [trackId]);

      if (response.status === 201) {
        toast.success("Đã thích bài hát");
        dispatch(addLikeTrack(currentTrack));
      } else {
        toast.error(response.data.message);
      }

    } else {
      const response = await likeTrackService.removeLikeTracks(userId, [trackId]);

      if (response.status === 200) {
        toast.success("Đã bỏ thích bài hát");
        dispatch(removeLikeTrack(currentTrack)); 
      } else {
        toast.error(response.data.message);
      }
    }

  } catch (error) {
    toast.error("Đã xảy ra lỗi");
  }
};


  return (
    <>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      <footer className="fixed bottom-0 left-0 right-0 h-[90px] bg-[#000000] border-[#282828] flex items-center justify-between px-4 z-50">
        {/* Track Info */}
        <div className="flex items-center gap-3 w-[30%] min-w-[200px]">
          {currentTrack && (
            <img
              src={currentTrack.image_url || songImg}
              alt={currentTrack.title}
              className="w-[56px] h-[56px] rounded-md object-cover"
            />
          )}
          <div className="flex flex-col text-white">
            <span className="text-sm font-medium truncate w-[160px]">
              {currentTrack?.title}
            </span>
            <span className="text-xs text-gray-400 truncate w-[160px]">
              {currentTrack?.artist || ""}
            </span>
          </div>
          {currentTrack && (
            <button
              onClick={() => handleLikeTrack(user.id, currentTrack.id)}
              className={`${
                isLiked ? "text-red-500" : "text-gray-400"
              } hover:text-white transition`}
            >
              <FaHeart size={16} />
            </button>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center justify-center gap-2 w-[40%] max-w-[500px]">
          <div className="flex items-center justify-center gap-5">
            <button
              onClick={handleShuffle}
              className="text-gray-400 hover:text-white transition"
            >
              <FaRandom size={16} />
            </button>
            <button
              onClick={handlePrev}
              className="text-gray-400 hover:text-white transition"
            >
              <FaStepBackward size={20} />
            </button>

            <button
              onClick={() => dispatch(togglePlay())}
              className="bg-white rounded-full p-3 hover:scale-105 active:scale-95 transition-transform"
            >
              {isPlaying ? (
                <FaPause size={16} className="text-black" />
              ) : (
                <FaPlay size={16} className="text-black" />
              )}
            </button>

            <button
              onClick={handleNext}
              className="text-gray-400 hover:text-white transition"
            >
              <FaStepForward size={20} />
            </button>
            <button
              onClick={handleReplay}
              className="text-gray-400 hover:text-white transition"
            >
              <FaRedoAlt size={16} />
            </button>
          </div>

          {/* Progress Slider */}
          <div className="flex items-center gap-2 w-full">
            <span className="text-[11px] text-gray-400 font-mono">
              {formatTime(progress)}
            </span>
            <div className="flex-1">
              <Slider
                value={[progress]}
                max={duration || 0}
                step={1}
                onValueChange={handleSeek}
                className="spotify-slider"
              />
            </div>
            <span className="text-[11px] text-gray-400 font-mono">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume */}
        <div className="flex items-center justify-end gap-3 w-[30%] min-w-[150px]">
          <FaVolumeUp
            className="text-gray-400 hover:text-white transition"
            size={18}
          />
          <div className="w-[100px]">
            <Slider
              value={[volume * 100]}
              max={100}
              step={1}
              onValueChange={handleVolumeChange}
              className="spotify-slider"
            />
          </div>
        </div>
      </footer>
    </>
  );
};

export default Playbar;
