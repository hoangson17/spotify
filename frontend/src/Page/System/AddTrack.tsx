import { getTracks } from "@/stores/actions/trackActions";
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

const formatDuration = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s < 10 ? "0" + s : s}`;
};

const AddTrack = () => {
  const data = useSelector((state: any) => state.tracks.tracks || []);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getTracks() as any);
  }, [dispatch]);

  return (
    <div className="p-4">
      {/* Header */}
      <div className="w-full mb-3 flex justify-between">
        <h2 className="text-xl font-semibold">Danh sách Tracks</h2>
        <Button>Add Track +</Button>
      </div>

      {/* TABLE WRAPPER FIXED */}
      <div className="rounded-xl border shadow-sm">
        <div className="overflow-x-auto">
          <Table className="w-full min-w-[1000px]">
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="font-semibold">ID</TableHead>
                <TableHead className="font-semibold">Ảnh</TableHead>
                <TableHead className="font-semibold">Tiêu đề</TableHead>
                <TableHead className="font-semibold">Album</TableHead>
                <TableHead className="font-semibold">Artists</TableHead>
                <TableHead className="font-semibold">Duration</TableHead>
                <TableHead className="font-semibold">Audio</TableHead>
                <TableHead className="font-semibold text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {data.length > 0 ? (
                data.map((item: any) => (
                  <TableRow key={item.id} className="hover:bg-muted/20">
                    {/* ID */}
                    <TableCell>{item.id}</TableCell>

                    {/* Image */}
                    <TableCell>
                      <Avatar className="h-12 w-12 rounded-md">
                        <AvatarImage
                          src={`${import.meta.env.VITE_SERVER_API}${item.image_url}`}
                          className="object-cover"
                        />
                        <AvatarFallback>TR</AvatarFallback>
                      </Avatar>
                    </TableCell>

                    {/* Title */}
                    <TableCell className="font-medium">{item.title}</TableCell>

                    {/* Album */}
                    <TableCell>{item.album?.title || "—"}</TableCell>

                    {/* Artists */}
                    <TableCell>
                      {item.artists?.length
                        ? item.artists.map((a: any) => a.name).join(", ")
                        : "—"}
                    </TableCell>

                    {/* Duration */}
                    <TableCell>{formatDuration(item.duration)}</TableCell>

                    {/* Audio */}
                    <TableCell>
                      <audio
                        controls
                        className="w-32"
                        src={`${import.meta.env.VITE_SERVER_API}${item.audio_url}`}
                      />
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
                  <TableCell colSpan={8} className="text-center h-24">
                    Không có track nào.
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

export default AddTrack;
