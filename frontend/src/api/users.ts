import api from './axios';
import { type Member } from '../types';

export const getUsers = async (): Promise<Member[]> => {
  const res = await api.get('/users');
  return res.data.users;
};