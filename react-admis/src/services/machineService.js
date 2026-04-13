import axios from "axios";

const API = "http://localhost:8080/api/machines";

export const getMachines = () => axios.get(API);

export const createMachine = (machine) =>
  axios.post(API, machine);

export const deleteMachine = (id) =>
  axios.delete(`${API}/${id}`);

export const updateMachine = (id, machine) =>
  axios.put(`${API}/${id}`, machine);

export const getBySecteur = (secteur) =>
  axios.get(`${API}/secteur/${secteur}`);
