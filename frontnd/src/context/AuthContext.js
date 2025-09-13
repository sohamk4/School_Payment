import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [csrfToken, setCsrfToken] = useState('');
  const isFetching = useRef(false);

  const api = useRef(axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    withCredentials: true,
  })).current;

  
  const getCsrfToken = useCallback(async () => {
    if (isFetching.current) return;
    isFetching.current = true;

    try {
      const response = await api.get('/csrf-token');
      setCsrfToken(response.data.csrfToken);
      api.defaults.headers.common['X-CSRF-Token'] = response.data.csrfToken;
    } catch (err) {
      console.error('CSRF token error:', err);
    } finally {
      isFetching.current = false;
    }
  }, [api]); 

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 403) {
          await getCsrfToken();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [api, getCsrfToken]);

  useEffect(() => {
    getCsrfToken();
  }, [getCsrfToken]);

  const login = async (username, password) => {
    try {
      if (!csrfToken) {
        await getCsrfToken();
      }

      const response = await api.post('/auth/login', {
        username: username,
        password: password
      }, {
        headers: {
          'X-CSRF-Token': csrfToken,
        }
      });
            
      if (response.data.success) {
        setUser(username);
        return { success: true };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.status === 403) {
        if (error.response?.data?.success) {
          setUser(username);
          return { success: true };
        }
        return { success: false, message: 'CSRF token validation failed' };
      }
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, csrfToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);