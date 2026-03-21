import mysql from 'mysql2/promise';
import path from 'path';
import dotenv from 'dotenv';

// Load .env from root
dotenv.config({ path: path.join(process.cwd(), '../.env') });

// Create a connection pool to the MySQL database
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'exportrack_ai',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined
});

// Verify connection
pool.getConnection()
  .then(conn => {
    console.log('API Database connection successful');
    conn.release();
  })
  .catch(err => {
    console.error('API Database connection failed:', err.message);
  });

export default pool;
