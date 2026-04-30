import axios from "axios";

const API = "https://l-dtm-leoni.onrender.com/api/auth";

export const login = async (email, password) => {
    const response = await axios.post(`${API}/login`, {
        email,
        password
    });
    return response.data;
};
