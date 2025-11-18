import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import styles from './Layout.module.css'; 

const Layout = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  
  const getLinkClass = ({ isActive }) => isActive ? styles.activeLink : "";

  return (
    <>
      <nav className={styles.navbar}>
        <ul className={styles.navLinks}>
          <li><NavLink to="/" className={getLinkClass}>Список клиентов</NavLink></li>
          <li><NavLink to="/create-client" className={getLinkClass}>Создать клиента</NavLink></li>
          <li><NavLink to="/add-product" className={getLinkClass}>Добавить товар</NavLink></li>
          <li><NavLink to="/products" className={getLinkClass}>Список товаров</NavLink></li>
          
          {auth.user?.role === 'admin' && (
            <li><NavLink to="/audit" className={getLinkClass}>Логи аудита</NavLink></li>
          )}
          
          <button onClick={handleLogout} className={styles.logoutButton}>Выйти ({auth.user?.login})</button>
        </ul>
      </nav>
      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </>
  );
};

export default Layout;