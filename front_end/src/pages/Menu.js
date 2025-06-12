import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRoutes, createRoute, updateRoute, deleteRoute } from '../services/api';
import { useToast } from '../context/ToastContext';

const RoutesTable = () => {
  const [routes, setRoutes] = useState([]);
  const [editingRoute, setEditingRoute] = useState(null);
  const [newRoute, setNewRoute] = useState({
    description: '',
    planned_path: '',
    current_path: '',
    status: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchRoutes();
  }, []);
  const { addToast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
    addToast('Вы успешно вышли из системы', 'success');
  };

  const fetchRoutes = async () => {
    try {
      const response = await getRoutes();
      setRoutes(response.data);
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  const handleCreate = async () => {
    try {
      await createRoute(newRoute);
      setNewRoute({
        description: '',
        planned_path: '',
        current_path: '',
        status: ''
      });
      fetchRoutes();
    } catch (error) {
      console.error('Error creating route:', error);
    }
  };

  const handleUpdate = async () => {
    try {
      await updateRoute(editingRoute.id, editingRoute);
      setEditingRoute(null);
      fetchRoutes();
    } catch (error) {
      console.error('Error updating route:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteRoute(id);
      fetchRoutes();
    } catch (error) {
      console.error('Error deleting route:', error);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Панель отслеживания маршрутов авто.</h1>
        <button 
          onClick={handleLogout}
          style={{ padding: '8px 16px', background: '#f44336',
          color: 'white', border: 'none', borderRadius: '4px',
          cursor: 'pointer'}}> Выйти из системы
        </button>
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
              <td>{route.status}</td>
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

export default RoutesTable;