import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, handleApiError } from '../services/api';
import { useToast } from '../context/ToastContext';

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
    
    addToast('Вы успешно авторизовались!', 'success');
    navigate('/menu');
    
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
        <h2>Вход в систему</h2>

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