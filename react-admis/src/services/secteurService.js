import axios from "axios";

const API = "http://localhost:8080/api/secteurs";

export const getSecteurs = () => axios.get(API);

export const createSecteur = (secteur) => axios.post(API, secteur);

export const updateSecteur = (id, secteur) => axios.put(`${API}/${id}`, secteur);

export const deleteSecteur = (id) => axios.delete(`${API}/${id}`);
