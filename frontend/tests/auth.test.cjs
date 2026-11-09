const { before, beforeEach, after, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const axios = require('axios');

// Load the application's TypeScript in Node without a browser or another test dependency.
const sourceRoot = path.resolve(__dirname, '../src');
const previousLoader = require.extensions['.ts'];
require.extensions['.ts'] = (module, filename) => {
  if (!filename.startsWith(sourceRoot)) {
    if (previousLoader) return previousLoader(module, filename);
    throw new Error(`Unexpected TypeScript module: ${filename}`);
  }
  const source = fs.readFileSync(filename, 'utf8')
    .replaceAll('import.meta.env.VITE_SERVER_API', JSON.stringify('http://test.local'));
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    fileName: filename,
  });
  module._compile(outputText, filename);
};

const saved = new Map();
global.localStorage = {
  getItem: key => saved.get(key) ?? null,
  setItem: (key, value) => saved.set(key, String(value)),
  removeItem: key => saved.delete(key),
};
global.self = { localStorage: global.localStorage };
const { store, persistor } = require('../src/redux.ts');
const instance = require('../src/axiosConfig.ts').default;
const { saveTokens } = require('../src/services/authTokens.ts');
const { logout } = require('../src/stores/actions/authActions.ts');

const response = (config, data, status = 200) => ({ config, data, status, statusText: String(status), headers: {} });
const unauthorized = config => Promise.reject(new axios.AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, null, response(config, {}, 401)));

before(async () => {
  if (!persistor.getState().bootstrapped) {
    await new Promise(resolve => {
      const unsubscribe = persistor.subscribe(() => {
        if (persistor.getState().bootstrapped) { unsubscribe(); resolve(); }
      });
    });
  }
  persistor.pause();
});

beforeEach(() => {
  store.dispatch({ type: 'LOGOUT' });
  saved.clear();
  saveTokens('old-access', 'refresh');
  store.dispatch({ type: 'LOGIN_SUCCESS', payload: { user: { id: 1, role: 'user' }, accessToken: 'old-access', refreshToken: 'refresh' } });
  axios.defaults.adapter = () => { throw new Error('Unexpected network request'); };
});

after(async () => {
  await persistor.flush();
  require.extensions['.ts'] = previousLoader;
  delete global.self;
  delete global.localStorage;
});

test('requests read the same store supplied to React', async () => {
  let authorization;
  instance.defaults.adapter = async config => {
    authorization = config.headers.Authorization;
    return response(config, {});
  };
  store.dispatch({ type: 'REFRESH_TOKEN', payload: 'current-access' });
  await instance.get('/auth/profile');
  assert.equal(authorization, 'Bearer current-access');
});

test('concurrent 401 responses share one refresh and update Redux and localStorage', async () => {
  let refreshes = 0;
  axios.defaults.adapter = async config => {
    refreshes++;
    assert.equal(config.url, 'http://test.local/auth/refresh-token');
    await new Promise(resolve => setTimeout(resolve, 10));
    return response(config, { accessToken: 'new-access', refreshToken: 'refresh' });
  };
  instance.defaults.adapter = async config => config.headers.Authorization === 'Bearer new-access'
    ? response(config, { success: true }) : unauthorized(config);
  const responses = await Promise.all([instance.get('/auth/profile'), instance.get('/playlist'), instance.get('/user/all')]);
  assert.equal(refreshes, 1);
  assert.ok(responses.every(result => result.data.success));
  assert.equal(store.getState().auth.accessToken, 'new-access');
  assert.equal(localStorage.getItem('accessToken'), 'new-access');
});

test('failed refresh clears local authentication without recursively calling logout', async () => {
  let refreshes = 0;
  axios.defaults.adapter = async config => { refreshes++; return unauthorized(config); };
  instance.defaults.adapter = unauthorized;
  await assert.rejects(instance.get('/auth/profile'));
  assert.equal(refreshes, 1);
  assert.equal(store.getState().auth.isAuthenticated, false);
  assert.equal(store.getState().auth.accessToken, null);
  assert.equal(localStorage.getItem('refreshToken'), null);
});

test('invalid login does not trigger refresh or sign out a separate existing session', async () => {
  instance.defaults.adapter = unauthorized;
  await assert.rejects(instance.post('/auth/login', { email: 'user@example.com', password: 'wrong-password' }));
  assert.equal(store.getState().auth.accessToken, 'old-access');
});

test('Google callback exchanges a one-time code instead of sending a Google access token', async () => {
  instance.defaults.adapter = async config => {
    assert.equal(config.url, '/auth/google/callback');
    assert.deepEqual(JSON.parse(config.data), { code: 'one-time-code' });
    return response(config, { success: true });
  };
  await require('../src/services/authService.ts').authService.loginWithGoogle('one-time-code');
});

test('logout authenticates the server request before clearing local state and the player', async () => {
  instance.defaults.adapter = async config => {
    assert.equal(config.url, '/auth/logout');
    assert.equal(config.headers.Authorization, 'Bearer old-access');
    assert.equal(localStorage.getItem('accessToken'), 'old-access');
    return response(config, { success: true });
  };
  store.dispatch({ type: 'QUEUE', payload: [{ id: 1 }] });
  await store.dispatch(logout());
  assert.equal(store.getState().auth.user, null);
  assert.equal(localStorage.getItem('accessToken'), null);
  assert.deepEqual(store.getState().player.queue, []);
});

test('a stale refresh response cannot restore a session after logout', async () => {
  let completeRefresh;
  axios.defaults.adapter = config => new Promise(resolve => { completeRefresh = () => resolve(response(config, { accessToken: 'stale-access', refreshToken: 'refresh' })); });
  instance.defaults.adapter = unauthorized;
  const pending = instance.get('/auth/profile');
  const rejected = assert.rejects(pending);
  while (!completeRefresh) await new Promise(resolve => setImmediate(resolve));
  store.dispatch({ type: 'LOGOUT' });
  saved.clear();
  completeRefresh();
  await rejected;
  assert.equal(store.getState().auth.accessToken, null);
  assert.equal(localStorage.getItem('accessToken'), null);
});

test('logout refreshes an expired access token before revoking the server session', async () => {
  let revoked = false;
  axios.defaults.adapter = async config => response(config, { accessToken: 'new-access', refreshToken: 'refresh' });
  instance.defaults.adapter = async config => {
    if (config.headers.Authorization !== 'Bearer new-access') return unauthorized(config);
    revoked = config.url === '/auth/logout';
    return response(config, { success: true });
  };
  await store.dispatch(logout());
  assert.equal(revoked, true);
  assert.equal(store.getState().auth.accessToken, null);
});

test('registration alone does not mark a guest as authenticated', () => {
  store.dispatch({ type: 'LOGOUT' });
  store.dispatch({ type: 'REGISTER_SUCCESS', payload: { id: 2, email: 'new@example.com' } });
  assert.equal(store.getState().auth.isAuthenticated, false);
  assert.equal(store.getState().auth.user, null);
});

test('an older logout response does not clear a newer login', async () => {
  let completeLogout;
  instance.defaults.adapter = config => new Promise(resolve => { completeLogout = () => resolve(response(config, { success: true })); });
  const pending = store.dispatch(logout());
  while (!completeLogout) await new Promise(resolve => setImmediate(resolve));
  saveTokens('second-access', 'second-refresh');
  store.dispatch({ type: 'LOGIN_SUCCESS', payload: { user: { id: 2 }, accessToken: 'second-access', refreshToken: 'second-refresh' } });
  completeLogout();
  await pending;
  assert.equal(store.getState().auth.user.id, 2);
  assert.equal(localStorage.getItem('accessToken'), 'second-access');
});

test('different login sessions never share a pending refresh', async () => {
  let completeOldRefresh;
  let refreshes = 0;
  axios.defaults.adapter = config => {
    refreshes++;
    if (JSON.parse(config.data).refreshToken === 'refresh') {
      return new Promise(resolve => { completeOldRefresh = () => resolve(response(config, { accessToken: 'stale-access', refreshToken: 'refresh' })); });
    }
    return Promise.resolve(response(config, { accessToken: 'second-new-access', refreshToken: 'second-refresh' }));
  };
  instance.defaults.adapter = config => config.headers.Authorization === 'Bearer second-new-access'
    ? Promise.resolve(response(config, { success: true })) : unauthorized(config);
  const previous = instance.get('/auth/profile');
  const previousRejected = assert.rejects(previous);
  while (!completeOldRefresh) await new Promise(resolve => setImmediate(resolve));
  saveTokens('second-access', 'second-refresh');
  store.dispatch({ type: 'LOGIN_SUCCESS', payload: { user: { id: 2 }, accessToken: 'second-access', refreshToken: 'second-refresh' } });
  const next = await instance.get('/auth/profile');
  completeOldRefresh();
  await previousRejected;
  assert.equal(next.data.success, true);
  assert.equal(refreshes, 2);
  assert.equal(store.getState().auth.accessToken, 'second-new-access');
});

test('playlist detail is cleared while loading and after an inaccessible playlist response', () => {
  store.dispatch({ type: 'GET_PLAYLIST_ID_SUCCESS', playlistId: { id: 5, tracks: [{ id: 2 }] } });
  store.dispatch({ type: 'GET_PLAYLIST_ID_REQUEST' });
  assert.equal(store.getState().playlist.playlistId, null);
  assert.equal(store.getState().playlist.loading, true);
  store.dispatch({ type: 'GET_PLAYLIST_ERROR', error: 'Not found' });
  assert.equal(store.getState().playlist.playlistId, null);
  assert.equal(store.getState().playlist.loading, false);
});

test('super admin enters the admin area while account management respects the hierarchy', () => {
  const { isAdmin, canManageAccount } = require('../src/utils/roles.ts');
  const root = { id: 100, role: 'super_admin' };
  const admin = { id: 99, role: 'admin', permissions: ['users:read', 'users:lock'] };
  const user = { id: 1, role: 'user' };
  assert.equal(isAdmin(root.role), true);
  assert.equal(isAdmin(user.role), false);
  assert.equal(canManageAccount(root, admin), true);
  assert.equal(canManageAccount(admin, user), true);
  assert.equal(canManageAccount(admin, root), false);
  assert.equal(canManageAccount(root, root), false);
});

test('admin permissions are deny-by-default and scoped to an individual action', () => {
  const { hasPermission, canManageAccount } = require('../src/utils/roles.ts');
  assert.equal(hasPermission({ role: 'admin' }, 'tracks:delete'), false);
  const admin = { id: 1, role: 'admin', permissions: ['tracks:read', 'tracks:create', 'users:restore'] };
  assert.equal(hasPermission(admin, 'tracks:create'), true);
  assert.equal(hasPermission(admin, 'tracks:delete'), false);
  assert.equal(hasPermission({ ...admin, permissions: ['rbac:manage'] }, 'rbac:manage'), false);
  assert.equal(hasPermission({ role: 'super_admin' }, 'rbac:manage'), true);
  assert.equal(canManageAccount(admin, { id: 2, role: 'user' }, 'restore'), true);
  assert.equal(canManageAccount(admin, { id: 2, role: 'user' }, 'delete'), false);
});

test('permission selection adds read prerequisites and removing read clears the whole group', () => {
  const { togglePermission } = require('../src/utils/roles.ts');
  const selected = togglePermission(['albums:read'], 'tracks:create', true);
  assert.deepEqual(new Set(selected), new Set(['albums:read', 'tracks:read', 'tracks:create']));
  assert.deepEqual(togglePermission(selected, 'tracks:read', false), ['albums:read']);
  assert.equal(togglePermission(selected, 'tracks:create', true).length, selected.length);
});

test('upload validation uses the correct image/audio limits and accepts exact boundaries', () => {
  const { validateUploadFile, UploadValidationError } = require('../src/utils/upload.ts');
  const limits = { imageMaxBytes: 10 * 1024 * 1024, audioMaxBytes: 100 * 1024 * 1024 };
  assert.doesNotThrow(() => validateUploadFile({ name: 'photo.png', size: limits.imageMaxBytes }, 'image', limits));
  assert.doesNotThrow(() => validateUploadFile({ name: 'song.mp3', size: limits.audioMaxBytes }, 'audio', limits));
  assert.throws(() => validateUploadFile({ name: 'photo.png', size: limits.imageMaxBytes + 1 }, 'image', limits), UploadValidationError);
  assert.throws(() => validateUploadFile({ name: 'song.mp3', size: limits.audioMaxBytes + 1 }, 'audio', limits), /100 MB/);
});

test('multipart uploads fetch server limits and receive a longer upload timeout', async () => {
  axios.defaults.adapter = async config => {
    assert.equal(config.url, 'http://test.local/upload-limits');
    return response(config, { imageMaxBytes: 10 * 1024 * 1024, audioMaxBytes: 100 * 1024 * 1024 });
  };
  instance.defaults.adapter = async config => {
    assert.equal(config.timeout, 120000);
    return response(config, { success: true });
  };
  const data = new FormData(); data.append('image', new Blob(['small image'], { type: 'image/png' }), 'small.png');
  await instance.post('/track', data);
});

test('oversized images are rejected before a write request without signing out', async () => {
  let sent = false;
  instance.defaults.adapter = async config => { sent = true; return response(config, {}); };
  const data = new FormData(); data.append('image', new Blob([new Uint8Array(11 * 1024 * 1024)], { type: 'image/png' }), 'large.png');
  await assert.rejects(instance.post('/track', data), /10 MB/);
  assert.equal(sent, false);
  assert.equal(store.getState().auth.isAuthenticated, true);
});

test('a proxy 413 error produces useful feedback without exposing an HTML response', () => {
  const { uploadErrorMessage } = require('../src/utils/upload.ts');
  const config = { headers: {} };
  const error = new axios.AxiosError('Request failed', 'ERR_BAD_REQUEST', config, null, response(config, '<html>proxy error</html>', 413));
  assert.match(uploadErrorMessage(error, 'Failed'), /413/);
  assert.ok(!uploadErrorMessage(error, 'Failed').includes('<html>'));
});
