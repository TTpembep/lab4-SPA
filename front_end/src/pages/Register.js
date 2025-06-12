import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { handleApiError, register, getRoles } from '../services/api';
import { useToast } from '../context/ToastContext';

const Register = () => {
  const [formData, setFormData] = useState({
    login: '',
    password: '',
    first_name: '',
    last_name: '',
    role_id: ''
  });

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await getRoles();
        setRoles(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load roles');
        setLoading(false);
        console.error('Error fetching roles:', err);
      }
    };

    fetchRoles(); 
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    console.log('Отправка данных:', formData);
    const response = await register(formData);
    console.log('Ответ сервера:', response.data);
    
    addToast('Регистрация прошла успешно! Теперь вы можете войти.', 'success');
    navigate('/login');
  } catch (error) {
    console.error('Полная ошибка:', error);
    console.error('Данные ошибки:', error.response?.data); // Логируем детали ошибки
    
    if (error.response?.status === 400) {
      // Обработка специфических ошибок валидации
      const errorData = error.response.data;
      
      if (errorData.login) {
        addToast(`Ошибка логина: ${errorData.login.join(', ')}`, 'error');
      } else if (errorData.password) {
        addToast(`Ошибка пароля: ${errorData.password.join(', ')}`, 'error');
      } else if (errorData.non_field_errors) {
        addToast(errorData.non_field_errors.join(', '), 'error');
      } else {
        // Общая обработка для других 400 ошибок
        addToast('Проверьте введённые данные: ' + 
          JSON.stringify(errorData, null, 2), 'error');
      }
    } else {
      handleApiError(error, addToast);
    }
  } finally {
    setLoading(false);
  }
};

  if (loading) {
    return <div>Loading roles...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="login" placeholder="Логин" onChange={handleChange} required />
      <input type="password" name="password" placeholder="Пароль" onChange={handleChange} required />
      <input type="text" name="first_name" placeholder="Имя" onChange={handleChange} required />
      <input type="text" name="last_name" placeholder="Фамилия" onChange={handleChange} required />
      <select name="role_id" onChange={handleChange} required>
        <option value="">Выбор роли</option>
        {roles.map((role) => (
          <option key={role.id} value={role.id}>{role.type}</option>
        ))}
      </select>
      <button type="submit">Зарегистрироваться</button>
      <div><Link to="/login">Вернуться ко входу</Link></div>
    </form>
  );
};

export default Register;