import { ForbiddenException } from '@nestjs/common';
import { requirePermission } from './permissions';

export type Actor = {
  id: string;
  role?: string;
  email?: string;
  permissions?: string[] | null;
};

export function isAdmin(role: string | undefined): boolean {
  return role === 'admin' || role === 'super_admin';
}

export function assertManageAccount(
  actor: Actor,
  target: Actor,
  operation: 'profile' | 'status' | 'restore' | 'delete' = 'profile',
) {
  if (operation === 'profile' && actor.id === target.id) return;
  if (target.role === 'super_admin')
    throw new ForbiddenException('Super admin account is protected');
  if (actor.role === 'super_admin') return;
  if (actor.role === 'admin' && target.role === 'user') {
    requirePermission(
      actor,
      operation === 'profile'
        ? 'users:update'
        : operation === 'status'
          ? 'users:lock'
          : `users:${operation}`,
    );
    return;
  }
  throw new ForbiddenException('Insufficient account management permissions');
}
