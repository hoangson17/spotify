import { getPlaylist } from "@/stores/actions/playlistActions";
import { getTracks } from "@/stores/actions/trackActions";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { playlistService } from "@/services/playlistService";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const AddPlayList = () => {
  const dispatch = useDispatch();
  const data = useSelector((state: any) => state.playlist.playlist || []);
  const tracksData = useSelector((state: any) => state.tracks.tracks || []);
  const user = useSelector((state: any) => state.auth.user);

  const [openModal, setOpenModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [selectedTracks, setSelectedTracks] = useState<number[]>([]);

  useEffect(() => {
    dispatch(getPlaylist() as any);
    dispatch(getTracks() as any);
  }, [dispatch]);

  const handleOpenCreate = () => {
    setIsEdit(false);
    setCurrentId(null);
    setTitle("");
    setDescription("");
    setCoverImage(null);
    setSelectedTracks([]);
    setOpenModal(true);
  };

  const handleOpenEdit = (item: any) => {
    setIsEdit(true);
    setCurrentId(item.id);
    setTitle(item.title);
    setDescription(item.description || "");
    setCoverImage(null);
    setSelectedTracks(item.tracks?.map((t: any) => t.id) || []);
    setOpenModal(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await playlistService.deletePlaylist(id);
      dispatch(getPlaylist() as any);
      toast.success("Xóa thành công");
    } catch (error) {
      toast.error("Xóa thất bại");
    }
  };

  const handleTrackToggle = (trackId: number) => {
    setSelectedTracks((prev) =>
      prev.includes(trackId)
        ? prev.filter((id) => id !== trackId)
        : [...prev, trackId]
    );
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      if (isEdit) {
        formData.append("users", user.id);
      } else {
        formData.append("user_id", user.id);
      }

      if (coverImage) formData.append("cover_image", coverImage);

      if (isEdit && currentId) {
        await playlistService.updatePlaylist(currentId, formData);
        await playlistService.syncTrack(user.id, currentId, selectedTracks);
        toast.success("Cập nhật playlist thành công");
      } else {
        const response = await playlistService.createPlaylist(formData);
        console.log("API RESPONSE:", response);

        const playlistId =
          response.data?.data?.id ||
          response.data?.id ||
          response.data?.playlistId;

        if (!playlistId) {
          console.error("Không có playlistId trong API:", response.data);
          toast.error("Không lấy được playlistId từ API");
          return;
        }

        await new Promise((r) => setTimeout(r, 500));

        if (selectedTracks.length > 0) {
          await playlistService.addTrack(user.id, playlistId, selectedTracks);
        }

        toast.success("Tạo playlist thành công");
      }

      dispatch(getPlaylist() as any);

      setOpenModal(false);
    } catch (error) {
      console.log(error);
      toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  return (
    <div className="p-4">
      {" "}
      <div className="w-full mb-3 flex justify-between">
        {" "}
        <h2 className="text-xl font-semibold">Danh sách Playlist</h2>{" "}
        <Button onClick={handleOpenCreate}>Add Playlist +</Button>{" "}
      </div>
      <div className="rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-y-auto">
          <Table className="w-full min-w-[900px]">
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="font-semibold">ID</TableHead>
                <TableHead className="font-semibold">Ảnh</TableHead>
                <TableHead className="font-semibold">Tiêu đề</TableHead>
                <TableHead className="font-semibold">Mô tả</TableHead>
                <TableHead className="font-semibold">User</TableHead>
                <TableHead className="font-semibold">Tracks</TableHead>
                <TableHead className="font-semibold">Public</TableHead>
                <TableHead className="font-semibold text-center">
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {data.length > 0 ? (
                data.map((item: any) => (
                  <TableRow key={item.id} className="hover:bg-muted/20">
                    <TableCell>{item.id}</TableCell>
                    <TableCell>
                      <Avatar className="h-12 w-12 rounded-md">
                        <AvatarImage
                          src={
                            item.cover_image
                              ? item.cover_image.startsWith("http")
                                ? item.cover_image
                                : `${import.meta.env.VITE_SERVER_API}${
                                    item.cover_image
                                  }`
                              : "/default-image.jpg"
                          }
                          className="object-cover"
                        />
                        <AvatarFallback>PL</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>
                      {item.description || "Không có mô tả"}
                    </TableCell>
                    <TableCell>{item?.users?.name || "Không có"}</TableCell>
                    <TableCell>{item.tracks?.length || 0}</TableCell>
                    <TableCell>{item.is_public === 1 ? "Yes" : "No"}</TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        {item?.users.id === user?.id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEdit(item)}
                          >
                            Update
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center h-24">
                    Không có playlist nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      {/* Dialog */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Edit Playlist" : "Add Playlist"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3 mt-2">
            <Input
              placeholder="Tiêu đề"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Input
              placeholder="Mô tả"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
            />

            <div className="flex flex-col max-h-60 overflow-y-auto border p-2 rounded">
              <span className="font-medium mb-1">Chọn tracks:</span>
              {tracksData.map((track: any) => (
                <label key={track.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedTracks.includes(track.id)}
                    onChange={() => handleTrackToggle(track.id)}
                  />
                  {track.title}
                </label>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {isEdit ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddPlayList;
