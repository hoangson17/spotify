import React, { useEffect, useRef, useState } from "react";
import icons from "../utils/icons";
import { Slider } from "@/components/ui/slider";
import songImg from "../assets/none.png";
import { useSelector, useDispatch } from "react-redux";
import { togglePlay } from "@/stores/actions/playerActions";

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
  const { currentSong, isPlaying } = useSelector((state: any) => state.player);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // State cho tiến độ, thời lượng và âm lượng
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  // Khi chọn bài mới
  useEffect(() => {
    if (audioRef.current && currentSong?.audio_url) {
      audioRef.current.src = currentSong?.audio_url;
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch((err) => console.warn("Autoplay blocked:", err));
      }
    }
  }, [currentSong ]);

  // Khi play/pause
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch((err) => console.warn("Play error:", err));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Lắng nghe sự kiện audio
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
    }
  };

  //load thời gian
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    dispatch(togglePlay());
  };

  // Kéo thanh slider để tua
  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setProgress(value[0]);
    }
  };

  // Thay đổi âm lượng
  const handleVolumeChange = (value: number[]) => {
    const vol = value[0] / 100;
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  // Format thời gian mm:ss
  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      <footer className="fixed bottom-0 left-0 right-0 h-[90px] bg-[##000000]  border-[#282828] flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-3 w-[30%] min-w-[200px]">
          {currentSong && (
              <img
              src={currentSong?.image_url || songImg}
              alt={currentSong?.title}
              className="w-[56px] h-[56px] rounded-md object-cover"
            />
          )}
          <div className="flex flex-col text-white">
            <span className="text-sm font-medium truncate w-[160px]">
              {currentSong?.title}
            </span>
            <span className="text-xs text-gray-400 truncate w-[160px]">
              {currentSong?.artist || ""}
            </span>
          </div>
          {
            currentSong && (
              <button className="text-gray-400 hover:text-white transition">
                <FaHeart size={16} />
              </button>
            )
          }
        </div>

        <div className="flex flex-col items-center justify-center gap-2 w-[40%] max-w-[500px]">
          <div className="flex items-center justify-center gap-5">
            <button className="text-gray-400 hover:text-white transition">
              <FaRandom size={16} />
            </button>
            <button className="text-gray-400 hover:text-white transition">
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

            <button className="text-gray-400 hover:text-white transition">
              <FaStepForward size={20} />
            </button>
            <button className="text-gray-400 hover:text-white transition">
              <FaRedoAlt size={16} />
            </button>
          </div>

          {/* thanh nhạc */}
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
              />
            </div>
            <span className="text-[11px] text-gray-400 font-mono">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 w-[30%] min-w-[150px]">
          <FaVolumeUp className="text-gray-400 hover:text-white transition" size={18} />
          <div className="w-[100px]">
            <Slider
              value={[volume * 100]}
              max={100}
              step={1}
              onValueChange={handleVolumeChange}
            />
          </div>
        </div>
      </footer>
    </>
  );
};

export default Playbar;
