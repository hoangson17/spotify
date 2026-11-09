export function isAdmin(role?: string): boolean {
  return role === "admin" || role === "super_admin";
}

export function canManageAccount(
  actor: { id: string; role: string; permissions?: string[] | null } | null,
  target: { id: string; role: string },
  operation = "lock"
): boolean {
  if (!actor || target.role === "super_admin") return false;
  return (
    actor.role === "super_admin" ||
    (actor.role === "admin" &&
      target.role === "user" &&
      hasPermission(actor, `users:${operation}`))
  );
}

export function hasPermission(
  actor: { role?: string; permissions?: string[] | null } | null | undefined,
  permission: string
): boolean {
  return (
    actor?.role === "super_admin" ||
    (actor?.role === "admin" &&
      permission !== "rbac:manage" &&
      Array.isArray(actor.permissions) &&
      actor.permissions.includes(permission))
  );
}

export function togglePermission(
  current: string[],
  permission: string,
  checked: boolean
): string[] {
  const [group, action] = permission.split(":");
  if (!checked && action === "read")
    return current.filter((value) => !value.startsWith(group + ":"));
  const next = new Set(current);
  if (checked) {
    next.add(permission);
    next.add(group + ":read");
  } else next.delete(permission);
  return [...next];
}
