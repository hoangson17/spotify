import { getPlaylist } from "@/stores/actions/playlistActions";
import React, { useEffect } from "react";
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

const AddPlayList = () => {
  const dispatch = useDispatch();
  const data = useSelector((state: any) => state.playlist.playlist || []);

  useEffect(() => {
    dispatch(getPlaylist() as any);
  }, [dispatch]);

  return (
    <div className="p-4">
      {/* header */}
      <div className="w-full mb-3 flex justify-between">
        <h2 className="text-xl font-semibold">Danh sách Playlist</h2>
        <Button>Add Playlist +</Button>
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
                    {/* ID */}
                    <TableCell>{item.id}</TableCell>

                    {/* Cover image */}
                    <TableCell>
                      <Avatar className="h-12 w-12 rounded-md">
                        <AvatarImage
                          src={`${import.meta.env.VITE_SERVER_API}${item.cover_image}`}
                          className="object-cover"
                        />
                        <AvatarFallback>PL</AvatarFallback>
                      </Avatar>
                    </TableCell>

                    {/* Title */}
                    <TableCell className="font-medium">
                      {item.title}
                    </TableCell>

                    {/* Description */}
                    <TableCell>
                      {item.description || "Không có mô tả"}
                    </TableCell>

                    {/* Tracks count */}
                    <TableCell>{item.tracks?.length || 0}</TableCell>

                    {/* Is Public */}
                    <TableCell>
                      {item.is_public === 1 ? "Yes" : "No"}
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => console.log("Update", item.id)}
                        >
                          Update
                        </Button>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => console.log("Delete", item.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24">
                    Không có playlist nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default AddPlayList;
