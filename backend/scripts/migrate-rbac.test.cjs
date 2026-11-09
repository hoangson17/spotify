const { test } = require('node:test');
const assert = require('node:assert/strict');
const { migrate } = require('./migrate-rbac.cjs');

test('adds a nullable permissions column without changing existing accounts', async () => {
  const queries = [];
  assert.equal(
    await migrate({
      execute: async () => [[]],
      query: async (sql) => queries.push(sql),
    }),
    true,
  );
  assert.deepEqual(queries, [
    'ALTER TABLE `users` ADD COLUMN `permissions` TEXT NULL',
  ]);
});
test('rerunning migration preserves configured permissions', async () => {
  assert.equal(
    await migrate({
      execute: async () => [[{ dataType: 'text' }]],
      query: async () => {
        throw new Error('Unexpected mutation');
      },
    }),
    false,
  );
});
test('refuses an incompatible existing column', async () => {
  await assert.rejects(
    migrate({
      execute: async () => [[{ dataType: 'int' }]],
      query: async () => {},
    }),
    /Unexpected/,
  );
});
