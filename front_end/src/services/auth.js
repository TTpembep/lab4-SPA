import axios from 'axios';

const API_URL = 'http://localhost:8000/api/auth/';

const register = (userData) => {
  return axios.post(API_URL + 'register/', userData);
};

const login = (userData) => {
  return axios.post(API_URL + 'login/', userData);
};

const getProfile = (token) => {
  return axios.get(API_URL + 'profile/', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

export { register, login, getProfile };
