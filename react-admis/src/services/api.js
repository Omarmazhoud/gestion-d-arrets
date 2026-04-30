import axios from "axios";

const api = axios.create({
  baseURL: "https://l-dtm-leoni.onrender.com/api",
});

export default api;
