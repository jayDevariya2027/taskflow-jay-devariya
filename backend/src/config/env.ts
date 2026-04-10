import dotenv from 'dotenv';
dotenv.config();

export const env = {
  port: process.env.PORT || '3000',
  nodeEnv: process.env.NODE_ENV || 'development',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    name: process.env.DB_NAME || 'taskflow',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET || '',
    expiresIn: '24h',
  },
};

// Fail fast if critical env vars are missing
if (!env.jwt.secret) {
  throw new Error('JWT_SECRET is required');
}

if (!env.db.password) {
  throw new Error('DB_PASSWORD is required');
}