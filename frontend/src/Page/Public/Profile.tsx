import { UploadLimitHint } from "@/components/UploadLimitHint";
import { uploadErrorMessage } from "@/utils/upload";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/authService";
import { logout, setProfile } from "@/stores/actions/authActions";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { mediaUrl } from "@/utils/media";

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [preview, setPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const user = useSelector((state: any) => state.auth.user);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPreview(mediaUrl(user.avatar));
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
      if (password) {
        await dispatch(logout() as any);
        navigate("/login", { replace: true });
        toast.success("Đã đổi mật khẩu. Vui lòng đăng nhập lại.");
        return;
      }

      toast.success("Cập nhật thành công!");

      dispatch(setProfile(res.data) as any);
    } catch (err) {
      toast.error(uploadErrorMessage(err, "Có lỗi xảy ra"));
    }
  };

  const getAvatar = () => {
    return mediaUrl(preview);
  };

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <div className="p-8">
        <h2 className="text-3xl font-semibold mb-6 text-gray-300">
          Thông tin cá nhân
        </h2>

        <div className="flex items-center gap-6 mb-8">
          <div className="relative group">
            <Avatar className="w-24 h-24 border shadow-md transition-transform group-hover:scale-105">
              <AvatarImage src={getAvatar()} />
              <AvatarFallback>AV</AvatarFallback>
            </Avatar>

            <label
              htmlFor="avatar"
              className="absolute bottom-0 right-0 bg-black text-white text-xs px-2 py-1 rounded cursor-pointer opacity-80 hover:opacity-100"
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

          <div className="text-gray-400">
            <p className="text-sm">Ảnh đại diện</p>
            <UploadLimitHint kind="image" />
          </div>
        </div>

        {/* Form */}
        <div className="space-y-5">
          <div className="space-y-2">
            <Label className="text-gray-300 font-medium">Họ và tên</Label>
            <Input
              value={name}
              placeholder="Nhập họ tên"
              className="h-11 border-gray-700 bg-neutral-900 text-white"
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300 font-medium">Email</Label>
            <Input
              disabled
              value={user?.email || ""}
              className="h-11 bg-gray-900 border-gray-800 text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300 font-medium">Password</Label>
            <Input
              placeholder="Nhập mật khẩu mới"
              type="password"
              className="h-11 border-gray-700 bg-neutral-900 text-white"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <Button
          className="w-full mt-8 h-11 text-[15px] bg-black hover:bg-neutral-800"
          onClick={handleSubmit}
        >
          Lưu thay đổi
        </Button>
      </div>
    </div>
  );
};

export default Profile;
