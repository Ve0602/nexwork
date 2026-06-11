import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null);
  const [token, setToken] = useState(localStorage.getItem('nex_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.get(`${API}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => setUser(r.data.user))
        .catch(() => { setToken(null); localStorage.removeItem('nex_token'); })
        .finally(() => setLoading(false));
    } else { setLoading(false); }
  }, [token]);

  const login = async (email, password) => {
    const { data } = await axios.post(`${API}/api/auth/login`, { email, password });
    localStorage.setItem('nex_token', data.token);
    setToken(data.token); setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await axios.post(`${API}/api/auth/register`, payload);
    localStorage.setItem('nex_token', data.token);
    setToken(data.token); setUser(data.user);
    return data.user;
  };

  const loginWithToken = (newToken, newUser) => {
    localStorage.setItem('nex_token', newToken);
    setToken(newToken); setUser(newUser);
  };

  const updateUser = (updates) => setUser(prev => ({ ...prev, ...updates }));

  const logout = () => {
    localStorage.removeItem('nex_token');
    setToken(null); setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, loginWithToken, updateUser, logout, loading, API }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
