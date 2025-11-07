import React, { useState, useEffect, act } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { IoMenu } from "react-icons/io5";
import { FaMusic } from "react-icons/fa";
import { Plus } from "lucide-react";
import { playlistService } from "@/services/playlistService";
import {
  addPlaylist,
  deletePlaylist,
  updatePlaylist,
  getPlaylist,
} from "@/stores/actions/playlistActions";
import { Button } from "./ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "./ui/dialog";
import { DialogFooter, DialogHeader } from "./ui/dialog";
import { Label } from "@radix-ui/react-dropdown-menu";
import { Input } from "./ui/input";

const SidebarCustom = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<any>(null);



  const dispatch: any = useDispatch();

  const user = useSelector((state: any) => state.auth.user);
  const playlist = useSelector((state: any) => state.playlist.playlist);
  
  useEffect(() => {
    if (user?.id) {
      dispatch(getPlaylist());
    }
  }, [user?.id, dispatch]);

  const userPlaylists = playlist.filter(
    (p: any) => (p?.users?.id ?? p?.user_id) === user?.id
  );

  // console.log(userPlaylists);
  

  const [edit, setEdit] = useState({
    title: "",
    description: "",
    cover_image: null as File | null, 
  });

  const handleCreatePlaylist = async () => {
    if (!user?.id) return;
    try {
      const res = await playlistService.createPlaylist({
        user_id: user.id,
        title: "New Playlist",
      });
      const newPlaylist = res?.data?.data;
      dispatch(addPlaylist(newPlaylist));
    } catch (error) {
      console.error("Tạo playlist thất bại:", error);
    }
  };

  const handleDeletePlaylist = async (playlistId: number) => {
    try {
      await playlistService.deletePlaylist(playlistId);
      dispatch(deletePlaylist(playlistId)); // ✅ redux tự filter
    } catch (error) {
      console.error("Xóa playlist thất bại:", error);
    }
  };

const handleUpdate = async () => {
  try {
    const formData = new FormData();
    formData.append("title", edit.title || "");
    formData.append("description", edit.description || "");
    if (edit.cover_image instanceof File) {
      formData.append("cover_image", edit.cover_image);
    }

    const res = await playlistService.updatePlaylist(editingPlaylist.id, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const updated = res.data;
    console.log("Updated playlist:", updated);
    dispatch(updatePlaylist(updated));
    setEditingPlaylist(null);
  } catch (err) {
    console.error("Lỗi update playlist:", err);
  }
};



  return (
    <div className="bg-[#121212] h-full text-white rounded-xl">
      <Dialog
        open={Boolean(editingPlaylist)}
        onOpenChange={() => setEditingPlaylist(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Playlist</DialogTitle>
            <DialogDescription>
              Change the playlist title and save.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label>Playlist Title</Label>
              <Input
                value={edit.title}
                onChange={(e) => setEdit({ ...edit, title: e.target.value })}
              />
              <Label>Playlist Cover</Label>
              <Input
                type="file"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setEdit({ ...edit, cover_image: e.target.files[0] });
                  }
                }}
              />

              {edit.cover_image && (
                <img
                  src={URL.createObjectURL(edit.cover_image)}
                  alt="Cover Preview"
                  className="w-24 h-24 object-cover mt-2"
                />
              )}


              <Input
                value={edit.description}
                onChange={(e) => setEdit({ ...edit, description: e.target.value })}
              />

            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleUpdate}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              className={`text-sm font-semibold transition-all duration-300 ${
                collapsed ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
            >
              Your Library
            </span>
          </div>

          <button
            className="p-1 rounded-full hover:bg-[#3f3f3f] bg-[#1f1f1f] transition cursor-pointer"
            title="Tạo playlist mới"
            onClick={handleCreatePlaylist}
          >
            <Plus size={24} />
          </button>
        </div>

        {user ? (
          userPlaylists.length > 0 ? (
            <nav className="flex-1 mt-2">
              {userPlaylists.map((item: any) => (
                <ContextMenu key={item.id}>
                  <ContextMenuTrigger>
                    <Link
                      to={`/playlist/${item.id}`}
                      className="flex items-center gap-3 w-full px-6 py-3 hover:bg-[#1f1f1f] rounded transition"
                    >
                      <span className="w-6 flex justify-center">
                        <FaMusic size={18} />
                      </span>
                      <div className="flex flex-col ">
                        <span
                        className={`text-sm font-medium transition-all ${
                          collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
                        }`}
                      >
                        {item.title}
                      </span>
                      <small>{item.users.name}</small>
                      </div>
                    </Link>
                  </ContextMenuTrigger>

                  <ContextMenuContent className="w-48 p-[6px] rounded-md text-stone-50 bg-[#2a2a2a] border border-[#3a3a3a] shadow-xl animate-in fade-in-0 zoom-in-95">
                    <ContextMenuItem
                      onClick={() => console.log("Play", item.id)}
                      className="px-2 py-2 text-sm rounded hover:bg-[#3a3a3a] cursor-pointer transition"
                    >
                      Play
                    </ContextMenuItem>

                    <ContextMenuItem
                      onClick={() => {
                        setEditingPlaylist(item);
                        setEdit(item.title);
                      }}
                      className="px-2 py-2 text-sm rounded hover:bg-[#3a3a3a] cursor-pointer transition"
                    >
                      Edit Details
                    </ContextMenuItem>

                    <ContextMenuItem
                      className="px-2 py-2 text-sm text-red-400 rounded hover:bg-red-500/20 hover:text-red-300 cursor-pointer transition"
                      onClick={() => handleDeletePlaylist(item.id)}
                    >
                      Delete
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))}
            </nav>
          ) : (
            <div
              className={`flex flex-col gap-5 p-6 ${collapsed ? "hidden" : ""}`}
            >
              <div className="flex flex-col gap-3">
                <p>
                  <b>Create your first playlist</b><br />
                  <small>It's easy, we'll help you</small>
                </p>
                <Button
                  onClick={handleCreatePlaylist}
                  className="bg-white text-black font-bold hover:bg-white hover:scale-105 cursor-pointer rounded-full"
                >
                  Create playlist
                </Button>
              </div>
              <div className="flex flex-col gap-3">
                <p>
                  <b>Let's find some podcasts to follow</b><br />
                  <small>We'll keep you updated on new episodes</small>
                </p>
                <Button className="bg-white text-black font-bold hover:bg-white hover:scale-105 cursor-pointer rounded-full">
                  Browse podcasts
                </Button>
              </div>
            </div>
          )
        ) : (
          <div
            className={`flex flex-col gap-5 p-6 ${collapsed ? "hidden" : ""}`}
          >
            <div className="flex flex-col gap-3">
              <p>
                <b>Create your first playlist</b><br />
                <small>It's easy, we'll help you</small>
              </p>

              <Button className="bg-white text-black font-bold hover:bg-white hover:scale-105 cursor-pointer rounded-full">
                <Link className="w-full" to="/login">Create playlist </Link>
              </Button>
            </div>
            <div className="flex flex-col gap-3">
              <p>
                <b>Let's find some podcasts to follow</b><br />
                <small>We'll keep you updated on new episodes</small>
              </p>
              <Button className="bg-white text-black font-bold hover:bg-white hover:scale-105 cursor-pointer rounded-full">
                Browse podcasts
              </Button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};

export default SidebarCustom;
