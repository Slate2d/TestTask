import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';
import { useNavigate, useParams, Link } from 'react-router-dom';
import styles from './ClientEdit.module.css'; 

const ClientEdit = () => {
  const navigate = useNavigate();
  const { clientId } = useParams();
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    sex: 'male',
  });

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await api.get(`/clients/${clientId}`);
        setFormData(response.data);
      } catch (err) {
        toast.error('Ошибка загрузки данных клиента');
        navigate('/');
      }
    };
    fetchClient();
  }, [clientId, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/clients/${clientId}`, formData);
      toast.success('Клиент успешно обновлен!');
      navigate('/');
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Ошибка при обновлении';
      toast.error(errorMsg);
    }
  };

  return (
    <>
      <h1 className={styles.header}>Редактирование клиента (ID: {clientId})</h1>
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
            <button type="submit" className="button">Сохранить</button>
            <Link to="/" className="button-secondary">Отмена</Link>
          </div>
        </form>
      </div>
    </>
  );
};

export default ClientEdit;