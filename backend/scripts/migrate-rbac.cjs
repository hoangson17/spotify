const path = require('node:path');
const mysql = require('mysql2/promise');

async function migrate(connection) {
  const [columns] = await connection.execute(
    "SELECT DATA_TYPE AS dataType FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'permissions'",
  );
  if (columns.length) {
    if (!['text', 'longtext', 'json'].includes(columns[0].dataType))
      throw new Error('Unexpected users.permissions column type');
    return false;
  }
  await connection.query(
    'ALTER TABLE `users` ADD COLUMN `permissions` TEXT NULL',
  );
  return true;
}

async function main() {
  process.loadEnvFile(path.resolve(__dirname, '../.env'));
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  try {
    const changed = await migrate(connection);
    console.log(
      changed
        ? 'Added users.permissions. Admin permissions must be explicitly assigned by super admin.'
        : 'RBAC schema is already available. Existing permissions were preserved.',
    );
  } finally {
    await connection.end();
  }
}
if (require.main === module)
  main().catch(() => {
    console.error(
      'RBAC migration failed. Check database configuration and schema.',
    );
    process.exitCode = 1;
  });
module.exports = { migrate };
