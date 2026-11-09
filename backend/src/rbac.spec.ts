import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import {
  hasPermission,
  normalizePermissions,
  PERMISSION_METADATA,
  PERMISSIONS,
} from './utils/permissions';
import { RoleGuard } from './guards/role/role.guard';
import { UserService } from './modules/user/user.service';
import { PlaylistService } from './modules/playlist/playlist.service';
import { accountProfileFields } from './utils/input';

const id = (value: number) =>
  `00000000-0000-4000-8000-${String(value).padStart(12, '0')}`;
const USER_ID = id(1);
const ADMIN_ID = id(2);
const PLAYLIST_ID = id(5);
const root = { id: id(100), role: 'super_admin' };
describe('Admin permission assignments', () => {
  it('denies unassigned admin permissions and never grants permission management to ordinary admins', () => {
    expect(
      hasPermission({ id: USER_ID, role: 'admin' }, 'tracks:delete'),
    ).toBe(false);
    expect(
      hasPermission(
        { id: USER_ID, role: 'admin', permissions: ['rbac:manage'] },
        'rbac:manage',
      ),
    ).toBe(false);
    expect(hasPermission(root, 'rbac:manage')).toBe(true);
    expect(
      hasPermission(
        { id: USER_ID, role: 'user', permissions: PERMISSIONS },
        'tracks:delete',
      ),
    ).toBe(false);
  });
  it('adds read prerequisites, deduplicates and rejects unknown permissions', () => {
    expect(normalizePermissions(['tracks:create', 'tracks:create'])).toEqual([
      'tracks:read',
      'tracks:create',
    ]);
    expect(normalizePermissions([])).toEqual([]);
    for (const value of [
      ['rbac:manage'],
      ['*'],
      ['super_admin'],
      'tracks:read',
      [1],
    ])
      expect(() => normalizePermissions(value)).toThrow();
  });
  it('only allows super admin to assign permissions and revokes the changed admin session', async () => {
    const repo = {
      findOne: jest.fn().mockResolvedValue({ id: ADMIN_ID, role: 'admin' }),
      update: jest.fn(),
    };
    const auth = { revokeSessions: jest.fn() };
    const service = new UserService(repo as any, {} as any, auth as any);
    await expect(
      service.setPermissions(
        ADMIN_ID,
        { permissions: ['albums:update'] },
        { id: USER_ID, role: 'admin', permissions: PERMISSIONS },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(repo.update).not.toHaveBeenCalled();
    await expect(
      service.setPermissions(
        ADMIN_ID,
        { permissions: ['albums:update'] },
        root,
      ),
    ).resolves.toEqual({
      id: ADMIN_ID,
      permissions: ['albums:read', 'albums:update'],
    });
    expect(repo.update).toHaveBeenCalledWith(ADMIN_ID, {
      permissions: ['albums:read', 'albums:update'],
    });
    expect(auth.revokeSessions).toHaveBeenCalledWith(ADMIN_ID);
  });
  it('rejects permission updates on normal users or super admin and prevents profile injection', async () => {
    const repo = { findOne: jest.fn(), update: jest.fn() };
    const service = new UserService(repo as any, {} as any, {} as any);
    for (const role of ['user', 'super_admin']) {
      repo.findOne.mockResolvedValue({ id: ADMIN_ID, role });
      await expect(
        service.setPermissions(
          ADMIN_ID,
          { permissions: ['tracks:read'] },
          root,
        ),
      ).rejects.toThrow();
    }
    expect(() =>
      accountProfileFields(
        root,
        { id: ADMIN_ID, role: 'admin' },
        { permissions: PERMISSIONS },
      ),
    ).toThrow();
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('clears old assignments when an account changes role', async () => {
    const repo = {
      findOne: jest
        .fn()
        .mockResolvedValue({
          id: ADMIN_ID,
          role: 'admin',
          permissions: ['tracks:delete'],
        }),
      update: jest.fn(),
    };
    const auth = { revokeSessions: jest.fn() };
    const service = new UserService(repo as any, {} as any, auth as any);
    await service.update(ADMIN_ID, { role: 'user' }, undefined, root);
    expect(repo.update).toHaveBeenCalledWith(ADMIN_ID, {
      role: 'user',
      permissions: [],
    });
    expect(auth.revokeSessions).toHaveBeenCalledWith(ADMIN_ID);
  });
  it('enforces operation metadata using current database permissions', async () => {
    const handler = () => {};
    Reflect.defineMetadata(PERMISSION_METADATA, ['tracks:delete'], handler);
    const request = { headers: { authorization: 'Bearer token' }, user: null };
    const ctx = {
      switchToHttp: () => ({ getRequest: () => request }),
      getHandler: () => handler,
      getClass: () => class Controller {},
    } as unknown as ExecutionContext;
    const profile = {
      id: USER_ID,
      role: 'admin',
      permissions: ['tracks:read'],
    };
    const auth = {
      verifyToken: () => ({ userId: USER_ID, sid: 'active', jti: 'access' }),
      profile: jest.fn().mockResolvedValue(profile),
    };
    const guard = new RoleGuard(
      { get: async () => 'active' } as any,
      auth as any,
    );
    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    profile.permissions = ['tracks:read', 'tracks:delete'];
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    profile.permissions = [];
    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    Reflect.deleteMetadata(PERMISSION_METADATA, handler);
    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
  it('requires matching playlist permissions for admin overrides while preserving personal ownership', async () => {
    const repo = {
      findOne: jest
        .fn()
        .mockResolvedValue({
          id: PLAYLIST_ID,
          users: { id: ADMIN_ID },
          is_public: 0,
          tracks: [],
        }),
      save: jest.fn(async (value) => value),
      remove: jest.fn(),
    };
    const service = new PlaylistService(repo as any, {} as any);
    const admin = {
      id: USER_ID,
      role: 'admin',
      permissions: ['tracks:delete'],
    };
    await expect(service.findOne(PLAYLIST_ID, admin)).rejects.toThrow(
      'Playlist not found',
    );
    await expect(
      service.update(PLAYLIST_ID, { title: 'Changed' }, undefined, admin),
    ).rejects.toBeInstanceOf(ForbiddenException);
    admin.permissions = ['playlists:read', 'playlists:update'];
    await expect(service.findOne(PLAYLIST_ID, admin)).resolves.toMatchObject({
      id: PLAYLIST_ID,
    });
    await expect(
      service.update(PLAYLIST_ID, { title: 'Changed' }, undefined, admin),
    ).resolves.toMatchObject({ title: 'Changed' });
    await expect(service.delete(PLAYLIST_ID, admin)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    await expect(
      service.update(PLAYLIST_ID, { title: 'Own playlist' }, undefined, {
        id: ADMIN_ID,
        role: 'user',
      }),
    ).resolves.toMatchObject({ title: 'Own playlist' });
  });
});
