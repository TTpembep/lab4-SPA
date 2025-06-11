import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import RoutesTable from './components/RoutesTable';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/routes" element={<RoutesTable />} />
        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  );
};

export default App;
