import React from "react";
import icons from "../utils/icons";
import { Slider } from "@/components/ui/slider";
import songImg from "../assets/none.png";

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
  return (
    <footer className="fixed bottom-0 left-0 right-0 h-[90px] bg-[#181818] border-t border-[#282828] flex items-center justify-between px-4 z-50">
      {/* Left: Song info */}
      <div className="flex items-center gap-3 w-[30%] min-w-[200px]">
        <img
          src={songImg}
          alt="song"
          className="w-[56px] h-[56px] rounded-md object-cover"
        />
        <div className="flex flex-col text-white">
          <span className="text-sm font-medium truncate w-[160px]">
            Song Title
          </span>
          <span className="text-xs text-gray-400 truncate w-[160px]">
            Artist Name
          </span>
        </div>
        <button
          className="text-gray-400 hover:text-[#1DB954] transition"
          aria-label="Like song"
        >
          <FaHeart size={18} />
        </button>
      </div>

      <div className="flex flex-col items-center justify-center gap-2 w-[40%] max-w-[500px]">
        <div className="flex items-center justify-center gap-5">
          <button className="text-gray-400 hover:text-white transition" title="Shuffle">
            <FaRandom size={16} />
          </button>
          <button className="text-gray-400 hover:text-white transition" title="Previous">
            <FaStepBackward size={20} />
          </button>

          <button
            className="bg-white rounded-full p-3 hover:scale-105 active:scale-95 transition-transform"
            title="Play"
          >
            <FaPlay size={16} className="text-black" />
          </button>

          <button className="text-gray-400 hover:text-white transition" title="Next">
            <FaStepForward size={20} />
          </button>
          <button className="text-gray-400 hover:text-white transition" title="Repeat">
            <FaRedoAlt size={16} />
          </button>
        </div>

        <div className="flex items-center gap-2 w-full">
          <span className="text-[11px] text-gray-400 font-mono">0:00</span>
          <div className="flex-1">
            <Slider
              defaultValue={[30]}
              max={100}
              step={1}
              className="w-full cursor-pointer"
            />
          </div>
          <span className="text-[11px] text-gray-400 font-mono">3:45</span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 w-[30%] min-w-[150px]">
        <FaVolumeUp className="text-gray-400 hover:text-white transition" size={18} />
        <div className="w-[100px]">
          <Slider
            defaultValue={[70]}
            max={100}
            step={1}
            className="cursor-pointer"
          />
        </div>
      </div>
    </footer>
  );
};

export default Playbar;
