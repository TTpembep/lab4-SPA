import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, handleApiError } from '../services/api';
import { useToast } from '../context/ToastContext';
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
});

const Login = () => {
  const [formData, setFormData] = useState({
    login: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  try {
    const response = await login(formData);
    
    localStorage.setItem('access_token', response.data.token);
    localStorage.setItem('refresh_token', response.data.refresh);

    // 3. Получаем информацию о текущем пользователе
    const userInfoResponse = await axiosInstance.get('users/', {
      headers: {
        'Authorization': `Bearer ${response.data.token}`
      }
    });
    
    // 4. Находим текущего пользователя по логину
    const currentUser = userInfoResponse.data.find(user => user.login === formData.login);
    
    if (!currentUser) {
      throw new Error('Пользователь не найден');
    }
    
    // 5. Определяем роль пользователя (предполагаем, что роль хранится в поле 'role')
    const userRole = currentUser.role; 
    addToast('Вы успешно авторизовались!', 'success');
        // Перенаправляем в зависимости от роли
    if (userRole === 1) {
      navigate('/menu');
    } else if (userRole === 2) {
      navigate('/drivermenu');
    } else {
      // Если роль неизвестна, перенаправляем на страницу по умолчанию
      navigate('/menu');
      addToast('Неизвестная роль пользователя', 'warning');
    }
    
  } catch (error) {
    if (error.response?.status === 400) {
      if (error.response.data?.non_field_errors) {  //Обработка ошибок валидации
        addToast(error.response.data.non_field_errors.join(', '), 'error');
      } else {
        addToast('Неверные данные для входа. Проверьте логин и пароль', 'error');
      }
    } else if (error.response?.status === 401) {
      addToast('Неверный логин или пароль', 'error');
    } else {
      handleApiError(error, addToast);
    }
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit}>
        <h2>Система безопасности в такси</h2>

        <input type="text" name="login" placeholder="Логин" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Пароль" onChange={handleChange} required />
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Вход...' : 'Войти'}
        </button>
        
        <div className="auth-links">
          <Link to="/register">Регистрация</Link>
        </div>
      </form>
    </div>
  );
};

export default Login;