import api from './api';
import { API_ROUTES } from '../constants/API_ROUTES';

export const createCard = async (payload) => {
  const { data } = await api.post(API_ROUTES.CARDS, payload);
  return data;
};

export const updateCard = async (id, payload) => {
  const { data } = await api.patch(`${API_ROUTES.CARDS}/${id}`, payload);
  return data;
};

export const reorderCard = async (payload) => {
  const { data } = await api.patch(`${API_ROUTES.CARDS}/reorder`, payload);
  return data;
};

export const deleteCard = async (id) => {
  const { data } = await api.delete(`${API_ROUTES.CARDS}/${id}`);
  return data;
};
