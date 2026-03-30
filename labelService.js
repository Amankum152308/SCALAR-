import api from './api';

export const getAllLabels = async () => {
  const { data } = await api.get('/labels');
  return data;
};

export const attachLabel = async (cardId, labelId) => {
  const { data } = await api.post(`/cards/${cardId}/labels`, { labelId });
  return data;
};

export const removeLabel = async (cardId, labelId) => {
  const { data } = await api.delete(`/cards/${cardId}/labels/${labelId}`);
  return data;
};
