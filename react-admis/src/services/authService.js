import axios from "axios";

const API = "http://172.20.10.2:8080/api/auth";

export const login = async (email, password) => {
    const response = await axios.post(`${API}/login`, {
        email,
        password
    });
    return response.data;
};
