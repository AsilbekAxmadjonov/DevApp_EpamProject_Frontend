import { useState, useEffect, useCallback } from "react";

export const useAuth = () => {
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState(null);
  const [firstName, setFirstName] = useState(null);
  const [lastName, setLastName] = useState(null);
  const [ready, setReady] = useState(false);

  const login = useCallback((id, jwt, uname, fName = "", lName = "") => {
    localStorage.setItem(
      "authData",
      JSON.stringify({
        userId: id,
        token: jwt,
        username: uname,
        firstName: fName,
        lastName: lName,
      })
    );
    setToken(jwt);
    setUserId(id);
    setUsername(uname);
    setFirstName(fName);
    setLastName(lName);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUserId(null);
    setUsername(null);
    setFirstName(null);
    setLastName(null);
    localStorage.removeItem("authData");
  }, []);

  useEffect(() => {
    const authData = JSON.parse(localStorage.getItem("authData"));
    if (authData && authData.token) {
      login(
        authData.userId,
        authData.token,
        authData.username,
        authData.firstName,
        authData.lastName
      );
    }
    setReady(true);
  }, [login]);

  return { token, userId, username, firstName, lastName, ready, login, logout };
};
