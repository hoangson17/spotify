import { getTracks } from "@/stores/actions/trackActions";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { trackService } from "@/services/trackService";
import { toast } from "sonner";

import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { getAlbums } from "@/stores/actions/albumActions";
import { getArtist } from "@/stores/actions/artistActions";
import { artistService } from "@/services/artistService";

const AddTrack = () => {
  const data = useSelector((state: any) => state.tracks.tracks || []);
  const artists = useSelector((state: any) => state.artists.artists || []);
  const albums = useSelector((state: any) => state.albums.albums || []);
  // console.log(artists,albums);
  
  const dispatch = useDispatch();

  const [openModal, setOpenModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);

  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [albumId, setAlbumId] = useState("");
  const [artistId, setArtistId] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const [imagePreview, setImagePreview] = useState("");
  const [audioPreview, setAudioPreview] = useState("");

  useEffect(() => {
    dispatch(getTracks() as any);
    dispatch(getAlbums() as any);
    dispatch(getArtist() as any);
  }, [dispatch]);

  const resetForm = () => {
    setTitle("");
    setDuration("");
    setAlbumId("");
    setArtistId("");

    setImageFile(null);
    setAudioFile(null);

    setImagePreview("");
    setAudioPreview("");

    setCurrentId(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsEdit(false);
    setOpenModal(true);
  };

  const openEditModal = (item: any) => {
    setIsEdit(true);
    setCurrentId(item.id);

    setTitle(item.title);
    setDuration(item.duration);
    setAlbumId(item.album?.id || "");
    setArtistId(item.artists?.[0]?.id || "");

    setImagePreview(import.meta.env.VITE_SERVER_API + item.image_url);
    setAudioPreview(import.meta.env.VITE_SERVER_API + item.audio_url);

    setOpenModal(true);
  };

  const buildFormData = () => {
    const fd = new FormData();
    fd.append("title", title);
    fd.append("duration", duration);
    fd.append("album", albumId);
    if (imageFile) fd.append("image", imageFile);
    if (audioFile) fd.append("audio", audioFile);

    return fd;
  };

const handleAdd = async () => {
  try {
    const fd = buildFormData();
    const res = await trackService.createTrack(fd);
    console.log(res);
    
    const newTrackId =
      res.data?.track?.id ||
      res.data?.data?.id ||
      res.data?.id;

    console.log(newTrackId);
    

    if (!newTrackId) {
      console.log("CREATE TRACK RESPONSE:", res.data);
      toast.error("Backend không trả về trackId!");
      return;
    }

    // Đợi 200–300ms để backend commit xong (bắt buộc với file upload)
    await new Promise(resolve => setTimeout(resolve, 300));

    await artistService.createTrack({
      trackId: newTrackId,
      artistId,
    });

    toast.success("Thêm track thành công!");
    dispatch(getTracks() as any);
    setOpenModal(false);

  } catch (err) {
    toast.error("Thêm thất bại!");
  }
};



  const handleUpdate = async () => {
    if (!currentId) return;

    try {
      const fd = buildFormData();
      await trackService.updateTrack(currentId, fd);
       await artistService.createTrack({
        trackId: currentId,
        artistId,
      });
      toast.success("Cập nhật thành công!");
      dispatch(getTracks() as any);
      setOpenModal(false);

    } catch (err) {
      toast.error("Cập nhật thất bại!");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await trackService.deleteTrack(id);
      toast.success("Xóa thành công");
      dispatch(getTracks() as any);
    } catch {
      toast.error("Xóa thất bại!");
    }
  };

  return (
    <div className="p-4">

      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold">Danh sách Tracks</h2>
        <Button onClick={openAddModal}>+ Add Track</Button>
      </div>

      <div className="rounded-xl border shadow-sm overflow-x-auto">
        <Table className="min-w-[900px]">
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Ảnh</TableHead>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Album</TableHead>
              <TableHead>Artist</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Audio</TableHead>
              <TableHead className="text-center">Thao tác</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.length ? (
              data.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>

                  <TableCell>
                    <Avatar className="h-12 w-12 rounded-md">
                      <AvatarImage src={item.image_url.startsWith("http") ? item.image_url : `${import.meta.env.VITE_SERVER_API}${item.image_url}`} />
                      <AvatarFallback>TR</AvatarFallback>
                    </Avatar>
                  </TableCell>

                  <TableCell>{item.title}</TableCell>
                  <TableCell>{item.album?.title || "—"}</TableCell>
                  <TableCell>
                    {item.artists?.map((a: any) => a.name).join(", ") || "—"}
                  </TableCell>
                  <TableCell>{item.duration}s</TableCell>

                  <TableCell>
                    <audio
                      controls
                      className="w-32"
                      src={import.meta.env.VITE_SERVER_API + item.audio_url}
                    />
                  </TableCell>

                  <TableCell>
                    <div className="flex justify-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEditModal(item)}>
                        Update
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                        Delete
                      </Button>
                    </div>
                  </TableCell>

                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center h-24">
                  Không có track nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Cập nhật Track" : "Thêm Track mới"}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">

            <Input placeholder="Tiêu đề..." value={title} onChange={(e) => setTitle(e.target.value)} />

            <Input placeholder="Duration (giây)..." value={duration} onChange={(e) => setDuration(e.target.value)} />

            {/* Image */}
            <div>
              <label className="text-sm font-medium">Ảnh bìa</label>
              <Input type="file" accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setImageFile(file);
                  if (file) setImagePreview(URL.createObjectURL(file));
                }}
              />
              {imagePreview && <img src={imagePreview} className="mt-2 h-28 rounded-md object-cover" />}
            </div>

            {/* Audio */}
            <div>
              <label className="text-sm font-medium">File MP3</label>
              <Input type="file" accept="audio/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setAudioFile(file);
                  if (file) setAudioPreview(URL.createObjectURL(file));
                }}
              />
              {audioPreview && <audio controls className="mt-2 w-full" src={audioPreview} />}
            </div>

            {/* Album */}
            <div>
              <label className="text-sm font-medium">Album</label>
              <select
                value={albumId}
                onChange={(e) => setAlbumId(e.target.value)}
                className="w-full border rounded-md p-2 mt-1"
              >
                <option value="">-- Chọn Album --</option>
                {albums.map((a: any) => (
                  <option key={a.id} value={a.id}>{a.title}</option>
                ))}
              </select>
            </div>

            {/* Artist */}
            <div>
              <label className="text-sm font-medium">Artist</label>
              <select
                value={artistId}
                onChange={(e) => setArtistId(e.target.value)}
                className="w-full border rounded-md p-2 mt-1"
              >
                <option value="">-- Chọn Artist --</option>
                {artists.map((a: any) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>

          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenModal(false)}>Hủy</Button>
            <Button onClick={isEdit ? handleUpdate : handleAdd}>
              {isEdit ? "Cập nhật" : "Thêm mới"}
            </Button>
          </DialogFooter>

        </DialogContent>
      </Dialog>

    </div>
  );
};

export default AddTrack;
