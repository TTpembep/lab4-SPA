import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
});

const register = (userData) => {
  return axiosInstance.post('register/', userData);
};

const login = (userData) => {
  return axiosInstance.post('login/', userData);
};

const getRoutes = () => {
  const token = localStorage.getItem('access_token'); // Достаём токен

  return axiosInstance.get('routes/', {
    headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    },
  });
};

export { register, login, getRoutes };
