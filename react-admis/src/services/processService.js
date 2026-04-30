import axios from "axios";

const API = "https://l-dtm-leoni.onrender.com/api/processes";

export const getProcesses = () => axios.get(API);

export const createProcess = (process) => axios.post(API, process);

export const updateProcess = (id, process) => axios.put(`${API}/${id}`, process);

export const deleteProcess = (id) => axios.delete(`${API}/${id}`);
