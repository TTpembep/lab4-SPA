import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRoutes, createRoute, updateRoute, updateRoutes, deleteRoute } from '../services/api';
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

const DriverMenu = () => {
  const [routes, setRoutes] = useState([]);
  const [editingRoute, setEditingRoute] = useState(null);
  const [newRoute, setNewRoute] = useState({
    description: '',
    planned_path: '',
    current_path: '',
    status: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const routesRef = useRef([]);
  const updateInterval = useRef(null);

  const navigate = useNavigate();
  const { addToast } = useToast();

  const fetchRoutes = async () => {
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    setIsLoading(true);
    try {
      await createRoute(newRoute);
      setNewRoute({
        description: '',
        planned_path: '',
        current_path: '',
        status: ''
      });
      addToast('Маршрут успешно создан', 'success');
      await fetchRoutes();
    } catch (error) {
      console.error('Error creating route:', error);
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      await updateRoute(editingRoute.id, editingRoute);
      setEditingRoute(null);
      addToast('Маршрут успешно обновлен', 'success');
      await fetchRoutes();
    } catch (error) {
      console.error('Error updating route:', error);
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setIsLoading(true);
    try {
      await deleteRoute(id);
      addToast('Маршрут успешно удален', 'success');
      await fetchRoutes();
    } catch (error) {
      console.error('Error deleting route:', error);
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRoutes = async () => {
    setIsLoading(true);
    try {
      const response = await updateRoutes();
      routesRef.current = response.data;
      setRoutes(response.data);
      addToast('Маршруты успешно обновлены', 'success');
    } catch (error) {
      console.error('Error updating routes:', error);
      handleApiError(error);
    } finally {
      setIsLoading(false);
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
      <td>
        <button onClick={() => setEditingRoute(route)} disabled={isLoading}>
          Изменить
        </button>
        <button onClick={() => handleDelete(route.id)} disabled={isLoading}>
          Удалить
        </button>
      </td>
    </tr>
  );

  return (
<div className="container">
      <div className="header">
        <h1>Панель водителя</h1>
        <div className="button-group">
          <button className="btn logout-btn" onClick={handleLogout}>
            Выйти из системы
          </button>
        </div>
      </div>
      
      {/* Форма для создания нового маршрута */}
      <div>
        <h3>Добавление маршрута</h3>
        <input
          type="text"
          placeholder="Описание"
          value={newRoute.description}
          onChange={(e) => setNewRoute({...newRoute, description: e.target.value})}
        />
        <input
          type="text"
          placeholder="Запланированный путь"
          value={newRoute.planned_path}
          onChange={(e) => setNewRoute({...newRoute, planned_path: e.target.value})}
        />
        <input
          type="text"
          placeholder="Текущий путь"
          value={newRoute.current_path}
          onChange={(e) => setNewRoute({...newRoute, current_path: e.target.value})}
        />
        <input
          type="text"
          placeholder="Статус"
          value={newRoute.status}
          onChange={(e) => setNewRoute({...newRoute, status: e.target.value})}
        />
        <button onClick={handleCreate}>Добавить маршрут</button>
      </div>
      <br />
      {/* Форма для редактирования маршрута */}
      {editingRoute && (
        <div>
          <h2>Редактирование маршрута</h2>
          <input
            type="text"
            value={editingRoute.description}
            onChange={(e) => setEditingRoute({...editingRoute, description: e.target.value})}
          />
          <input
            type="text"
            value={editingRoute.planned_path}
            onChange={(e) => setEditingRoute({...editingRoute, planned_path: e.target.value})}
          />
          <input
            type="text"
            value={editingRoute.current_path}
            onChange={(e) => setEditingRoute({...editingRoute, current_path: e.target.value})}
          />
          <input
            type="text"
            value={editingRoute.status}
            onChange={(e) => setEditingRoute({...editingRoute, status: e.target.value})}
          />
          <button onClick={handleUpdate}>Сохранить</button>
          <button onClick={() => setEditingRoute(null)}>Отмена</button>
        </div>
      )}

      {/* Таблица с маршрутами */}
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
          {routes.map((route) => (
            <tr key={route.id}>
              <td>{route.description}</td>
              <td>{route.planned_path}</td>
              <td>{route.current_path}</td>
              <td className={`status-${route.status}`}>{route.status}</td>
              <td>
                <button onClick={() => setEditingRoute(route)}>Изменить</button>
                <button onClick={() => handleDelete(route.id)}>Удалить</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DriverMenu;