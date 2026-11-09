import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { hasPermission } from "@/utils/roles";

export default function AdminHome() {
  const user = useSelector((state: any) => state.auth.user);
  const links = [
    {
      title: "Phân quyền admin",
      path: "permissions",
      permission: "rbac:manage",
      detail: "Chọn quyền truy cập và thao tác cho từng admin thường.",
    },
    {
      title: "Bài hát",
      path: "track",
      permission: "tracks:read",
      detail: "Quản lý danh sách bài hát.",
    },
    {
      title: "Nghệ sĩ",
      path: "artist",
      permission: "artists:read",
      detail: "Quản lý nghệ sĩ và thông tin giới thiệu.",
    },
    {
      title: "Album",
      path: "album",
      permission: "albums:read",
      detail: "Quản lý album nhạc.",
    },
    {
      title: "Playlist",
      path: "playlist",
      permission: "playlists:read",
      detail: "Quản lý playlist.",
    },
    {
      title: "Người dùng",
      path: "user",
      permission: "users:read",
      detail: "Quản lý tài khoản người dùng.",
    },
  ].filter((link) => hasPermission(user, link.permission));
  return (
    <section className="space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold">Trang quản trị</h1>
        <p className="text-muted-foreground mt-2">
          Xin chào {user?.name}. Chọn chức năng bạn muốn quản lý.
        </p>
      </div>
      {links.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {links.map((link) => (
            <Link
              key={link.path}
              to={`/admin/${link.path}`}
              className="rounded-xl border p-6 hover:border-green-500 hover:bg-green-50 transition"
            >
              <h2 className="font-semibold text-lg">{link.title}</h2>
              <p className="text-sm text-muted-foreground mt-2">
                {link.detail}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
          Bạn chưa được cấp quyền quản trị. Hãy liên hệ super admin.
        </div>
      )}
    </section>
  );
}
