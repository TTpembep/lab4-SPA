import React, { useEffect, useState } from "react";
import API from "../api/axios";
import { Link } from "react-router-dom";

export default function RouteList() {
  const [routes, setRoutes] = useState([]);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    API.get(`routes/?page=${page}&search=${filter}`)
      .then(res => {
        setRoutes(res.data.results || res.data);
        setCount(res.data.count || 0);
      });
  }, [page, filter]);

  return (
    <div>
      <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Поиск" />
      <ul>
        {routes.map(r => (
          <li key={r.route_id}>
            <Link to={`/routes/${r.route_id}`}>{r.description}</Link>
          </li>
        ))}
      </ul>
      <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Назад</button>
      <button disabled={routes.length === 0} onClick={() => setPage(page + 1)}>Вперёд</button>
      <div>Страница {page}</div>
    </div>
  );
}