const { test } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcrypt');
const { readConfig, provision } = require('./super-admin.cjs');

const config = () =>
  readConfig({
    SUPER_ADMIN_NAME: 'Super Admin',
    SUPER_ADMIN_EMAIL: 'root@example.test',
    SUPER_ADMIN_PASSWORD: 'a-strong-test-password',
  });
function database(
  existing = [],
  columnType = "enum('user','admin','super_admin')",
) {
  const calls = [];
  return {
    calls,
    async execute(sql, params) {
      calls.push({ sql, params });
      if (sql.includes('GET_LOCK')) return [[{ acquired: 1 }]];
      if (sql.includes('information_schema')) return [[{ columnType }]];
      if (sql.startsWith('SELECT id')) return [existing];
      return [{ affectedRows: 1 }];
    },
    async query(sql) {
      calls.push({ sql });
    },
  };
}

test('requires explicit credentials with a strong password', () => {
  assert.throws(() => readConfig({}), /SUPER_ADMIN_EMAIL/);
  assert.throws(
    () =>
      readConfig({
        SUPER_ADMIN_EMAIL: 'root@example.test',
        SUPER_ADMIN_PASSWORD: '123456',
      }),
    /SUPER_ADMIN_PASSWORD/,
  );
  assert.equal(config().email, 'root@example.test');
});

test('creates a separate account using a bcrypt hash and parameterized SQL', async () => {
  const db = database();
  assert.equal(await provision(db, config()), 'created');
  const inserted = db.calls.find((call) => call.sql.startsWith('INSERT'));
  assert.match(inserted.params[0], /^[0-9a-f-]{36}$/);
  assert.equal(inserted.params[4], 'super_admin');
  assert.equal(inserted.params[2], config().email);
  assert.ok(await bcrypt.compare(config().password, inserted.params[3]));
  assert.notEqual(inserted.params[3], config().password);
  assert.ok(db.calls.some((call) => call.sql.includes('RELEASE_LOCK')));
});

test('repeated runs leave an existing super admin password unchanged', async () => {
  const db = database([
    { id: 1, email: config().email, role: 'super_admin', deletedAt: null },
  ]);
  assert.equal(await provision(db, config()), 'exists');
  assert.ok(!db.calls.some((call) => /^(INSERT|UPDATE)/.test(call.sql)));
});

test('does not promote or overwrite an existing regular account', async () => {
  const db = database([{ id: 1, email: config().email, role: 'user' }]);
  await assert.rejects(provision(db, config()), /No account was changed/);
  assert.ok(!db.calls.some((call) => /^(INSERT|UPDATE)/.test(call.sql)));
});

test('does not create another root account when one already exists', async () => {
  const db = database([
    { id: 1, email: 'other@example.test', role: 'super_admin' },
  ]);
  await assert.rejects(provision(db, config()), /No account was changed/);
});

test('extends the known role enum without touching user rows', async () => {
  const db = database([], "enum('user','admin')");
  await provision(db, config());
  const changes = db.calls.filter((call) => call.sql.startsWith('ALTER'));
  assert.equal(changes.length, 1);
  assert.ok(changes[0].sql.includes("ENUM('user','admin','super_admin')"));
  assert.ok(!db.calls.some((call) => /^(UPDATE|DELETE|DROP)/.test(call.sql)));
});

test('refuses an unexpected schema and releases its lock', async () => {
  const db = database([], 'varchar(100)');
  await assert.rejects(provision(db, config()), /Expected the users.role enum/);
  assert.ok(!db.calls.some((call) => /^(ALTER|INSERT)/.test(call.sql)));
  assert.ok(db.calls.some((call) => call.sql.includes('RELEASE_LOCK')));
});
