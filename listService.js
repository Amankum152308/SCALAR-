import api from './api';
import { API_ROUTES } from '../constants/API_ROUTES';

export const createList = async (payload) => {
  const { data } = await api.post(API_ROUTES.LISTS, payload);
  return data;
};

export const updateList = async (id, payload) => {
  const { data } = await api.patch(`${API_ROUTES.LISTS}/${id}`, payload);
  return data;
};

export const deleteList = async (id) => {
  const { data } = await api.delete(`${API_ROUTES.LISTS}/${id}`);
  return data;
};

export const reorderLists = async (payload) => {
  const { data } = await api.patch(`${API_ROUTES.LISTS}/reorder`, payload);
  return data;
};
