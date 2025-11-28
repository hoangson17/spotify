import { getArtist } from "@/stores/actions/artistActions";
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

const AddArtist = () => {
  const dispatch = useDispatch();
  const data = useSelector((state: any) => state.artists.artists || []);
  const artist = useSelector((state: any) => state.artists.artist || {});
  console.log(artist);
  

  useEffect(() => {
    dispatch(getArtist() as any);
  }, [dispatch]);

  return (
    <div className="p-4">
      <div className="w-full mb-3 flex justify-between"><h2 className="text-xl font-semibold">Danh sách Artists</h2><Button>Add album + </Button></div>

      <div className="rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-[900px]">
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="font-semibold">ID</TableHead>
                <TableHead className="font-semibold">Artist</TableHead>
                <TableHead className="font-semibold">Albums</TableHead>
                <TableHead className="font-semibold">Tracks</TableHead>
                <TableHead className="font-semibold text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {data.length > 0 ? (
                data.map((item: any) => (
                  <TableRow key={item.id} className="hover:bg-muted/20">
                    <TableCell>{item.id}</TableCell>

                    {/* artist info */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={`${import.meta.env.VITE_SERVER_API}${item.avatar}`} />
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
                  <TableCell colSpan={6} className="text-center h-24">
                    No artists found.
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

export default AddArtist;
