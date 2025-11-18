import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import api from '../api/axiosConfig';
import { jwtDecode } from 'jwt-decode'; 
import { toast } from 'react-toastify';
import styles from './Login.module.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await api.post('/login/token', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const accessToken = response.data.access_token;
      const decoded = jwtDecode(accessToken); 
      const user = {
        login: decoded.sub,
        role: decoded.sub === 'admin' ? 'admin' : 'user'
      };
      
      login(accessToken, user);
      setUsername('');
      setPassword('');
      navigate(from, { replace: true });
      
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Ошибка входа';
      toast.error(errorMsg);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className="page-header">Вход в CRM</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Логин:</label>
          <input
            type="text"
            id="username"
            autoComplete="off"
            onChange={(e) => setUsername(e.target.value)}
            value={username}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Пароль:</label>
          <input
            type="password"
            id="password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            required
          />
        </div>
        <button className="button" style={{width: '100%'}}>Войти</button>
      </form>
    </div>
  );
};

export default Login;