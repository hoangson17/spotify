import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAlbums } from "@/stores/actions/albumActions";

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

const AddAlbum = () => {
  const dispatch = useDispatch();
  const data = useSelector((state: any) => state.albums.albums || []);

  useEffect(() => {
    dispatch(getAlbums() as any);
  }, [dispatch]);

  return (
    <div className="p-4">
      {/* Header */}
      <div className="w-full mb-3 flex justify-between">
        <h2 className="text-xl font-semibold">Danh sách Album</h2>
        <Button>Add album +</Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-[1000px]">
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="font-semibold">ID</TableHead>
                <TableHead className="font-semibold">Cover</TableHead>
                <TableHead className="font-semibold">Title</TableHead>
                <TableHead className="font-semibold">Artist</TableHead>
                <TableHead className="font-semibold">Tracks</TableHead>
                <TableHead className="font-semibold">Created</TableHead>
                <TableHead className="font-semibold text-center">
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {data.length > 0 ? (
                data.map((item: any) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    {/* ID */}
                    <TableCell>{item.id}</TableCell>

                    {/* Cover image */}
                    <TableCell>
                      <Avatar className="h-12 w-12 rounded-md">
                        <AvatarImage
                          src={`${import.meta.env.VITE_SERVER_API}${item.cover_image}`}
                          className="object-cover"
                        />
                        <AvatarFallback>AL</AvatarFallback>
                      </Avatar>
                    </TableCell>

                    {/* Album Title */}
                    <TableCell className="font-medium">
                      {item.title}
                    </TableCell>

                    {/* Artist info */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage
                            src={item.artist?.avatar}
                            className="object-cover"
                          />
                          <AvatarFallback>
                            {item.artist?.name?.charAt(0) || "A"}
                          </AvatarFallback>
                        </Avatar>
                        <span>{item.artist?.name || "Unknown"}</span>
                      </div>
                    </TableCell>

                    {/* Tracks count */}
                    <TableCell>{item.tracks?.length || 0}</TableCell>

                    {/* Created Date */}
                    <TableCell>
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString("vi-VN")
                        : "N/A"}
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
                  <TableCell
                    colSpan={7}
                    className="text-center h-24 text-muted-foreground"
                  >
                    No albums found.
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

export default AddAlbum;
