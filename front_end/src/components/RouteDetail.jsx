import React, { useEffect, useState } from "react";
import API from "../api/axios";
import { useParams, useNavigate } from "react-router-dom";

export default function RouteDetail() {
  const { id } = useParams();
  const [route, setRoute] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    API.get(`routes/${id}/`).then(res => setRoute(res.data));
  }, [id]);

  const handleDelete = async () => {
    await API.delete(`routes/${id}/`);
    navigate("/menu");
  };

  if (!route) return <div>Загрузка...</div>;

  return (
    <div>
      <h2>{route.description}</h2>
      <div>Статус: {route.status}</div>
      <div>План: {route.planned_path}</div>
      <div>Текущий путь: {route.current_path}</div>
      <button onClick={handleDelete}>Удалить</button>
    </div>
  );
}