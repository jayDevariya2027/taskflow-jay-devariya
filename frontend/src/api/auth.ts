import api from './axios';
import { type AuthResponse } from '../types';

export const register = async (
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> => {
  const res = await api.post('/auth/register', { name, email, password });
  return res.data;
};

export const login = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
};