import React, { useState, useEffect, createContext, useContext } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams, Link } from "react-router-dom";

// --- Auth Context ---
const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetch("http://localhost:8000/api/profile/", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then(data => setUser(data))
        .catch(() => {
          setUser(null);
          setToken(null);
          localStorage.removeItem("token");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (login, password_hash) => {
    const res = await fetch("http://localhost:8000/api/auth/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, password_hash }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.detail || "Неверный логин или пароль");
    }
    const data = await res.json();
    setToken(data.access);
    localStorage.setItem("token", data.access);
    const profileRes = await fetch("http://localhost:8000/api/profile/", {
      headers: { Authorization: `Bearer ${data.access}` }
    });
    if (!profileRes.ok) throw new Error("Не удалось получить профиль");
    const profile = await profileRes.json();
    setUser(profile);
  };

  const register = async (role, first_name, last_name, login, password_hash) => {
    const res = await fetch("http://localhost:8000/api/auth/register/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, first_name, last_name, login, password_hash }),
    });
    if (!res.ok) {
      let msg = "Ошибка регистрации";
      try {
        const data = await res.json();
        msg = data.detail || JSON.stringify(data);
      } catch {}
      throw new Error(msg);
    }
    return await res.json();
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
function useAuth() { return useContext(AuthContext); }

// --- Protected Route ---
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Загрузка...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// --- Pages ---
function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [loginField, setLoginField] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { if (user) navigate("/menu"); }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(loginField, password);
      navigate("/menu");
    } catch (err) {
      setError("Ошибка входа: " + err.message);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Вход</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Логин" value={loginField} onChange={e => setLoginField(e.target.value)} required />
        <input placeholder="Пароль" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit">Войти</button>
      </form>
      {error && <p style={{color:'red'}}>{error}</p>}
      <p>Нет аккаунта? <Link to="/register">Зарегистрироваться</Link></p>
    </div>
  );
}

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [role, setRole] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loginField, setLoginField] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);

  // Загрузка списка ролей
  useEffect(() => {
    fetch("http://localhost:8000/api/roles/")
      .then(res => res.ok ? res.json() : Promise.resolve([]))
      .then(data => {
        if (Array.isArray(data)) setRoles(data);
        else setRoles([]);
      })
      .catch(() => setRoles([]));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setOk(false);
    if (!role || !firstName || !lastName || !loginField || !password) {
      setError('Все поля обязательны!');
      return;
    }
    try {
      await register(role, firstName, lastName, loginField, password);
      setOk(true);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError("Ошибка регистрации: " + err.message);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Регистрация</h2>
      <form onSubmit={handleSubmit}>
        <select value={role} onChange={e => setRole(e.target.value)} required>
          <option value="">Выберите роль</option>
          {roles.map(r => (
            <option key={r.role_id} value={r.role_id}>{r.type}</option>
          ))}
        </select>
        <input placeholder="Имя" value={firstName} onChange={e => setFirstName(e.target.value)} required />
        <input placeholder="Фамилия" value={lastName} onChange={e => setLastName(e.target.value)} required />
        <input placeholder="Логин" value={loginField} onChange={e => setLoginField(e.target.value)} required />
        <input placeholder="Пароль" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit">Зарегистрироваться</button>
      </form>
      {ok && <p style={{color:'green'}}>Успешно! Перенаправляем...</p>}
      {error && <p style={{color:'red'}}>{error}</p>}
    </div>
  );
}

function MenuPage() {
  const { user, logout, token } = useAuth();
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true); setError("");
    fetch("http://localhost:8000/api/routes/", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("Ошибка загрузки");
        return res.json();
      })
      .then(data => setRoutes(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Меню</h2>
      <p>Добро пожаловать, {user?.login}!</p>
      <button onClick={logout}>Выйти</button>
      <hr />
      {loading && <p>Загрузка маршрутов...</p>}
      {error && <p style={{color:'red'}}>{error}</p>}
      <ul>
        {routes.map(route =>
          <li key={route.id}>
            <Link to={`/routes/${route.id}`}>{route.name || `Маршрут ${route.id}`}</Link>
          </li>
        )}
      </ul>
      <Link to="/profile">Профиль</Link>
    </div>
  );
}

function RouteDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    setLoading(true); setError("");
    fetch(`http://localhost:8000/api/routes/${id}/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("Ошибка загрузки маршрута");
        return res.json();
      })
      .then(data => setRoute(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, token]);
  return (
    <div style={{ padding: "2rem" }}>
      <h2>Детали маршрута</h2>
      {loading && <p>Загрузка...</p>}
      {error && <p style={{color:'red'}}>{error}</p>}
      {route && (
        <div>
          <div><b>ID:</b> {route.id}</div>
          <div><b>Название:</b> {route.name}</div>
          <div><b>Описание:</b> {route.description}</div>
        </div>
      )}
      <Link to="/menu">Назад к меню</Link>
    </div>
  );
}

function ProfilePage() {
  const { user, token } = useAuth();
  const [info, setInfo] = useState(null);
  useEffect(() => {
    fetch("http://localhost:8000/api/profile/", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => setInfo(data));
  }, [token]);
  return (
    <div style={{ padding: "2rem" }}>
      <h2>Профиль</h2>
      {info ? (
        <div>
          <div><b>Логин:</b> {info.login}</div>
          <div><b>Имя:</b> {info.first_name}</div>
          <div><b>Фамилия:</b> {info.last_name}</div>
          <div><b>Роль ID:</b> {info.role}</div>
        </div>
      ) : (
        <p>Загрузка...</p>
      )}
      <Link to="/menu">Назад к меню</Link>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div style={{ padding: "2rem" }}>
      <h2>Страница не найдена</h2>
      <Link to="/menu">В меню</Link>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/menu" element={
            <ProtectedRoute>
              <MenuPage />
            </ProtectedRoute>
          }/>
          <Route path="/routes/:id" element={
            <ProtectedRoute>
              <RouteDetail />
            </ProtectedRoute>
          }/>
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }/>
          <Route path="/" element={<Navigate to="/menu" />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

export default App;