import React, { useState, useContext } from "react";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
  const { login } = useContext(AuthContext);
  const [loginField, setLoginField] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    try {
      const res = await API.post("auth/login/", {
        login: loginField,
        password,
      });
      login({ login: loginField, id: res.data.user_id }, res.data.access, res.data.refresh);
      navigate("/menu");
    } catch (err) {
      setError(err?.response?.data?.detail || "Ошибка входа");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={loginField} onChange={e => setLoginField(e.target.value)} placeholder="Логин" />
      <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Пароль" />
      <button type="submit">Войти</button>
      {error && <div>{error}</div>}
    </form>
  );
}