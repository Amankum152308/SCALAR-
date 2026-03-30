import api from './api';
import { API_ROUTES } from '../constants/API_ROUTES';

export const getAllBoards = async () => {
  const { data } = await api.get(API_ROUTES.BOARDS);
  return data;
};

export const getBoardById = async (id) => {
  const { data } = await api.get(`${API_ROUTES.BOARDS}/${id}`);
  return data;
};

// We will expand this as more Board-level functions are needed
export const createBoard = async (payload) => {
  const { data } = await api.post(API_ROUTES.BOARDS, payload);
  return data;
};
