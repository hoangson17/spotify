import {
  BadRequestException,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';

export const PERMISSION_GROUPS = [
  {
    key: 'tracks',
    label: 'Bài hát',
    actions: ['read', 'create', 'update', 'delete'],
  },
  {
    key: 'categories',
    label: 'Thể loại',
    actions: ['read', 'create', 'update', 'delete'],
  },
  {
    key: 'artists',
    label: 'Nghệ sĩ',
    actions: ['read', 'create', 'update', 'delete'],
  },
  {
    key: 'albums',
    label: 'Album',
    actions: ['read', 'create', 'update', 'delete'],
  },
  {
    key: 'playlists',
    label: 'Playlist',
    actions: ['read', 'create', 'update', 'delete'],
  },
  {
    key: 'users',
    label: 'Người dùng',
    actions: ['read', 'update', 'lock', 'restore', 'delete'],
  },
] as const;
export const PERMISSIONS = PERMISSION_GROUPS.flatMap((group) =>
  group.actions.map((action) => `${group.key}:${action}`),
);
export const PERMISSION_METADATA = 'required_permissions';
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSION_METADATA, permissions);

export type PermissionActor = {
  id: string;
  role?: string;
  permissions?: string[] | null;
};
export function hasPermission(
  actor: PermissionActor | undefined | null,
  permission: string,
): boolean {
  return (
    actor?.role === 'super_admin' ||
    (actor?.role === 'admin' &&
      PERMISSIONS.includes(permission) &&
      Array.isArray(actor.permissions) &&
      actor.permissions.includes(permission))
  );
}
export function requirePermission(actor: PermissionActor, permission: string) {
  if (!hasPermission(actor, permission))
    throw new ForbiddenException('Missing permission: ' + permission);
}
export function normalizePermissions(value: unknown): string[] {
  if (
    !Array.isArray(value) ||
    value.length > PERMISSIONS.length ||
    value.some(
      (item) => typeof item !== 'string' || !PERMISSIONS.includes(item),
    )
  ) {
    throw new BadRequestException('Invalid permissions');
  }
  const result = new Set<string>(value);
  for (const permission of result)
    result.add(permission.split(':')[0] + ':read');
  return PERMISSIONS.filter((permission) => result.has(permission));
}
