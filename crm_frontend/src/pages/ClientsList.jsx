import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import styles from './ClientsList.module.css';

const ClientsList = () => {
  const { auth } = useAuth(); 
  const [clients, setClients] = useState([]);
  const [searchName, setSearchName] = useState('');

const [searchPhone, setSearchPhone] = useState('');

const fetchClients = useCallback(async () => { 
  try {
    const response = await api.get('/clients/', {
      params: {
        full_name: searchName || null,
        phone: searchPhone || null,
      },
    });
    setClients(response.data);
  } catch (err) {
    toast.error('Ошибка при загрузке клиентов');
  }
}, [searchName, searchPhone]); 

useEffect(() => {
  fetchClients();
}, [fetchClients]); 


  useEffect(() => {
    fetchClients();
  }, []); 

  const handleSearch = (e) => {
    e.preventDefault();
    fetchClients();
  };
  
  const handleDelete = async (clientId) => {
    if (window.confirm('Вы уверены, что хотите удалить этого клиента?')) {
      try {
        await api.delete(`/clients/${clientId}`);
        toast.success('Клиент удален');
        fetchClients(); 
      } catch (err) {
        toast.error('Ошибка при удалении');
      }
    }
  };

  const handleToggleActive = async (client) => {
    const newStatus = !client.is_active;
    const action = newStatus ? 'активировать' : 'деактивировать';
    
    if (window.confirm(`Вы уверены, что хотите ${action} клиента?`)) {
      try {
        await api.patch(`/clients/${client.id}/toggle_active`, null, {
          params: { is_active: newStatus }
        });
        toast.success(`Клиент ${newStatus ? 'активирован' : 'деактивирован'}`);
        fetchClients(); 
      } catch (err) {
        toast.error('Ошибка при изменении статуса');
      }
    }
  };

  return (
    <>
      <h1 className={styles.header}>2. Список клиентов</h1>
      
      <div className={styles.filterContainer}>
        <form onSubmit={handleSearch}>
          <div className="form-group">
            <label htmlFor="searchName">Поиск по ФИО</label>
            <input
              type="text"
              id="searchName"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="searchPhone">Поиск по Телефону</label>
            <input
              type="text"
              id="searchPhone"
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
            />
          </div>
          <button type="submit" className="button">Найти</button>
        </form>
      </div>

      <div className={styles.tableWrapper}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>ФИО</th>
              <th>Телефон</th>
              <th>Пол</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id}>
                <td>{client.id}</td>
                <td>{client.full_name}</td>
                <td>{client.phone}</td>
                <td>{client.sex}</td>
                <td>{client.is_active ? 'Активен' : 'Отключен'}</td>
                <td>
                  <div className={styles.actions}>
                    <Link to={`/client/${client.id}/edit`} className="button-secondary">Ред.</Link>
                    
                    {auth.user?.role === 'admin' && (
                      <>
                        <button 
                          onClick={() => handleToggleActive(client)}
                          className="button-secondary"
                        >
                          {client.is_active ? 'Откл.' : 'Вкл.'}
                        </button>
                        <button 
                          onClick={() => handleDelete(client.id)}
                          className="button-danger"
                        >
                          Удалить
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ClientsList;