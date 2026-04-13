import axios from 'axios';

const API_URL = 'http://localhost:8080/api/fournisseurs';

export const getFournisseurs = () => axios.get(API_URL);
export const createFournisseur = (data) => axios.post(API_URL, data);
export const updateFournisseur = (id, data) => axios.put(`${API_URL}/${id}`, data);
export const deleteFournisseur = (id) => axios.delete(`${API_URL}/${id}`);
