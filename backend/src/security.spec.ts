import { PERMISSION_METADATA } from './utils/permissions';
import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard, OptionalAuthGuard } from './guards/auth/auth.guard';
import { RoleGuard } from './guards/role/role.guard';
import { AuthService } from './modules/auth/auth.service';
import { PlaylistService } from './modules/playlist/playlist.service';
import { safeResponse } from './interceptors/safe-response.interceptor';
import {
  allowedFields,
  entityId,
  profileFields,
  trackIds,
} from './utils/input';
import Hash from './utils/hashing';
import { UserService } from './modules/user/user.service';
import { uploadCommitted } from './utils/uploads';
import { imageMulterConfig, multerConfig } from './config/multer.config';

const id = (value: number) =>
  `00000000-0000-4000-8000-${String(value).padStart(12, '0')}`;
const USER_ID = id(1);
const OTHER_USER_ID = id(2);
const TRACK_ID = id(3);
const PLAYLIST_ID = id(5);

const context = (request: any) => {
  const handler = () => {};
  Reflect.defineMetadata(PERMISSION_METADATA, ['tracks:update'], handler);
  return {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => handler,
    getClass: () => class TestController {},
  } as unknown as ExecutionContext;
};

describe('Input and response boundaries', () => {
  it.each([0, -1, '1.5', 'abc', null, {}, '1e3'])(
    'rejects invalid ID %p',
    (value) => {
      expect(() => entityId(value)).toThrow();
    },
  );
  it('normalizes IDs and rejects unexpected profile fields', () => {
    expect(entityId(USER_ID.toUpperCase())).toBe(USER_ID);
    expect(trackIds([USER_ID, USER_ID.toUpperCase(), OTHER_USER_ID])).toEqual([
      USER_ID,
      OTHER_USER_ID,
    ]);
    expect(() => profileFields({ role: 'admin' })).toThrow();
    expect(() => profileFields({ id: 9 })).toThrow();
    expect(() =>
      allowedFields({ __proto__: null, password: 'secret' }, ['name']),
    ).toThrow();
  });
  it('only allows role changes on the explicit admin path', () => {
    expect(profileFields({ role: 'admin' }, true)).toEqual({ role: 'admin' });
    expect(() => profileFields({ role: 'superuser' }, true)).toThrow();
    expect(() => profileFields({ password: 'short' })).toThrow();
  });
  it('removes password hashes and internal session data at every nesting level', () => {
    const date = new Date();
    expect(
      safeResponse({
        user: { id: 1, password: 'hash', sid: 'session' },
        playlists: [{ users: { password: 'hash', name: 'A' } }],
        date,
      }),
    ).toEqual({ user: { id: 1 }, playlists: [{ users: { name: 'A' } }], date });
  });
});

describe('Upload boundaries', () => {
  it('keeps media already saved to the database if a later session operation fails', async () => {
    const repo = {
      findOne: jest.fn().mockResolvedValue({ id: USER_ID }),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    };
    const auth = {
      revokeSessions: jest
        .fn()
        .mockRejectedValue(new Error('Redis unavailable')),
    };
    const service = new UserService(repo as any, {} as any, auth as any);
    const file = {
      filename: 'new.png',
      mimetype: 'image/png',
    } as Express.Multer.File;
    await expect(
      service.update(USER_ID, { password: 'new-password' }, file, {
        id: USER_ID,
        role: 'user',
      }),
    ).rejects.toThrow('Redis unavailable');
    expect(uploadCommitted(file)).toBe(true);
  });
  const filter = (file: any) =>
    new Promise<boolean>((resolve, reject) => {
      multerConfig.fileFilter!({} as any, file, (error, accepted) =>
        error ? reject(error) : resolve(accepted),
      );
    });
  it('rejects active content and mismatched extensions before writing a file', async () => {
    await expect(
      filter({
        fieldname: 'avatar',
        originalname: 'script.svg',
        mimetype: 'image/svg+xml',
      }),
    ).rejects.toThrow();
    await expect(
      filter({
        fieldname: 'avatar',
        originalname: 'script.html',
        mimetype: 'image/png',
      }),
    ).rejects.toThrow();
    await expect(
      filter({
        fieldname: 'audio',
        originalname: 'song.mp3',
        mimetype: 'audio/mpeg',
      }),
    ).resolves.toBe(true);
    await expect(
      filter({
        fieldname: 'avatar',
        originalname: 'avatar.png',
        mimetype: 'image/png',
      }),
    ).resolves.toBe(true);
  });
  it('does not use path segments from the URL as a filename', (done) => {
    (multerConfig.storage as any).getFilename(
      { params: { id: '../../outside' } },
      { originalname: 'avatar.png' },
      (_error: any, filename: string) => {
        expect(filename).toMatch(/^user-\d+-\d+\.png$/);
        done();
      },
    );
  });
  it('caps image and audio upload sizes', () => {
    expect(imageMulterConfig.limits?.fileSize).toBe(10 * 1024 * 1024 + 1);
    expect(multerConfig.limits?.fileSize).toBe(100 * 1024 * 1024 + 1);
  });
});

describe('Session and admin guards', () => {
  let auth: any;
  let redis: any;
  let request: any;
  beforeEach(() => {
    auth = {
      verifyToken: jest.fn().mockReturnValue({
        userId: USER_ID,
        sid: 'session',
        jti: 'access',
        role: 'admin',
      }),
      profile: jest.fn().mockResolvedValue({ id: USER_ID, role: 'user' }),
    };
    redis = { get: jest.fn().mockResolvedValue('session') };
    request = { headers: { authorization: 'Bearer token' } };
  });
  it('accepts a current session and loads the role from the database', async () => {
    await expect(
      new AuthGuard(redis, auth).canActivate(context(request)),
    ).resolves.toBe(true);
    expect(request.user.role).toBe('user');
  });
  it('rejects missing authentication', async () => {
    request.headers = {};
    await expect(
      new AuthGuard(redis, auth).canActivate(context(request)),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
  it('rejects a session revoked by logout or replaced by a newer login', async () => {
    redis.get.mockResolvedValue('another-session');
    await expect(
      new AuthGuard(redis, auth).canActivate(context(request)),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
  it('rejects locked accounts', async () => {
    auth.profile.mockResolvedValue({
      id: USER_ID,
      role: 'admin',
      deletedAt: new Date(),
    });
    await expect(
      new RoleGuard(redis, auth).canActivate(context(request)),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
  it('rejects an old admin claim when the database role is user', async () => {
    await expect(
      new RoleGuard(redis, auth).canActivate(context(request)),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
  it('accepts an active admin', async () => {
    auth.profile.mockResolvedValue({
      id: USER_ID,
      role: 'admin',
      permissions: ['tracks:read', 'tracks:update'],
    });
    await expect(
      new RoleGuard(redis, auth).canActivate(context(request)),
    ).resolves.toBe(true);
  });
  it('allows anonymous reads but does not ignore an invalid supplied token', async () => {
    request.headers = {};
    await expect(
      new OptionalAuthGuard(redis, auth).canActivate(context(request)),
    ).resolves.toBe(true);
    request.headers.authorization = 'invalid';
    await expect(
      new OptionalAuthGuard(redis, auth).canActivate(context(request)),
    ).rejects.toThrow();
  });
});

describe('Auth service regression cases', () => {
  let service: AuthService;
  let repo: any;
  let redis: any;
  let jwt: JwtService;
  const user = {
    id: USER_ID,
    name: 'User',
    email: 'user@example.com',
    role: 'user',
  };
  const previousSecret = process.env.JWT_REFRESH_TOKEN_SECRET;
  const previousExpiry = process.env.JWT_REFRESH_TOKEN_EXPIRED;
  beforeAll(() => {
    process.env.JWT_REFRESH_TOKEN_SECRET = 'test-refresh-secret';
    process.env.JWT_REFRESH_TOKEN_EXPIRED = '7d';
  });
  afterAll(() => {
    if (previousSecret === undefined)
      delete process.env.JWT_REFRESH_TOKEN_SECRET;
    else process.env.JWT_REFRESH_TOKEN_SECRET = previousSecret;
    if (previousExpiry === undefined)
      delete process.env.JWT_REFRESH_TOKEN_EXPIRED;
    else process.env.JWT_REFRESH_TOKEN_EXPIRED = previousExpiry;
  });
  beforeEach(() => {
    repo = {
      findOne: jest.fn().mockResolvedValue(user),
      create: jest.fn((data) => data),
      save: jest.fn((data) => Promise.resolve(data)),
      update: jest.fn(),
    };
    redis = {
      get: jest.fn(),
      eval: jest.fn().mockResolvedValue(1),
      set: jest.fn(),
      del: jest.fn(),
    };
    jwt = new JwtService({
      secret: 'test-access-secret',
      signOptions: { expiresIn: '15m' },
    });
    service = new AuthService(
      repo,
      jwt,
      {} as any,
      { add: jest.fn() } as any,
      redis,
    );
  });
  it('rejects privilege escalation during registration before writing anything', async () => {
    await expect(
      service.register({
        name: user.name,
        email: user.email,
        role: 'admin',
        password: 'password123',
      }),
    ).rejects.toThrow();
    expect(repo.save).not.toHaveBeenCalled();
  });
  it('hashes passwords and ignores no injected account fields', async () => {
    repo.findOne.mockResolvedValue(null);
    const result: any = await service.register({
      name: 'New User',
      email: 'new@example.com',
      password: 'password123',
    });
    expect(Hash.compare('password123', result.password)).toBe(true);
    expect(result.role).toBeUndefined();
  });
  it('creates one stable session for both tokens without exposing the hash', async () => {
    const result = await service.createToken({ ...user, password: 'hash' });
    const access = service.verifyToken(result.accessToken);
    const refresh = service.verifyRefreshToken(result.refreshToken);
    expect(access.sid).toBe(refresh.jti);
    expect(result.user.password).toBeUndefined();
    expect(redis.eval.mock.calls[0].slice(1, 4)).toEqual([
      2,
      `Device_${USER_ID}`,
      `jwt_refresh_${refresh.jti}`,
    ]);
  });
  it('refreshes into the same session with a new access JTI and current role', async () => {
    const original = await service.createToken(user);
    const old = service.verifyToken(original.accessToken);
    redis.get.mockImplementation((key: string) =>
      Promise.resolve(
        key === `Device_${USER_ID}`
          ? old.sid
          : JSON.stringify({ userId: USER_ID }),
      ),
    );
    const result = await service.refreshToken({
      refreshToken: original.refreshToken,
    });
    expect(result).toBeTruthy();
    const next = service.verifyToken((result as any).accessToken);
    expect(next.sid).toBe(old.sid);
    expect(next.jti).not.toBe(old.jti);
    expect(next.role).toBe('user');
  });
  it('does not refresh revoked or locked sessions', async () => {
    const original = await service.createToken(user);
    redis.get.mockResolvedValue(null);
    await expect(
      service.refreshToken({ refreshToken: original.refreshToken }),
    ).resolves.toBe(false);
    const sid = service.verifyRefreshToken(original.refreshToken).jti;
    redis.get.mockImplementation((key: string) =>
      Promise.resolve(
        key === `Device_${USER_ID}` ? sid : JSON.stringify({ userId: USER_ID }),
      ),
    );
    repo.findOne.mockResolvedValue({ ...user, deletedAt: new Date() });
    await expect(
      service.refreshToken({ refreshToken: original.refreshToken }),
    ).resolves.toBe(false);
  });
  it('revokes the session and refresh token together on logout', async () => {
    await service.logout({ id: USER_ID, sid: 'session' });
    expect(redis.eval.mock.calls[0].slice(1)).toEqual([
      2,
      `Device_${USER_ID}`,
      'jwt_refresh_session',
      'session',
    ]);
  });
  it('rejects another account update and a self-service role change', async () => {
    await expect(
      service.updateProfile(OTHER_USER_ID, { name: 'Changed' }, user),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      service.updateProfile(USER_ID, { role: 'admin' }, user),
    ).rejects.toThrow();
    expect(repo.update).not.toHaveBeenCalled();
  });
  it('rejects reused Google exchange codes', async () => {
    redis.eval.mockResolvedValue(null);
    await expect(
      service.exchangeGoogleLogin({ code: 'used-code' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
  it('consumes OAuth state and rejects reuse', async () => {
    redis.del.mockResolvedValueOnce(1).mockResolvedValueOnce(0);
    await expect(service.consumeGoogleState('state')).resolves.toBeUndefined();
    await expect(service.consumeGoogleState('state')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
  it('uses the same session creation flow for Google login', async () => {
    const fetch = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        email: user.email,
        name: user.name,
        verified_email: true,
      }),
    } as Response);
    try {
      const result = await service.googleLogin('google-access-token');
      expect(service.verifyToken(result.accessToken).sid).toBe(
        service.verifyRefreshToken(result.refreshToken).jti,
      );
      expect(fetch).toHaveBeenCalledWith(
        'https://www.googleapis.com/oauth2/v1/userinfo',
        expect.objectContaining({
          headers: { Authorization: 'Bearer google-access-token' },
        }),
      );
    } finally {
      fetch.mockRestore();
    }
  });
  it('rejects unverified Google email', async () => {
    const fetch = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ email: user.email, verified_email: false }),
    } as Response);
    try {
      await expect(service.googleLogin('token')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    } finally {
      fetch.mockRestore();
    }
  });
  it('rejects a password reset once the attempt limit is exceeded', async () => {
    redis.incr = jest.fn().mockResolvedValue(6);
    await expect(
      service.resetPassword({
        email: user.email,
        otp: '123456',
        newPassword: 'new-password',
      }),
    ).rejects.toThrow('Too many attempts');
    expect(repo.save).not.toHaveBeenCalled();
  });
  it('cannot reset a password with an OTP already consumed by another request', async () => {
    redis.incr = jest.fn().mockResolvedValue(2);
    redis.get.mockResolvedValue('123456');
    redis.eval.mockResolvedValue(0);
    await expect(
      service.resetPassword({
        email: user.email,
        otp: '123456',
        newPassword: 'new-password',
      }),
    ).rejects.toThrow('OTP expired or already used');
    expect(repo.save).not.toHaveBeenCalled();
  });
});

describe('Playlist ownership and visibility', () => {
  let service: PlaylistService;
  let repo: any;
  let tracks: any;
  const actor = { id: USER_ID, role: 'user' };
  const playlist = () => ({
    id: PLAYLIST_ID,
    title: 'Private',
    users: { id: USER_ID },
    is_public: 0,
    tracks: [{ id: OTHER_USER_ID }, { id: TRACK_ID }],
  });
  beforeEach(() => {
    repo = {
      findOne: jest.fn().mockResolvedValue(playlist()),
      findAndCount: jest.fn().mockResolvedValue([[], 0]),
      save: jest.fn((value) => Promise.resolve(value)),
      create: jest.fn((value) => value),
      remove: jest.fn(),
    };
    tracks = { find: jest.fn().mockResolvedValue([{ id: OTHER_USER_ID }]) };
    service = new PlaylistService(repo, tracks);
  });
  it('hides private playlists from guests and other accounts', async () => {
    await expect(service.findOne(PLAYLIST_ID)).rejects.toThrow(
      'Playlist not found',
    );
    await expect(
      service.findOne(PLAYLIST_ID, { id: OTHER_USER_ID, role: 'user' }),
    ).rejects.toThrow('Playlist not found');
    await expect(service.findOne(PLAYLIST_ID, actor)).resolves.toMatchObject({
      id: PLAYLIST_ID,
    });
  });
  it('filters guest listing to public playlists', async () => {
    await service.findAll();
    expect(repo.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({ where: { is_public: 1 } }),
    );
  });
  it('creates playlists for the authenticated user and rejects forged ownership', async () => {
    await expect(
      service.create({ title: 'Mine' }, undefined, actor),
    ).resolves.toMatchObject({ users: { id: USER_ID } });
    await expect(
      service.create(
        { title: 'Forged', user_id: OTHER_USER_ID },
        undefined,
        actor,
      ),
    ).rejects.toThrow();
  });
  it('prevents another account from updating or deleting a playlist', async () => {
    const other = { id: OTHER_USER_ID, role: 'user' };
    await expect(
      service.update(PLAYLIST_ID, { title: 'Changed' }, undefined, other),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(service.delete(PLAYLIST_ID, other)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(repo.save).not.toHaveBeenCalled();
    expect(repo.remove).not.toHaveBeenCalled();
  });
  it('removes only selected tracks and allows syncing to an empty playlist', async () => {
    await expect(
      service.removeTracks(actor, PLAYLIST_ID, [OTHER_USER_ID]),
    ).resolves.toMatchObject({ tracks: [{ id: TRACK_ID }] });
    await expect(
      service.syncTrack(actor, PLAYLIST_ID, []),
    ).resolves.toMatchObject({
      tracks: [],
    });
  });
  it('avoids duplicate tracks and rejects nonexistent IDs', async () => {
    await expect(
      service.addTrack(actor, PLAYLIST_ID, [OTHER_USER_ID]),
    ).resolves.toMatchObject({
      tracks: [{ id: OTHER_USER_ID }, { id: TRACK_ID }],
    });
    tracks.find.mockResolvedValue([]);
    await expect(
      service.addTrack(actor, PLAYLIST_ID, [id(999)]),
    ).rejects.toThrow('Track not found');
  });
});
