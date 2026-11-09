import type { ReactNode } from "react";
import { useSelector } from "react-redux";
import { hasPermission } from "@/utils/roles";

export function Can({
  permission,
  children,
}: {
  permission: string;
  children: ReactNode;
}) {
  const user = useSelector((state: any) => state.auth.user);
  return hasPermission(user, permission) ? <>{children}</> : null;
}
