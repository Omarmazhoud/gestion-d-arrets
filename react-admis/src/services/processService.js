import axios from "axios";

const API = "http://172.20.10.2:8080/api/processes";

export const getProcesses = () => axios.get(API);

export const createProcess = (process) => axios.post(API, process);

export const updateProcess = (id, process) => axios.put(`${API}/${id}`, process);

export const deleteProcess = (id) => axios.delete(`${API}/${id}`);
