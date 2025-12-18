import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/authService";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { setProfile } from "@/stores/actions/authActions";

const AdminProfile = () => {
  const dispatch = useDispatch();

  const [preview, setPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const user = useSelector((state: any) => state.auth.user);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPreview(
        user.avatar?.startsWith("http")
          ? user.avatar
          : `${import.meta.env.VITE_SERVER_API}${user.avatar}`
      );
    }
  }, [user]);

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!user) return;

    const formData = new FormData();
    formData.append("name", name);

    if (password) formData.append("password", password);
    if (avatarFile) formData.append("avatar", avatarFile);

    try {
      const res = await authService.updateProfile(user.id, formData);

      toast.success("Cập nhật thành công!");
      dispatch(setProfile(res.data) as any);

    } catch (err: any) {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const getAvatar = () => {
    if (!preview) return "/default-avatar.png";
    if (preview.startsWith("blob:")) return preview;
    return preview.startsWith("http")
      ? preview
      : `${import.meta.env.VITE_SERVER_API}${preview}`;
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8">
      <h2 className="text-3xl font-semibold mb-6 text-gray-800">
        Thông tin cá nhân
      </h2>

      <div className="flex items-center gap-6 mb-8">
        <div className="relative group">
          <Avatar className="w-24 h-24 border shadow-md">
            <AvatarImage src={getAvatar()} />
            <AvatarFallback>AV</AvatarFallback>
          </Avatar>

          <label
            htmlFor="avatar"
            className="absolute bottom-0 right-0 bg-gray-700 text-white text-xs px-2 py-1 rounded cursor-pointer hover:bg-black"
          >
            Đổi ảnh
          </label>

          <input
            id="avatar"
            type="file"
            accept="image/*"
            onChange={handleAvatar}
            className="hidden"
          />
        </div>

        <div className="text-gray-600">
          <p className="text-sm">Ảnh đại diện</p>
          <p className="text-xs opacity-70">Chọn ảnh JPG, PNG (tối đa 3MB)</p>
        </div>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <Label className="text-gray-800 font-medium">Họ và tên</Label>
          <Input
            value={name}
            placeholder="Nhập họ tên"
            className="h-11 bg-white border-gray-300 text-gray-800"
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-gray-800 font-medium">Email</Label>
          <Input
            disabled
            value={user?.email || ""}
            className="h-11 bg-gray-100 border-gray-300 text-gray-500"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-gray-800 font-medium">Password</Label>
          <Input
            placeholder="Nhập mật khẩu mới"
            type="password"
            className="h-11 bg-white border-gray-300 text-gray-800"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>

      <Button
        className="w-full mt-8 h-11 text-[15px] bg-black text-white hover:bg-gray-800"
        onClick={handleSubmit}
      >
        Lưu thay đổi
      </Button>
    </div>
  );
};

export default AdminProfile;
