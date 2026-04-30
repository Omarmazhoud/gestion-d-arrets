import axios from 'axios';

const API_URL = 'https://l-dtm-leoni.onrender.com/api/notifications-pieces';

export const getNotificationsPiece = () => axios.get(API_URL);
export const getAllNotificationsPiece = () => axios.get(`${API_URL}/all`);
export const markNotificationAsRead = (id) => axios.put(`${API_URL}/${id}/read`);
