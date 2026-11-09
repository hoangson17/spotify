import { getRedisConnectionToken } from '@nestjs-modules/ioredis';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { SafeResponseInterceptor } from './interceptors/safe-response.interceptor';
import { IdPipe } from './pipes/id.pipe';
import { AuthController } from './modules/auth/auth.controller';
import { AuthService } from './modules/auth/auth.service';
import { UserController } from './modules/user/user.controller';
import { LikeTracksController } from './modules/user/like-tracks.controller';
import { UserService } from './modules/user/user.service';
import { PlaylistController } from './modules/playlist/playlist.controller';
import { PlaylistTrackController } from './modules/playlist/playlist-track.controller';
import { PlaylistService } from './modules/playlist/playlist.service';
import { AlbumController } from './modules/album/album.controller';
import { AlbumService } from './modules/album/album.service';
import { ArtistsController } from './modules/artists/artists.controller';
import { ArtistsService } from './modules/artists/artists.service';
import { TrackController } from './modules/track/track.controller';
import { TrackService } from './modules/track/track.service';
import Hash from './utils/hashing';
import { readdir } from 'fs/promises';
import { join } from 'path';

const id = (value: number) =>
  `00000000-0000-4000-8000-${String(value).padStart(12, '0')}`;
const USER_ID = id(1);
const OTHER_USER_ID = id(2);
const LOCKED_USER_ID = id(3);
const ADMIN_ID = id(99);
const SUPER_ADMIN_ID = id(100);
const ALBUM_ID = id(11);
const TRACK_ID = id(12);
const OTHER_TRACK_ID = id(13);
const PLAYLIST_ID = id(14);

describe('HTTP authorization regressions (isolated database and Redis)', () => {
  let app: INestApplication;
  let users: any;
  let playlists: any;
  let userToken: string;
  let adminToken: string;
  let superToken: string;
  let lockedToken: string;
  let redis: any;
  let adminPermissions = ['users:read', 'users:update'];

  beforeAll(async () => {
    users = {
      findOne: jest.fn(async ({ where }: any) => ({
        id: where.id,
        name: 'User',
        email: 'user@example.com',
        role:
          where.id === SUPER_ADMIN_ID
            ? 'super_admin'
            : where.id === ADMIN_ID
              ? 'admin'
              : 'user',
        password: 'private-hash',
        permissions: where.id === ADMIN_ID ? adminPermissions : null,
        ...(where.id === LOCKED_USER_ID ? { deletedAt: new Date() } : {}),
      })),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      find: jest.fn().mockResolvedValue([]),
    };
    playlists = {
      findOne: jest.fn(async () => ({
        id: PLAYLIST_ID,
        users: { id: USER_ID, password: 'private-hash' },
        tracks: [{ id: TRACK_ID }, { id: OTHER_TRACK_ID }],
        is_public: 0,
      })),
      find: jest.fn().mockResolvedValue([]),
      save: jest.fn(async (value) => value),
      remove: jest.fn(),
    };
    redis = {
      get: jest.fn().mockResolvedValue('active-session'),
      eval: jest.fn().mockResolvedValue(1),
    };
    const jwt = new JwtService({
      secret: 'http-test-access',
      signOptions: { expiresIn: '15m' },
    });
    const token = (userId: string) =>
      jwt.sign({ userId, sid: 'active-session', jti: `access-${userId}` });
    userToken = token(USER_ID);
    adminToken = token(ADMIN_ID);
    superToken = token(SUPER_ADMIN_ID);
    lockedToken = token(LOCKED_USER_ID);
    const auth = new AuthService(users, jwt, {} as any, {} as any, redis);
    const module = await Test.createTestingModule({
      controllers: [
        AuthController,
        UserController,
        LikeTracksController,
        PlaylistController,
        PlaylistTrackController,
        AlbumController,
        ArtistsController,
        TrackController,
      ],
      providers: [
        { provide: getRedisConnectionToken(), useValue: redis },
        { provide: AuthService, useValue: auth },
        {
          provide: UserService,
          useValue: new UserService(users, {} as any, auth),
        },
        {
          provide: PlaylistService,
          useValue: new PlaylistService(playlists, {} as any),
        },
        {
          provide: AlbumService,
          useValue: { delete: jest.fn().mockResolvedValue({ success: true }) },
        },
        { provide: ArtistsService, useValue: {} },
        { provide: TrackService, useValue: {} },
      ],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(new IdPipe());
    app.useGlobalInterceptors(new SafeResponseInterceptor());
    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    adminPermissions = ['users:read', 'users:update'];
  });
  afterAll(async () => {
    await app?.close();
  });

  it.each([
    `/user/${USER_ID}`,
    `/album/${ALBUM_ID}`,
    `/artists/${id(15)}`,
    `/playlist/${PLAYLIST_ID}`,
    `/track/${TRACK_ID}`,
  ])(
    'blocks anonymous PATCH %s',
    async (url) => {
      await request(app.getHttpServer())
        .patch(url)
        .send({ title: 'Changed' })
        .expect(401);
    },
  );

  it('blocks changes to another account and rejects injected role fields', async () => {
    await request(app.getHttpServer())
      .patch(`/user/${OTHER_USER_ID}`)
      .auth(userToken, { type: 'bearer' })
      .send({ name: 'Changed' })
      .expect(403);
    await request(app.getHttpServer())
      .patch(`/user/${USER_ID}`)
      .auth(userToken, { type: 'bearer' })
      .send({ role: 'admin' })
      .expect(400);
    expect(users.update).not.toHaveBeenCalled();
  });

  it('hashes a profile password and returns no hash', async () => {
    const result = await request(app.getHttpServer())
      .patch(`/user/${USER_ID}`)
      .auth(userToken, { type: 'bearer' })
      .send({ password: 'new-password' })
      .expect(200);
    expect(
      Hash.compare('new-password', users.update.mock.calls[0][1].password),
    ).toBe(true);
    expect(result.body.password).toBeUndefined();
    expect(redis.eval).toHaveBeenCalled();
  });

  it('allows only a super admin to manage user roles', async () => {
    await request(app.getHttpServer())
      .patch(`/user/${OTHER_USER_ID}`)
      .auth(superToken, { type: 'bearer' })
      .send({ role: 'admin' })
      .expect(200);
    expect(users.update).toHaveBeenCalledWith(OTHER_USER_ID, {
      role: 'admin',
      permissions: [],
    });
  });

  it('rejects non-admin and locked admin API access', async () => {
    await request(app.getHttpServer())
      .delete(`/album/${ALBUM_ID}`)
      .auth(userToken, { type: 'bearer' })
      .expect(403);
    await request(app.getHttpServer())
      .delete(`/album/${ALBUM_ID}`)
      .auth(lockedToken, { type: 'bearer' })
      .expect(401);
  });

  it('prevents ordinary admins from granting admin privileges or editing the super admin', async () => {
    await request(app.getHttpServer())
      .patch(`/user/${OTHER_USER_ID}`)
      .auth(adminToken, { type: 'bearer' })
      .send({ role: 'admin' })
      .expect(400);
    await request(app.getHttpServer())
      .patch(`/user/${SUPER_ADMIN_ID}`)
      .auth(adminToken, { type: 'bearer' })
      .send({ name: 'Changed' })
      .expect(403);
    await request(app.getHttpServer())
      .patch(`/auth/profile/${SUPER_ADMIN_ID}`)
      .auth(adminToken, { type: 'bearer' })
      .send({ password: 'new-password' })
      .expect(403);
    expect(users.update).not.toHaveBeenCalled();
  });

  it('protects the dedicated super admin role and account even from its own destructive requests', async () => {
    await request(app.getHttpServer())
      .patch(`/user/${SUPER_ADMIN_ID}`)
      .auth(superToken, { type: 'bearer' })
      .send({ role: 'user' })
      .expect(403);
    await request(app.getHttpServer())
      .delete(`/user/${SUPER_ADMIN_ID}`)
      .auth(superToken, { type: 'bearer' })
      .expect(403);
    await request(app.getHttpServer())
      .delete(`/user/hard-delete/${SUPER_ADMIN_ID}`)
      .auth(superToken, { type: 'bearer' })
      .expect(403);
    await request(app.getHttpServer())
      .patch(`/user/restore/${SUPER_ADMIN_ID}`)
      .auth(adminToken, { type: 'bearer' })
      .expect(403);
  });

  it('accepts super admin on content management routes', async () => {
    await request(app.getHttpServer())
      .delete(`/album/${ALBUM_ID}`)
      .auth(superToken, { type: 'bearer' })
      .expect(200);
  });

  it('enforces granted action permissions on actual HTTP routes', async () => {
    await request(app.getHttpServer())
      .delete(`/album/${ALBUM_ID}`)
      .auth(adminToken, { type: 'bearer' })
      .expect(403);
    adminPermissions = ['albums:read', 'albums:delete'];
    await request(app.getHttpServer())
      .delete(`/album/${ALBUM_ID}`)
      .auth(adminToken, { type: 'bearer' })
      .expect(200);
    await request(app.getHttpServer())
      .delete(`/track/${TRACK_ID}`)
      .auth(adminToken, { type: 'bearer' })
      .expect(403);
    adminPermissions = [];
    await request(app.getHttpServer())
      .delete(`/album/${ALBUM_ID}`)
      .auth(adminToken, { type: 'bearer' })
      .expect(403);
  });

  it('exposes the RBAC screen APIs only to super admin', async () => {
    await request(app.getHttpServer())
      .get('/user/permission-catalog')
      .auth(adminToken, { type: 'bearer' })
      .expect(403);
    const catalog = await request(app.getHttpServer())
      .get('/user/permission-catalog')
      .auth(superToken, { type: 'bearer' })
      .expect(200);
    expect(catalog.body.some((group: any) => group.key === 'tracks')).toBe(
      true,
    );
    await request(app.getHttpServer())
      .put(`/user/${ADMIN_ID}/permissions`)
      .auth(adminToken, { type: 'bearer' })
      .send({ permissions: ['tracks:delete'] })
      .expect(403);
    const result = await request(app.getHttpServer())
      .put(`/user/${ADMIN_ID}/permissions`)
      .auth(superToken, { type: 'bearer' })
      .send({ permissions: ['tracks:create'] })
      .expect(200);
    expect(result.body.permissions).toEqual(['tracks:read', 'tracks:create']);
    expect(redis.eval).toHaveBeenCalled();
    await request(app.getHttpServer())
      .put(`/user/${SUPER_ADMIN_ID}/permissions`)
      .auth(superToken, { type: 'bearer' })
      .send({ permissions: [] })
      .expect(400);
    await request(app.getHttpServer())
      .put(`/user/${ADMIN_ID}/permissions`)
      .auth(superToken, { type: 'bearer' })
      .send({ permissions: ['rbac:manage'] })
      .expect(400);
  });

  it('requires users:update to edit another user while preserving self-service profile changes', async () => {
    adminPermissions = ['users:read'];
    await request(app.getHttpServer())
      .patch(`/user/${OTHER_USER_ID}`)
      .auth(adminToken, { type: 'bearer' })
      .send({ name: 'Changed' })
      .expect(403);
    adminPermissions = ['users:read', 'users:update'];
    await request(app.getHttpServer())
      .patch(`/user/${OTHER_USER_ID}`)
      .auth(adminToken, { type: 'bearer' })
      .send({ name: 'Changed' })
      .expect(200);
    expect(users.update).toHaveBeenCalledWith(OTHER_USER_ID, {
      name: 'Changed',
    });
    await request(app.getHttpServer())
      .patch(`/user/${USER_ID}`)
      .auth(userToken, { type: 'bearer' })
      .send({ name: 'Own name' })
      .expect(200);
  });

  it('rejects forged liked-track ownership', async () => {
    await request(app.getHttpServer())
      .post('/like-tracks/add')
      .auth(userToken, { type: 'bearer' })
      .send({ userId: OTHER_USER_ID, trackIds: [TRACK_ID] })
      .expect(403);
  });

  it('rejects invalid URL IDs', async () => {
    await request(app.getHttpServer())
      .patch('/user/invalid')
      .auth(userToken, { type: 'bearer' })
      .send({ name: 'Changed' })
      .expect(400);
  });

  it('removes passwords and session metadata from the profile response', async () => {
    const { body } = await request(app.getHttpServer())
      .get('/auth/profile')
      .auth(userToken, { type: 'bearer' })
      .expect(200);
    expect(body.id).toBe(USER_ID);
    for (const key of ['password', 'jti', 'sid', 'exp'])
      expect(body[key]).toBeUndefined();
  });

  it('does not disclose private playlists to guests', async () => {
    await request(app.getHttpServer())
      .get(`/playlist/${PLAYLIST_ID}`)
      .expect(404);
    const { body } = await request(app.getHttpServer())
      .get(`/playlist/${PLAYLIST_ID}`)
      .auth(userToken, { type: 'bearer' })
      .expect(200);
    expect(body.users.password).toBeUndefined();
  });

  it('routes selective track removal and checks ownership', async () => {
    const { body } = await request(app.getHttpServer())
      .patch(`/playlist-track/remove/${USER_ID}`)
      .auth(userToken, { type: 'bearer' })
      .send({ playlistId: PLAYLIST_ID, trackIds: [TRACK_ID] })
      .expect(200);
    expect(body.tracks).toEqual([{ id: OTHER_TRACK_ID }]);
    await request(app.getHttpServer())
      .patch(`/playlist-track/remove/${OTHER_USER_ID}`)
      .auth(userToken, { type: 'bearer' })
      .send({ playlistId: PLAYLIST_ID, trackIds: [TRACK_ID] })
      .expect(403);
  });

  it('cleans a newly uploaded image when ownership validation fails', async () => {
    const folder = join(process.cwd(), 'uploads', 'images');
    const before = await readdir(folder).catch(() => []);
    await request(app.getHttpServer())
      .patch(`/user/${OTHER_USER_ID}`)
      .auth(userToken, { type: 'bearer' })
      .attach(
        'avatar',
        Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j7hsAAAAASUVORK5CYII=',
          'base64',
        ),
        'avatar.png',
      )
      .expect(403);
    expect((await readdir(folder)).sort()).toEqual(before.sort());
  });
});
