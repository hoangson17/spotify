import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Actor, assertManageAccount } from './roles';
import { hasPermission } from './permissions';

export function entityId(value: unknown): string {
  if (
    typeof value !== 'string' ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  ) {
    throw new BadRequestException('ID must be a valid UUID');
  }
  return value.toLowerCase();
}

export function trackIds(value: unknown): string[] {
  if (!Array.isArray(value) || value.length > 500)
    throw new BadRequestException('Invalid track IDs');
  return [...new Set(value.map(entityId))];
}

export function allowedFields(
  body: unknown,
  fields: readonly string[],
): Record<string, any> {
  if (!body || typeof body !== 'object' || Array.isArray(body))
    throw new BadRequestException('Invalid body');
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(body)) {
    if (!fields.includes(key))
      throw new BadRequestException(`Field ${key} is not allowed`);
    result[key] = value;
  }
  return result;
}

export function text(
  value: unknown,
  field: string,
  max: number,
  min = 1,
): string {
  if (
    typeof value !== 'string' ||
    value.trim().length < min ||
    value.length > max
  ) {
    throw new BadRequestException(`Invalid ${field}`);
  }
  return value.trim();
}

export function emailAddress(value: unknown): string {
  const email = text(value, 'email', 100).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new BadRequestException('Invalid email');
  return email;
}

export function passwordValue(value: unknown): string {
  if (
    typeof value !== 'string' ||
    value.length < 6 ||
    Buffer.byteLength(value, 'utf8') > 72
  ) {
    throw new BadRequestException(
      'Password must contain at least 6 characters and at most 72 bytes',
    );
  }
  return value;
}

export function assertOwner(actor: { id: string; role?: string }, id: string) {
  if (actor.id !== id && !hasPermission(actor, 'users:update'))
    throw new ForbiddenException('Forbidden');
}

export function profileFields(body: unknown, allowRole = false) {
  const data = allowedFields(body, [
    'name',
    'email',
    'password',
    'avatar',
    ...(allowRole ? ['role'] : []),
  ]);
  if (data.name !== undefined) data.name = text(data.name, 'name', 30);
  if (data.email !== undefined) data.email = emailAddress(data.email);
  if (data.password !== undefined) data.password = passwordValue(data.password);
  if (data.avatar !== undefined) {
    data.avatar = text(data.avatar, 'avatar', 2048, 0);
    if (data.avatar && !/^https?:\/\//.test(data.avatar)) {
      throw new BadRequestException('Invalid avatar URL');
    }
  }
  if (data.role !== undefined && !['user', 'admin'].includes(data.role))
    throw new BadRequestException('Invalid role');
  return data;
}

export function accountProfileFields(
  actor: Actor,
  target: Actor,
  body: unknown,
) {
  assertManageAccount(actor, target);
  const data = profileFields(body, actor.role === 'super_admin');
  if (
    target.role !== 'super_admin' &&
    data.email !== undefined &&
    data.email === process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase()
  ) {
    throw new BadRequestException('Email is reserved');
  }
  if (target.role === 'super_admin') {
    if (
      data.role !== undefined ||
      (data.email !== undefined && data.email !== target.email)
    ) {
      throw new ForbiddenException(
        'Super admin role and email are managed separately',
      );
    }
    if (data.password !== undefined && data.password.length < 12) {
      throw new BadRequestException(
        'Super admin password must have at least 12 characters',
      );
    }
  }
  return data;
}
