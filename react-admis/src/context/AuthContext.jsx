import { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    if (user && user.id) {
      try {
        await fetch(`http://172.20.10.2:8080/api/auth/logout/${user.id}`, { method: 'POST' });
      } catch (error) {
        console.error("Erreur déconnexion:", error);
      }
    }
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
