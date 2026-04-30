import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://172.20.10.2:8080/api",
});

export default api;
