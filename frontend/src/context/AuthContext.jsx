import { createContext } from "react";
import { useAuth } from "../hooks/useAuth";

export const AuthContext = createContext({
  token: null,
  userId: null,
  username: null,
  firstName: null,
  lastName: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
  ready: false,
});

export default function AuthContextProvider({ children }) {
  const { token, userId, username, firstName, lastName, login, logout, ready } =
    useAuth();
  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        token,
        userId,
        username,
        firstName,
        lastName,
        login,
        logout,
        isAuthenticated,
        ready,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
