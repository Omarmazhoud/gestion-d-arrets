export const getUser = () => {
    return JSON.parse(localStorage.getItem("user"));
};

export const isAuthenticated = () => {
    return !!localStorage.getItem("user");
};

export const logout = () => {
    localStorage.removeItem("user");
};
