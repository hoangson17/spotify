import { getAllUsers } from "@/stores/actions/authActions";
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

const User = () => {
  const dispatch = useDispatch();
  const users = useSelector((state: any) => state.auth.allUser || []);
  
  useEffect(() => {
    dispatch(getAllUsers() as any);
  }, [dispatch]);
  
  console.log(users);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN");
  };

  const getAvatar = (avatar: string | null) => {
    if (!avatar) return null;

    // Avatar từ Google (URL đầy đủ)
    if (avatar.startsWith("http")) return avatar;

    // Avatar lưu trong server
    return `${import.meta.env.VITE_SERVER_API}${avatar}`;
  };

  return (
    <div className="p-4">
      <div className="w-full mb-3 flex justify-between">
        <h2 className="text-xl font-semibold">Danh sách Users</h2>
        <Button>Create new user +</Button>
      </div>

      <div className="rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-[1100px]">
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Ngày cập nhật</TableHead>
                <TableHead className="text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {users.length > 0 ? (
                users.map((user: any) => (
                  <TableRow key={user.id} className="hover:bg-muted/20">
                    <TableCell>{user.id}</TableCell>

                    {/* User info */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={`${import.meta.env.VITE_SERVER_API}${user.avatar} ||`} />
                          <AvatarFallback>
                            {user.name?.charAt(0)?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>

                        <span className="font-medium">{user.name}</span>
                      </div>
                    </TableCell>

                    <TableCell>{user.email}</TableCell>

                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-md text-sm ${
                          user.role === "admin"
                            ? "bg-red-200 text-red-700"
                            : "bg-blue-200 text-blue-700"
                        }`}
                      >
                        {user.role}
                      </span>
                    </TableCell>

                    <TableCell>{formatDate(user.created_at)}</TableCell>
                    <TableCell>{formatDate(user.updated_at)}</TableCell>

                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => console.log("Update user:", user.id)}
                        >
                          Update
                        </Button>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => console.log("Delete user:", user.id)}
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
                    No users found.
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

export default User;
