import { getAllUsers } from "@/stores/actions/authActions";
import { canManageAccount } from "@/utils/roles";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { authService } from "@/services/authService";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { useState } from "react";
import { mediaUrl } from "@/utils/media";
import PaginationControls from "@/components/PaginationControls";

const User = () => {
  const dispatch = useDispatch();
  const users = useSelector((state: any) => state.auth.allUser || []);
  const meta = useSelector((state: any) => state.auth.allUserMeta);
  const actor = useSelector((state: any) => state.auth.user);
  const [openDialog, setOpenDialog] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [role, setRole] = useState("user");
  const [profile, setProfile] = useState({ name: "", email: "", password: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(getAllUsers(page, 20) as any);
  }, [dispatch, page]);

  console.log(users);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN");
  };

  const handleOpenUpdate = (user: any) => {
    setSelectedUser(user);
    setRole(user.role);
    setProfile({ name: user.name, email: user.email, password: "" });
    setOpenDialog(true);
  };

  const getAvatar = (avatar: string | null) => {
    return mediaUrl(avatar);
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await authService.deleteUser(id);
      dispatch(getAllUsers(page, 20) as any);
      toast.success("Xóa user thành công");
    } catch (err) {
      toast.error("Xóa user thất bại");
    }
  };

  const handleUpdateRole = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", profile.name);
      formData.append("email", profile.email);
      if (profile.password) formData.append("password", profile.password);
      if (actor?.role === "super_admin" && role !== selectedUser.role)
        formData.append("role", role);

      await authService.updateProfile(selectedUser.id, formData);

      toast.success("Cập nhật tài khoản thành công!");
      setOpenDialog(false);
      dispatch(getAllUsers(page, 20) as any);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Cập nhật tài khoản thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4">
      <div className="w-full mb-3 flex justify-between">
        <h2 className="text-xl font-semibold">Danh sách Users</h2>
        <Link to={"/admin/lock-user"}>
          <Button>Tài khoản đã khóa</Button>
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
              {users.length > 0 ? (
                users.map((user: any) => (
                  <TableRow key={user.id} className="hover:bg-muted/20">
                    <TableCell>{user.id}</TableCell>

                    {/* User info */}
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
                          user.role === "super_admin"
                            ? "bg-purple-200 text-purple-700"
                            : user.role === "admin"
                              ? "bg-red-200 text-red-700"
                              : "bg-blue-200 text-blue-700"
                        }`}
                      >
                        {user.role === "super_admin"
                          ? "Super Admin"
                          : user.role}
                      </span>
                    </TableCell>

                    <TableCell>{formatDate(user.created_at)}</TableCell>
                    <TableCell>{formatDate(user.updated_at)}</TableCell>

                    <TableCell>
                      <div className="flex justify-center gap-2">
                        {canManageAccount(actor, user, "update") && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenUpdate(user)}
                          >
                            Chỉnh sửa
                          </Button>
                        )}

                        {actor?.role === "super_admin" &&
                          user.role === "admin" && (
                            <Button asChild variant="outline" size="sm">
                              <Link to={`/admin/permissions?admin=${user.id}`}>
                                RBAC
                              </Link>
                            </Button>
                          )}
                        {canManageAccount(actor, user) && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            Khóa
                          </Button>
                        )}
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
      <PaginationControls meta={meta} onPageChange={setPage} />
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cập nhật tài khoản</DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4 mt-2">
              <div>
                <label
                  className="text-sm mb-1 block"
                  htmlFor="managed-user-name"
                >
                  Họ tên
                </label>
                <Input
                  id="managed-user-name"
                  value={profile.name}
                  onChange={(event) =>
                    setProfile((previous) => ({
                      ...previous,
                      name: event.target.value,
                    }))
                  }
                  disabled={saving}
                />
              </div>
              <div>
                <label
                  className="text-sm mb-1 block"
                  htmlFor="managed-user-email"
                >
                  Email
                </label>
                <Input
                  id="managed-user-email"
                  type="email"
                  value={profile.email}
                  onChange={(event) =>
                    setProfile((previous) => ({
                      ...previous,
                      email: event.target.value,
                    }))
                  }
                  disabled={saving}
                />
              </div>
              <div>
                <label
                  className="text-sm mb-1 block"
                  htmlFor="managed-user-password"
                >
                  Mật khẩu mới (tùy chọn)
                </label>
                <Input
                  id="managed-user-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Để trống để giữ nguyên"
                  value={profile.password}
                  onChange={(event) =>
                    setProfile((previous) => ({
                      ...previous,
                      password: event.target.value,
                    }))
                  }
                  disabled={saving}
                />
              </div>
              {actor?.role === "super_admin" && (
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">
                    Quyền
                  </label>

                  <select
                    className="w-full border rounded-md px-3 py-2"
                    value={role}
                    disabled={saving}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Hủy
            </Button>

            <Button disabled={saving} onClick={handleUpdateRole}>
              {saving ? "Đang lưu…" : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default User;
