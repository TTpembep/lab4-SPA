import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    login: '',
    password: '',
    first_name: '',
    last_name: '',
    role_id: ''
  });

  const [roles, setRoles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Здесь вы можете загрузить список ролей из API
    // Например:
    // const fetchRoles = async () => {
    //   const response = await getRoles();
    //   setRoles(response.data);
    // };
    // fetchRoles();
    // Для примера, просто установим несколько ролей
    setRoles([{ id: 1, type: 'Guest' }, { id: 2, type: 'Dispatcher' }]);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await register(formData);
      console.log('Registration successful', response.data);
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="login" placeholder="Login" onChange={handleChange} required />
      <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
      <input type="text" name="first_name" placeholder="First Name" onChange={handleChange} required />
      <input type="text" name="last_name" placeholder="Last Name" onChange={handleChange} required />
      <select name="role_id" onChange={handleChange} required>
        <option value="">Select Role</option>
        {roles.map((role) => (
          <option key={role.id} value={role.id}>{role.type}</option>
        ))}
      </select>
      <button type="submit">Register</button>
      <Link to="/login">Login</Link>
    </form>
  );
};

export default Register;
