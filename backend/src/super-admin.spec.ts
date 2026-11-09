import { ForbiddenException } from '@nestjs/common';
import { accountProfileFields, profileFields } from './utils/input';
import { assertManageAccount, isAdmin } from './utils/roles';
import { UserService } from './modules/user/user.service';

const root = { id: 100, role: 'super_admin', email: 'root@example.test' };
const admin = {
  id: 99,
  role: 'admin',
  permissions: ['users:read', 'users:update', 'users:lock'],
};
const user = { id: 1, role: 'user' };

describe('Dedicated super admin account', () => {
  it('inherits admin permissions for content management', () => {
    expect(isAdmin(root.role)).toBe(true);
    expect(isAdmin(admin.role)).toBe(true);
    expect(isAdmin(user.role)).toBe(false);
  });

  it('allows only super admin to grant or revoke admin', () => {
    expect(accountProfileFields(root, user, { role: 'admin' })).toEqual({
      role: 'admin',
    });
    expect(accountProfileFields(root, admin, { role: 'user' })).toEqual({
      role: 'user',
    });
    expect(() =>
      accountProfileFields(admin, user, { role: 'admin' }),
    ).toThrow();
    expect(() => accountProfileFields(user, user, { role: 'admin' })).toThrow();
  });

  it('does not allow creation or promotion of super admins through profile input', () => {
    expect(() => profileFields({ role: 'super_admin' })).toThrow();
    expect(() =>
      accountProfileFields(root, user, { role: 'super_admin' }),
    ).toThrow();
    expect(() => accountProfileFields(root, root, { role: 'user' })).toThrow();
  });

  it('protects super admin credentials and status from other accounts', () => {
    expect(() =>
      accountProfileFields(admin, root, { password: 'new-password' }),
    ).toThrow(ForbiddenException);
    expect(() =>
      accountProfileFields({ id: 101, role: 'super_admin' }, root, {
        name: 'Changed',
      }),
    ).toThrow(ForbiddenException);
    expect(() => assertManageAccount(root, root, 'status')).toThrow(
      ForbiddenException,
    );
    expect(() =>
      accountProfileFields(root, root, { email: 'new@example.test' }),
    ).toThrow(ForbiddenException);
  });

  it('requires stronger super admin passwords while allowing own profile updates', () => {
    expect(accountProfileFields(root, root, { name: 'Root' })).toEqual({
      name: 'Root',
    });
    expect(() =>
      accountProfileFields(root, root, { password: 'short-pass' }),
    ).toThrow();
    expect(
      accountProfileFields(root, root, { password: 'long-enough-password' })
        .password,
    ).toBe('long-enough-password');
  });

  it('does not let ordinary admins edit or lock peer admins', () => {
    expect(() => assertManageAccount(admin, { id: 98, role: 'admin' })).toThrow(
      ForbiddenException,
    );
    expect(() => assertManageAccount(admin, admin, 'status')).toThrow(
      ForbiddenException,
    );
    expect(() => assertManageAccount(admin, user, 'status')).not.toThrow();
  });

  it.each(['deleteUser', 'restore', 'hardDelete'] as const)(
    'protects the root account from %s',
    async (method) => {
      const repo = {
        findOne: jest.fn().mockResolvedValue(root),
        softDelete: jest.fn(),
        restore: jest.fn(),
        delete: jest.fn(),
      };
      const service = new UserService(repo as any, {} as any, {} as any);
      await expect(service[method](root.id, root)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      expect(repo.softDelete).not.toHaveBeenCalled();
      expect(repo.restore).not.toHaveBeenCalled();
      expect(repo.delete).not.toHaveBeenCalled();
    },
  );
});
