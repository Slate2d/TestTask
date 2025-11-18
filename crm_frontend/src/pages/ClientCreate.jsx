import React, { useState } from 'react';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import styles from './ClientCreate.module.css'; 

const ClientCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    sex: 'male',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/clients/', formData);
      toast.success('Клиент успешно создан!');
      navigate('/');
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Ошибка при создании';
      toast.error(errorMsg);
    }
  };

  return (
    <>
      <h1 className={styles.header}>1. Создание нового клиента</h1>
      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="full_name">ФИО</label>
            <input
              type="text" name="full_name" id="full_name"
              value={formData.full_name} onChange={handleChange} required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="phone">Телефон</label>
            <input
              type="text" name="phone" id="phone"
              value={formData.phone} onChange={handleChange} required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="sex">Пол</label>
            <select
              name="sex" id="sex"
              value={formData.sex} onChange={handleChange}
            >
              <option value="male">Мужской</option>
              <option value="female">Женский</option>
              <option value="other">Другой</option>
            </select>
          </div>
          <div className={styles.actions}>
            <button type="submit" className="button">Создать</button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ClientCreate;