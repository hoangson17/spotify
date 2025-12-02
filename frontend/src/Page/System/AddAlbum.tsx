import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAlbums } from "@/stores/actions/albumActions";

import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { albumService } from "@/services/albumService";
import { toast } from "sonner";
import { getArtist } from "@/stores/actions/artistActions";

const AddAlbum = () => {
  const dispatch = useDispatch();
  const data = useSelector((state: any) => state.albums.albums || []);
  const dataArtists = useSelector((state: any) => state.artists.artists || []);

  const [openModal, setOpenModal] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [isEdit, setIsEdit] = useState(false);

  const [artistId, setArtistId] = useState("");
  const [title, setTitle] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);


  const handleOpenCreate = () => {
    setIsEdit(false);
    setArtistId("");
    setTitle("");
    setCoverImage(null);
    setOpenModal(true);
  };


  const handleOpenEdit = (item: any) => {
    setIsEdit(true);
    setCurrentId(item.id);
    setArtistId(item.artist?.id || "");
    setTitle(item.title);
    setCoverImage(null);
    setOpenModal(true);
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("artist", artistId);

      if (coverImage) {
        formData.append("cover_image", coverImage);
      }

      if (isEdit && currentId) {
        await albumService.updateAlbum(currentId, formData);
        toast.success("Cập nhật album thành công!");
      } else {
        await albumService.createAlbum(formData);
        toast.success("Tạo album thành công!");
      }

      dispatch(getAlbums() as any);
      setOpenModal(false);

    } catch (error) {
      toast.error("Đã xảy ra lỗi. Vui lòng thử lại.");
    }
  }

  useEffect(() => {
    dispatch(getAlbums() as any);
    dispatch(getArtist() as any);
  }, [dispatch]);

  
  const handleDelete = async (id: number) => {
    try {
      await albumService.removeAlbum(id);
      dispatch(getAlbums() as any);
      toast.success("Xoá album thành công!");
    } catch (error) {
      toast.error("Không thể xoá album.");
    }
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="w-full mb-3 flex justify-between">
        <h2 className="text-xl font-semibold">Danh sách Album</h2>
        <Button onClick={handleOpenCreate}>Add album +</Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-[1000px]">
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>ID</TableHead>
                <TableHead>Cover</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Artist</TableHead>
                <TableHead>Tracks</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {data.length > 0 ? (
                data.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.id}</TableCell>

                    <TableCell>
                      <Avatar className="h-12 w-12 rounded-md">
                        <AvatarImage
                          src={item.cover_image.startsWith("http")
                            ? item.cover_image
                            : `${import.meta.env.VITE_SERVER_API}${item.cover_image}`}
                        />
                        <AvatarFallback>AL</AvatarFallback>
                      </Avatar>
                    </TableCell>

                    <TableCell className="font-medium">{item.title}</TableCell>

                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={item.artist?.avatar} />
                          <AvatarFallback>
                            {item.artist?.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {item.artist?.name}
                      </div>
                    </TableCell>

                    <TableCell>{item.tracks?.length || 0}</TableCell>

                    <TableCell>
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString("vi-VN")
                        : "N/A"}
                    </TableCell>

                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleOpenEdit(item)}>
                          Update
                        </Button>

                        <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24">
                    No albums found.
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
            <DialogTitle>{isEdit ? "Update Album" : "Create Album"}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3 mt-2">
            <Input
              placeholder="Album title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <select
              className="border rounded-md p-2"
              value={artistId}
              onChange={(e) => setArtistId(e.target.value)}
            >
              <option value="">Select Artist</option>
              {dataArtists.map((artist: any) => (
                <option key={artist.id} value={artist.id}>
                  {artist.name}
                </option>
              ))}
            </select>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
            />
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

export default AddAlbum;
