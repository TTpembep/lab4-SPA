import React, { useEffect, useState } from 'react';
import { getRoutes } from '../services/api';

const RoutesTable = () => {
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await getRoutes();
        setRoutes(response.data);
      } catch (error) {
        console.error('Error fetching routes:', error);
      }
    };

    fetchRoutes();
  }, []);

  return (
    <div>
      <h1>Routes</h1>
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Planned Path</th>
            <th>Current Path</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {routes.map((route) => (
            <tr key={route.id}>
              <td>{route.description}</td>
              <td>{route.planned_path}</td>
              <td>{route.current_path}</td>
              <td>{route.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RoutesTable;
