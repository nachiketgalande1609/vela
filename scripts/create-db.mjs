// Creates the auth_template_db database if it doesn't exist.
// Uses the mysql2 driver bundled with Prisma (no extra install needed).
import { createConnection } from 'mysql2/promise'

const config = {
  host: 'ripple-my-sql-server-ripple.h.aivencloud.com',
  port: 12280,
  user: 'avnadmin',
  password: 'process.env.AIVEN_DB_PASSWORD',
  ssl: { rejectUnauthorized: false },
}

const connection = await createConnection(config)
await connection.execute(
  'CREATE DATABASE IF NOT EXISTS `auth_template_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;'
)
console.log('✅ Database auth_template_db is ready.')
await connection.end()
