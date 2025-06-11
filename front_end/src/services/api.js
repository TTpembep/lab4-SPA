import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/';

// Функция для получения CSRF-токена из куки
const getCookie = (name) => {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

const csrfToken = getCookie('csrftoken');

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-CSRFToken': csrfToken,
  },
  withCredentials: true, // Это важно для отправки куки
});

const register = (userData) => {
  return axiosInstance.post('register/', userData);
};

const login = (userData) => {
  return axiosInstance.post('login/', userData);
};

const getRoutes = () => {
  return axiosInstance.get('routes/?format=json');
};

export { register, login, getRoutes };
