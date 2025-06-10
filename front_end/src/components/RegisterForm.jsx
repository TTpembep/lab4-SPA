import React, { useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function RegisterForm() {
  const [form, setForm] = useState({ login: "", password: "", first_name: "", last_name: "", role: 1 });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    try {
      await API.post("auth/register/", form);
      navigate("/login");
    } catch (err) {
      setError(err?.response?.data?.detail || "Ошибка регистрации");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="first_name" value={form.first_name} onChange={handleChange} placeholder="Имя" />
      <input name="last_name" value={form.last_name} onChange={handleChange} placeholder="Фамилия" />
      <input name="login" value={form.login} onChange={handleChange} placeholder="Логин" />
      <input name="password" value={form.password} onChange={handleChange} type="password" placeholder="Пароль" />
      <button type="submit">Зарегистрироваться</button>
      {error && <div>{error}</div>}
    </form>
  );
}