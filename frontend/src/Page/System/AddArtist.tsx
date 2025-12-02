import { getArtist } from "@/stores/actions/artistActions";
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
import { artistService } from "@/services/artistService";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { getTracks } from "@/stores/actions/trackActions";

const AddArtist = () => {
  const dispatch = useDispatch();
  const data = useSelector((state: any) => state.artists.artists || []);
  const tracksData = useSelector((state: any) => state.tracks.tracks || []);

  const [openModal, setOpenModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [bio, setBio] = useState("");

  useEffect(() => {
    dispatch(getArtist() as any);
    dispatch(getTracks() as any);
  }, [dispatch]);

  const handleDelete = async (id: number) => {
    try {
      await artistService.removeArtist(id);
      dispatch(getArtist() as any);
      toast.success("Xoá artist thành công!");
    } catch (error) {
      toast.error("Không thể xoá artist.");
    }
  };

  const handleOpenCreate = () => {
    setIsEdit(false);
    setCurrentId(null);
    setName("");
    setBio("");
    setAvatar(null);
    setOpenModal(true);
  };

  const handleOpenEdit = (artist: any) => {
    setIsEdit(true);
    setCurrentId(artist.id);
    setName(artist.name);
    setBio(artist.bio || "");
    setAvatar(null);
    setOpenModal(true);
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("bio", bio);
      
      if (avatar) formData.append("avatar", avatar);

      if (isEdit && currentId) {
        await artistService.updateArtist(currentId, formData);
        toast.success("Cập nhật artist thành công!");
      } else {
        await artistService.createArtist(formData);
        toast.success("Tạo artist thành công!");
      }

      dispatch(getArtist() as any);
      setOpenModal(false);
    } catch (error) {
      toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  return (
    <div className="p-4">
      {" "}
      <div className="w-full mb-3 flex justify-between">
        {" "}
        <h2 className="text-xl font-semibold">Danh sách Artists</h2>{" "}
        <Button onClick={handleOpenCreate}>Add Artist +</Button>{" "}
      </div>
      <div className="rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-[900px]">
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="font-semibold">ID</TableHead>
                <TableHead className="font-semibold">Artist</TableHead>
                <TableHead className="font-semibold">Albums</TableHead>
                <TableHead className="font-semibold">Tracks</TableHead>
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
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={
                              item.avatar?.startsWith("http")
                                ? item.avatar
                                : `${import.meta.env.VITE_SERVER_API}${item.avatar}`
                            }
                          />
                          <AvatarFallback>
                            {item.name?.charAt(0) || "A"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{item.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{item.albums?.length || 0}</TableCell>
                    <TableCell>{item.tracks?.length || 0}</TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(item)}
                        >
                          Update
                        </Button>
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
                  <TableCell colSpan={6} className="text-center h-24">
                    No artists found.
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
            <DialogTitle>{isEdit ? "Edit Artist" : "Add Artist"}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3 mt-2">
            <Input
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              placeholder="Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatar(e.target.files?.[0] || null)}
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

export default AddArtist;
