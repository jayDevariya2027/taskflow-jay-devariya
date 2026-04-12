import { query } from '../db';

export const getAllUsers = async () => {
  const result = await query(
    'SELECT id, name, email FROM users ORDER BY name ASC',
    []
  );
  return result.rows;
};