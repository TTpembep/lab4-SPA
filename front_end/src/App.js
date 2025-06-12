import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Menu from './pages/Menu';
import ProtectedRoute from './pages/ProtectedRoute';
import { ToastProvider } from './context/ToastContext';

const App = () => {
  return (
    <ToastProvider>
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/menu" element={
          <ProtectedRoute>
            <Menu />
          </ProtectedRoute>
        } />
        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
    </ToastProvider>
  );
};

export default App;