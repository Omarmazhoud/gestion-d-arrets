import api from "./api";
export const getUsers = async () => {
    const response = await api.get("/utilisateurs");
    return response.data;
};

export const createUser = async (user) => {
    const response = await api.post("/utilisateurs", user);
    return response.data;
};

export const validateUser = async (id) => {
    const response = await api.put(`/utilisateurs/${id}/valider`);
    return response.data;
};

export const deleteUser = async (id) => {
    await api.delete(`/utilisateurs/${id}`);
};
// 🔥 AJOUTER ÇA
export const updateUser = async (id, user) => {
  const response = await api.put(`/utilisateurs/${id}`, user);
  return response.data;
};

export const getOnlineExecuteurs = async (type) => {
    const response = await api.get(`/utilisateurs/online/executeur/${type}`);
    return response.data;
};
