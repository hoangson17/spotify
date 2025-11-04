import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { IoMenu } from "react-icons/io5";
import { FaMusic } from "react-icons/fa";
import { Plus } from "lucide-react";
import { playlistService } from "@/services/playlistService";
import { addPlaylist } from "@/stores/actions/playlistActions";

const SidebarCustom = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [playlist, setPlaylist] = useState<any[]>([]);

  const dispatch = useDispatch();

  const auth = JSON.parse(localStorage.getItem("persist:auth") || "{}");
  const user = auth?.user ? JSON.parse(auth.user) : null;
 
  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const data = await playlistService.getPlaylist();
        setPlaylist(data?.data || []);
      } catch (error) {
        console.error("Error fetching playlist:", error);
      }
    };
    fetchPlaylist();
  }, [playlist,auth,user]);

  const userPlaylists = playlist.filter(
    (p: any) => (p?.users?.id ?? p?.user_id) === user?.id
  );

  const handleCreatePlaylist = async () => {
    if (!user?.id) return;
    try {
      const newPlaylist = await playlistService.createPlaylist({
        user_id: user.id,
        title: "New Playlist",
      });
      dispatch(addPlaylist(newPlaylist));
      setPlaylist((prev) => [...prev, newPlaylist]);
    } catch (error) {
      console.error("Tạo playlist thất bại:", error);
    }
  };

  return (
    <div className="bg-[#121212] h-full text-white rounded-xl">
      <aside
        className={`bg-[#121212] border-r border-[#1f1f1f] flex flex-col transition-all duration-300 rounded-xl ${
          collapsed ? "w-[72px]" : "w-[280px]"
        }`}
      >
        <div className="flex items-center justify-between h-[64px] px-4 gap-3 border-b border-[#1f1f1f]">
          <div className="flex items-center">
            <button
              className="p-2 rounded hover:bg-[#1f1f1f] transition flex-shrink-0"
              onClick={() => setCollapsed(!collapsed)}
            >
              <IoMenu size={24} />
            </button>
            <span
              className={`text-sm font-semibold transition-all duration-300 ease-in-out whitespace-nowrap ${
                collapsed ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
            >
              Your Library
            </span>
          </div>

          <button
            className="p-1 rounded-full hover:bg-[#3f3f3f] bg-[#1f1f1f] transition flex-shrink-0 cursor-pointer"
            title="Tạo playlist mới"
            onClick={handleCreatePlaylist}
          >
            <Plus size={24} />
          </button>
        </div>

      {user && playlist.length > 0 && (
        <nav className="flex-1 mt-2 overflow-y-auto">
          {userPlaylists.length > 0 ? (
            userPlaylists.map((item: any) => (
              <div key={item.id}>
                <Link
                  to={`/playlist/${item.id}`}
                  className="flex items-center gap-3 w-full px-6 py-3 hover:bg-[#1f1f1f] rounded transition relative"
                >
                  <span className="flex-shrink-0 w-6 flex justify-center">
                    <FaMusic size={18} />
                  </span>
                  <span
                    className={`text-sm font-medium transition-all duration-300 ease-in-out whitespace-nowrap ${
                      collapsed ? "opacity-0 pointer-events-none w-0" : "opacity-100 w-auto"
                    }`}
                  >
                    {item.title}
                  </span>
                </Link>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm px-6 mt-4">
              Chưa có playlist nào
            </p>
          )}
        </nav>
      )}
      </aside>
    </div>
  );
};

export default SidebarCustom;
