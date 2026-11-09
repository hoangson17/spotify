const path = require('node:path');
const { randomUUID } = require('node:crypto');
const bcrypt = require('bcrypt');

function readConfig(env) {
  const email = String(env.SUPER_ADMIN_EMAIL || '')
    .trim()
    .toLowerCase();
  const name = String(env.SUPER_ADMIN_NAME || 'Super Admin').trim();
  const password = env.SUPER_ADMIN_PASSWORD;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 100) {
    throw new Error('Set a valid SUPER_ADMIN_EMAIL in backend/.env');
  }
  if (!name || name.length > 30)
    throw new Error('SUPER_ADMIN_NAME must contain 1 to 30 characters');
  if (
    typeof password !== 'string' ||
    password.length < 12 ||
    Buffer.byteLength(password, 'utf8') > 72
  ) {
    throw new Error(
      'SUPER_ADMIN_PASSWORD must contain at least 12 characters and at most 72 bytes',
    );
  }
  return { email, name, password };
}

async function ensureRoleSchema(connection) {
  const [columns] = await connection.execute(
    `SELECT COLUMN_TYPE AS columnType FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'role'`,
  );
  const type = columns[0]?.columnType;
  if (type === "enum('user','admin','super_admin')") return;
  if (type !== "enum('user','admin')") {
    throw new Error(
      'Expected the users.role enum (user, admin). Prepare the database schema before provisioning.',
    );
  }
  // Add one enum value; preserve rows and existing role assignments. No synchronize/drop.
  await connection.query(
    "ALTER TABLE `users` MODIFY COLUMN `role` ENUM('user','admin','super_admin') NOT NULL DEFAULT 'user'",
  );
}

async function provision(connection, config) {
  const [lock] = await connection.execute(
    "SELECT GET_LOCK('spotify-super-admin-bootstrap', 10) AS acquired",
  );
  if (lock[0]?.acquired !== 1)
    throw new Error('Another super admin provisioning command is running');
  try {
    await ensureRoleSchema(connection);
    const [existing] = await connection.execute(
      'SELECT id, email, role, deletedAt FROM users WHERE email = ? OR role = ?',
      [config.email, 'super_admin'],
    );
    if (existing.length) {
      if (
        existing.length === 1 &&
        existing[0].email.toLowerCase() === config.email &&
        existing[0].role === 'super_admin' &&
        !existing[0].deletedAt
      ) {
        return 'exists';
      }
      throw new Error(
        'The email is already used or a different super admin exists. No account was changed.',
      );
    }
    const hash = await bcrypt.hash(config.password, 12);
    await connection.execute(
      'INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [randomUUID(), config.name, config.email, hash, 'super_admin'],
    );
    return 'created';
  } finally {
    await connection.execute(
      "SELECT RELEASE_LOCK('spotify-super-admin-bootstrap')",
    );
  }
}

async function main() {
  process.loadEnvFile(path.resolve(__dirname, '../.env'));
  const config = readConfig(process.env);
  if (process.argv.includes('--check')) {
    console.log(
      'Super admin configuration is valid. No database changes were made.',
    );
    return;
  }
  const mysql = require('mysql2/promise');
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    const result = await provision(connection, config);
    console.log(
      result === 'created'
        ? 'Super admin created. Sign in using the credentials configured in backend/.env.'
        : 'Super admin already exists. Its password and profile were left unchanged.',
    );
  } finally {
    if (connection) await connection.end();
  }
}

if (require.main === module) {
  main().catch((error) => {
    // Do not log driver errors or SQL parameters that could contain credentials.
    const message = error?.code
      ? 'Database operation failed. Check DB configuration and permissions.'
      : error.message;
    console.error(message);
    process.exitCode = 1;
  });
}

module.exports = { readConfig, ensureRoleSchema, provision };
