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
        setError('Не удалось загрузить роли');
        setLoading(false);
        console.error('Ошибка при загрузке ролей:', err);
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
      const response = await register(formData);
      addToast('Регистрация прошла успешно! Теперь вы можете войти.', 'success');
      navigate('/login');
    } catch (error) {
      const errorData = error.response?.data;
      if (error.response?.status === 400) {
        if (errorData.login) {
          addToast(`Ошибка логина: ${errorData.login.join(', ')}`, 'error');
        } else if (errorData.password) {
          addToast(`Ошибка пароля: ${errorData.password.join(', ')}`, 'error');
        } else if (errorData.non_field_errors) {
          addToast(errorData.non_field_errors.join(', '), 'error');
        } else {
          addToast('Проверьте введённые данные: ' + JSON.stringify(errorData, null, 2), 'error');
        }
      } else {
        handleApiError(error, addToast);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && roles.length === 0) return <div>Loading roles...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit}>
        <h2>Регистрация в системе</h2>

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
        <br /> <br />

        <button type="submit" disabled={loading}>
          {loading ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>

        <div className="auth-links">
          <Link to="/login">Вернуться ко входу</Link>
        </div>
      </form>
    </div>
  );
};

export default Register;
