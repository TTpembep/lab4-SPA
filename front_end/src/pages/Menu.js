import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRoutes, updateRoutes } from '../services/api';
import { useToast } from '../context/ToastContext';
import './styles.css';

const areRoutesEqual = (a, b) => {
  if (a.length !== b.length) return false;
  return a.every((route, index) => 
    route.id === b[index].id &&
    route.description === b[index].description &&
    route.planned_path === b[index].planned_path &&
    route.current_path === b[index].current_path &&
    route.status === b[index].status
  );
};

const Menu = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const routesRef = useRef([]);
  const updateInterval = useRef(null);

  const navigate = useNavigate();
  const { addToast } = useToast();

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const response = await getRoutes();
      const newRoutes = response.data;
      
      if (!areRoutesEqual(newRoutes, routesRef.current)) {
        routesRef.current = newRoutes;
        setRoutes(newRoutes);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRoutes = async () => {
    try {
      const response = await updateRoutes();
      routesRef.current = response.data;
      setRoutes(response.data);
      addToast('Маршруты успешно обновлены', 'success');
    } catch (error) {
      console.error('Error updating routes:', error);
      handleApiError(error);
    }
  };

  const handleLogout = () => {
    clearInterval(updateInterval.current);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
    addToast('Вы успешно вышли из системы', 'success');
  };

  const handleApiError = (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        addToast('Сессия истекла. Пожалуйста, войдите снова', 'error');
        handleLogout();
      } else {
        addToast(error.response.data?.error || 'Ошибка сервера', 'error');
      }
    } else {
      addToast(error.message || 'Неизвестная ошибка', 'error');
    }
  };

  useEffect(() => {
    fetchRoutes();
    updateInterval.current = setInterval(fetchRoutes, 5000);
    return () => clearInterval(updateInterval.current);
  }, []);

  const renderRouteRow = (route) => (
    <tr key={route.id}>
      <td>{route.description}</td>
      <td>{route.planned_path}</td>
      <td>{route.current_path}</td>
      <td className={`status-${route.status}`}>{route.status}</td>
      <td>placeholder</td>
    </tr>
  );

  return (
    <div className="container">
      <div className="header">
        <h1>Панель диспетчера маршрутов</h1>
        <div className="button-group">
          <button className="btn update-btn" onClick={handleUpdateRoutes}>
            Обновить маршруты
          </button>
          <button className="btn logout-btn" onClick={handleLogout}>
            Выйти из системы
          </button>
        </div>
      </div>
      
      {loading && routes.length === 0 ? (
        <p>Загрузка маршрутов...</p>
      ) : routes.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Описание</th>
              <th>Запланированный путь</th>
              <th>Текущий путь</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {routes.map(renderRouteRow)}
          </tbody>
        </table>
      ) : (
        <p>Маршруты отсутствуют.</p>
      )}
    </div>
  );
};

export default Menu;