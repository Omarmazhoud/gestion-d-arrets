import axios from 'axios';

const API_URL = 'http://localhost:8080/api/pieces-rechange';

export const getPiecesRechange = () => axios.get(API_URL);
export const createPieceRechange = (data) => axios.post(API_URL, data);
export const updatePieceRechange = (id, data) => axios.put(`${API_URL}/${id}`, data);
export const deletePieceRechange = (id) => axios.delete(`${API_URL}/${id}`);
