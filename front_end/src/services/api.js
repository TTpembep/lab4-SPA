import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
});

export const handleApiError = (error, addToast) => {
  const { response } = error;
  let errorMessage = 'An error occurred';

  if (response) {
    switch (response.status) {
      case 401:
        errorMessage = 'Unauthorized - Please login again';
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        break;
      case 403:
        errorMessage = 'Forbidden - You don\'t have permission';
        break;
      case 404:
        errorMessage = 'Not Found - The requested resource was not found';
        break;
      case 500:
        errorMessage = 'Server Error - Please try again later';
        break;
      default:
        if (response.data && response.data.detail) {
          errorMessage = response.data.detail;
        } else if (response.data) {
          errorMessage = JSON.stringify(response.data);
        }
    }
  } else {
    errorMessage = error.message || 'Network Error - Please check your connection';
  }

  return Promise.reject(error);
};

const refreshToken = async () => {
  const refresh_token = localStorage.getItem('refresh_token');
  
  if (!refresh_token) {
    throw new Error("No refresh token available");
  }

  try {
    const response = await axiosInstance.post('token/refresh/', {
      refresh: refresh_token  // Убедитесь, что поле называется именно так
    }, {
      headers: {
        'Content-Type': 'application/json'  // Явно указываем тип данных
      }
    });

    const newAccessToken = response.data.access;  // Предполагается, что сервер возвращает { "access": "новый_токен" }
    localStorage.setItem('access_token', newAccessToken);
    return newAccessToken;

  } catch (error) {
    console.error('Refresh token failed:', error.response?.data || error.message);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';  // Перенаправляем на логин при ошибке
    throw error;
  }
};

axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // Если ошибка 401 и это не запрос на обновление токена
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const newAccessToken = await refreshToken();
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

//Методы для работы с маршрутами
const createRoute = (routeData) => {
  return axiosInstance.post('routes/', routeData, {
    headers: getAuthHeaders()
  });
};

const updateRoute = (id, routeData) => {
  return axiosInstance.put(`routes/${id}/`, routeData, {
    headers: getAuthHeaders()
  });
};

const deleteRoute = (id) => {
  return axiosInstance.delete(`routes/${id}/`, {
    headers: getAuthHeaders()
  });
};

const getRoles = () => {
  return axiosInstance.get('roles/');
};

const register = (userData) => {
  return axiosInstance.post('register/', userData);
};

const login = (userData) => {
  return axiosInstance.post('login/', userData);
};

const getRoutes = () => {
  return axiosInstance.get('routes/', {
    headers: getAuthHeaders()
  });
};

export { getRoles, register, login, getRoutes, createRoute, updateRoute, deleteRoute, refreshToken };