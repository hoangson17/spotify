import React, { use, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/authService";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";

const Profile = () => {
  const dispatch = useDispatch();
  const [preview, setPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  
  const user = useSelector((state: any) => state.auth.user);
  useEffect(() => {
    if (user && user.avatar) {
      setPreview(user.avatar);
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
    formData.append("name", name || user.name);

    if (password) {
      formData.append("password", password);
    }

    if (avatarFile) {
      formData.append("avatar", avatarFile); // ✔ file thật
    }

    try {
      const res = await authService.updateProfile(user.id, formData);
      toast.success(res.data.message);
    } catch (err: any) {
      toast.error(err.response.data.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <div className="p-8">
        <h2 className="text-3xl font-semibold mb-6 text-gray-300">
          Thông tin cá nhân
        </h2>

        {/* Avatar */}
        <div className="flex items-center gap-6 mb-8">
          <div className="relative group">
            <Avatar className="w-24 h-24 border shadow-md transition-transform group-hover:scale-105">
              <AvatarImage src={preview || "/default-avatar.png"} />
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

          <div className="text-gray-600">
            <p className="text-sm">Ảnh đại diện</p>
            <p className="text-xs opacity-70">Chọn ảnh JPG, PNG (tối đa 3MB)</p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-5">
          <div className="space-y-2">
            <Label className="text-gray-700 font-medium">Họ và tên</Label>
            <Input
              placeholder="Nhập họ tên"
              className="h-11 border-gray-300 focus:ring-2 focus:ring-black"
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700 font-medium">Email</Label>
            <Input
              disabled
              defaultValue={user.email}
              className="h-11 bg-gray-100 border-gray-200 text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700 font-medium">Password</Label>
            <Input
              placeholder="Nhập mật khẩu mới"
              className="h-11 border-gray-300 focus:ring-2 focus:ring-black"
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
