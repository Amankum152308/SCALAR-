import api from './api';

export const addChecklistItem = async (cardId, title) => {
  const { data } = await api.post(`/cards/${cardId}/checklist`, { title });
  return data;
};

export const updateChecklistItem = async (itemId, payload) => {
  const { data } = await api.patch(`/checklist/${itemId}`, payload);
  return data;
};

export const removeChecklistItem = async (itemId) => {
  const { data } = await api.delete(`/checklist/${itemId}`);
  return data;
};
