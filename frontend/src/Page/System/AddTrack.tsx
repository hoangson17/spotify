import { UploadLimitHint } from "@/components/UploadLimitHint";
import { uploadErrorMessage } from "@/utils/upload";
import { Can } from "@/components/Can";
import { trackService } from "@/services/trackService";
import { getTracks } from "@/stores/actions/trackActions";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { mediaUrl } from "@/utils/media";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { getAlbums } from "@/stores/actions/albumActions";
import { getArtist } from "@/stores/actions/artistActions";
import PaginationControls from "@/components/PaginationControls";
import { categoryService } from "@/services/categoryService";

const AddTrack = () => {
  const data = useSelector((state: any) => state.tracks.tracks || []);
  const meta = useSelector((state: any) => state.tracks.meta);
  const artists = useSelector((state: any) => state.artists.artists || []);
  const albums = useSelector((state: any) => state.albums.albums || []);
  const [categories, setCategories] = useState<any[]>([]);
  // console.log(artists,albums);

  const dispatch = useDispatch();

  const [openModal, setOpenModal] = useState(false);
  const [page, setPage] = useState(1);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [albumId, setAlbumId] = useState("");
  const [artistId, setArtistId] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const [imagePreview, setImagePreview] = useState("");
  const [audioPreview, setAudioPreview] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    dispatch(getTracks(page, 20) as any);
    dispatch(getAlbums(1, 100) as any);
    dispatch(getArtist(1, 100) as any);
    categoryService
      .getAll({ page: 1, limit: 100 })
      .then(({ data }) => setCategories(data.items ?? []))
      .catch(() => toast.error("Không tải được danh sách thể loại."));
  }, [dispatch, page]);

  const resetForm = () => {
    setTitle("");
    setDuration("");
    setAlbumId("");
    setArtistId("");
    setCategoryId("");

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
    setCategoryId(item.category?.id || "");

    setImagePreview(mediaUrl(item.image_url));
    setAudioPreview(mediaUrl(item.audio_url));

    setOpenModal(true);
  };

  const buildFormData = () => {
    const fd = new FormData();
    fd.append("title", title);
    fd.append("duration", duration);
    fd.append("album", albumId);
    fd.append("artistId", artistId);
    fd.append("category", categoryId);
    if (imageFile) fd.append("image", imageFile);
    if (audioFile) fd.append("audio", audioFile);

    return fd;
  };

  const handleAdd = async () => {
    if (isSaving) return;
    if (!audioFile) {
      toast.error("Vui lòng chọn file MP3.");
      return;
    }
    if (!Number.isFinite(Number(duration)) || Number(duration) <= 0) {
      toast.error("Chưa đọc được thời lượng file nhạc. Vui lòng chọn lại file.");
      return;
    }
    setIsSaving(true);
    setUploadProgress(0);
    try {
      const fd = buildFormData();
      const res = await trackService.createTrack(fd, (event) => {
        if (event.total) {
          setUploadProgress(Math.round((event.loaded * 100) / event.total));
        }
      });

      const newTrackId =
        res.data?.track?.id || res.data?.data?.id || res.data?.id;

      if (!newTrackId) {
        toast.error("Backend không trả về trackId!");
        return;
      }

      toast.success("Thêm track thành công!");
      dispatch(getTracks(page, 20) as any);
      setOpenModal(false);
    } catch (err) {
      toast.error(uploadErrorMessage(err, "Thêm thất bại!"));
    } finally {
      setIsSaving(false);
      setUploadProgress(0);
    }
  };

  const handleUpdate = async () => {
    if (!currentId || isSaving) return;

    setIsSaving(true);
    setUploadProgress(0);
    try {
      const fd = buildFormData();
      await trackService.updateTrack(currentId, fd, (event) => {
        if (event.total) {
          setUploadProgress(Math.round((event.loaded * 100) / event.total));
        }
      });
      toast.success("Cập nhật thành công!");
      dispatch(getTracks(page, 20) as any);
      setOpenModal(false);
    } catch (err) {
      toast.error(uploadErrorMessage(err, "Cập nhật thất bại!"));
    } finally {
      setIsSaving(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await trackService.deleteTrack(id);
      toast.success("Xóa thành công");
      dispatch(getTracks(page, 20) as any);
    } catch (error) {
      toast.error(uploadErrorMessage(error, "Xóa thất bại!"));
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold">Danh sách Tracks</h2>
        <Can permission="tracks:create">
          <Button onClick={openAddModal}>+ Add Track</Button>
        </Can>
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
              <TableHead>Category</TableHead>
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
                      <AvatarImage src={mediaUrl(item.image_url)} />
                      <AvatarFallback>TR</AvatarFallback>
                    </Avatar>
                  </TableCell>

                  <TableCell>{item.title}</TableCell>
                  <TableCell>{item.album?.title || "—"}</TableCell>
                  <TableCell>
                    {item.artists?.map((a: any) => a.name).join(", ") || "—"}
                  </TableCell>
                  <TableCell>{item.category?.name || "—"}</TableCell>
                  <TableCell>{item.duration}s</TableCell>

                  <TableCell>
                    <audio
                      controls
                      className="w-32"
                      src={mediaUrl(item.audio_url)}
                    />
                  </TableCell>

                  <TableCell>
                    <div className="flex justify-center gap-2">
                      <Can permission="tracks:update">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditModal(item)}
                        >
                          Update
                        </Button>
                      </Can>
                      <Can permission="tracks:delete">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(item.id)}
                        >
                          Delete
                        </Button>
                      </Can>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center h-24">
                  Không có track nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <PaginationControls meta={meta} onPageChange={setPage} />

      {/* Modal */}
      <Dialog
        open={openModal}
        onOpenChange={(open) => !isSaving && setOpenModal(open)}
      >
        <DialogContent className="max-h-[calc(100dvh-2rem)] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Cập nhật Track" : "Thêm Track mới"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex min-h-0 flex-col gap-4 overflow-y-auto py-2 pr-1">
            <Input
              placeholder="Tiêu đề..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <Input
              placeholder="Duration (tự động đọc từ file)..."
              value={duration}
              readOnly
            />

            {/* Image */}
            <div>
              <label className="text-sm font-medium">Ảnh bìa</label>
              <Input
                type="file"
                accept="image/*"
                disabled={isSaving}
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setImageFile(file);
                  if (file) setImagePreview(URL.createObjectURL(file));
                }}
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  className="mt-2 h-28 rounded-md object-cover"
                />
              )}
            </div>

            {/* Audio */}
            <div>
              <label className="text-sm font-medium">File MP3</label>
              <UploadLimitHint kind="audio" />
              <Input
                type="file"
                accept="audio/mpeg,.mp3"
                disabled={isSaving}
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setAudioFile(file);
                  if (file) {
                    setDuration("");
                    setAudioPreview(URL.createObjectURL(file));
                    setTitle((currentTitle) => {
                      if (currentTitle.trim()) return currentTitle;
                      return file.name
                        .replace(/\.[^.]+$/, "")
                        .replace(/[_-]+/g, " ")
                        .replace(/\s+/g, " ")
                        .trim();
                    });
                  }
                }}
              />
              {audioPreview && (
                <audio
                  controls
                  className="mt-2 w-full"
                  src={audioPreview}
                  onLoadedMetadata={(event) => {
                    const seconds = event.currentTarget.duration;
                    if (Number.isFinite(seconds) && seconds > 0) {
                      setDuration(String(Math.ceil(seconds)));
                    } else {
                      setDuration("");
                      toast.error("Không đọc được thời lượng file nhạc.");
                    }
                  }}
                />
              )}
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
                  <option key={a.id} value={a.id}>
                    {a.title}
                  </option>
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
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full border rounded-md p-2 mt-1"
              >
                <option value="">-- Chọn Category --</option>
                {categories.map((category: any) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              disabled={isSaving}
              onClick={() => setOpenModal(false)}
            >
              Hủy
            </Button>
            <Can permission={isEdit ? "tracks:update" : "tracks:create"}>
              <Button
                disabled={isSaving || !title.trim()}
                onClick={isEdit ? handleUpdate : handleAdd}
              >
                {isSaving
                  ? uploadProgress > 0 && uploadProgress < 100
                    ? `Đang tải ${uploadProgress}%`
                    : "Đang xử lý..."
                  : isEdit
                    ? "Cập nhật"
                    : "Thêm mới"}
              </Button>
            </Can>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddTrack;
