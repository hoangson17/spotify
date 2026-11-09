import type { ReactNode } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { hasPermission } from "@/utils/roles";

export default function PermissionGate({
  permission,
  children,
}: {
  permission: string;
  children: ReactNode;
}) {
  const user = useSelector((state: any) => state.auth.user);
  if (hasPermission(user, permission)) return <>{children}</>;
  return (
    <section className="rounded-xl border p-8 text-center space-y-3">
      <h1 className="text-xl font-semibold">
        Bạn chưa được cấp quyền truy cập
      </h1>
      <p className="text-muted-foreground">
        Liên hệ super admin để được cấp quyền cho chức năng này.
      </p>
      <Link className="text-green-700 underline" to="/admin">
        Về trang quản trị
      </Link>
    </section>
  );
}
