import api from './api';

export const getAllMembers = async () => {
  const { data } = await api.get('/members');
  return data;
};

export const assignMember = async (cardId, memberId) => {
  const { data } = await api.post(`/cards/${cardId}/members`, { memberId });
  return data;
};

export const unassignMember = async (cardId, memberId) => {
  const { data } = await api.delete(`/cards/${cardId}/members/${memberId}`);
  return data;
};
