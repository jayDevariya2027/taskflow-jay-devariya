import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../db';
import { env } from '../config/env';

const BCRYPT_ROUNDS = 12;

export const registerUser = async (
  name: string,
  email: string,
  password: string
) => {
  // Check if email already exists
  const existing = await query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );

  if (existing.rows.length > 0) {
    throw { status: 400, message: 'email already in use' };
  }

  const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const result = await query(
    `INSERT INTO users (name, email, password)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, created_at`,
    [name, email, hashed]
  );

  return result.rows[0];
};

export const loginUser = async (email: string, password: string) => {
  const result = await query(
    'SELECT id, name, email, password FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    throw { status: 401, message: 'invalid credentials' };
  }

  const user = result.rows[0];
  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    throw { status: 401, message: 'invalid credentials' };
  }

  const token = jwt.sign(
    { user_id: user.id, email: user.email },
    env.jwt.secret,
    { expiresIn: '24h' }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  };
};