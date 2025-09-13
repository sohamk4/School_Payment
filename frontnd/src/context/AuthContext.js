// src/context/AuthContext.js
import React, { createContext,useContext, useState, useEffect, useRef } from "react";
import axios from "axios";


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [csrfToken, setCsrfToken] = useState('');
  const isFetching = useRef(false);

  const getCsrfToken = async () => {
    if (isFetching.current || csrfToken) return;
    isFetching.current = true;
    
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/csrf-token`, {
        withCredentials: true,
      });

      setCsrfToken(response.data.csrfToken);

    } catch (err) {
      console.error('CSRF token error:', err);
    } finally {
      isFetching.current = false;
    }
  };

  // If token exists, set default axios headers
  useEffect(() => {
    getCsrfToken(); 

  }, []);

  const login = async (username, password) => {
    try {
      console.log(process.env.REACT_APP_API_BASE_URL);
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/auth/login`,
        {
          username: username,
          password: password
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
          },
          withCredentials: true
        }
      );
            
      if (response.data.success) {
        setUser(username);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
