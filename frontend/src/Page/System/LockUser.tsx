import { getLockedUsers } from "@/stores/actions/authActions";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authService } from "@/services/authService";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const LockUser = () => {
  const dispatch = useDispatch();
  const users = useSelector((state: any) => state.auth.lockUser || []);

  useEffect(() => {
    dispatch(getLockedUsers() as any);
  }, [dispatch]);

  const formatDate = (dateStr: string) =>
    dateStr ? new Date(dateStr).toLocaleDateString("vi-VN") : "";

  const getAvatar = (avatar: string | null) =>
    avatar
      ? avatar.startsWith("http")
        ? avatar
        : `${import.meta.env.VITE_SERVER_API}${avatar}`
      : null;

  const handleRestore = async (user: any) => {
    try {
      await authService.restoreUser(user.id);
      dispatch(getLockedUsers() as any);
      toast.success("Khôi phục user thành công");
    } catch {
      toast.error("Khôi phục user thất bại");
    }
  };

  const handleDeleteUser = async (id: number) => {
    try {
      await authService.hardDeleteUser(id);
      dispatch(getLockedUsers() as any);
      toast.success("Xóa user thành công");
    } catch {
      toast.error("Xóa user thất bại");
    }
  };

  return (
    <div className="p-4">
      <div className="w-full mb-3 flex justify-between">
        <h2 className="text-xl font-semibold">Tài khoản đã khóa</h2>
        <Link to={"/admin/user"}>
          <Button>Quay lại danh sách</Button>
        </Link>
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
              {users.length ? (
                users.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>

                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={getAvatar(user.avatar) || ""} />
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
                          onClick={() => handleRestore(user)}
                        >
                          Khôi phục
                        </Button>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          Xóa vĩnh viễn
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24">
                    Không có tài khoản bị khóa.
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

export default LockUser;
