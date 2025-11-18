import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import useDebounce from '../hooks/useDebounce'; 
import styles from './ProductAdd.module.css';


const ProductAdd = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    status: 'in_stock',
  });
  
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [clientSearch, setClientSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  
  const debouncedSearch = useDebounce(clientSearch, 300);

  
  useEffect(() => {
    if (debouncedSearch) {
      const searchClients = async () => {
        try {
          const response = await api.get('/clients/', {
            params: { full_name: debouncedSearch }
          });
          setSearchResults(response.data);
        } catch (err) {
          toast.error('Ошибка поиска клиента');
        }
      };
      searchClients();
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  
  const handleSelectClient = (client) => {
    setSelectedClientId(client.id);
    setClientSearch(client.full_name); 
    setSearchResults([]); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClientId) {
      toast.error('Пожалуйста, выберите клиента из поиска');
      return;
    }
    
    try {
      await api.post('/products/', {
        ...formData,
        client_id: selectedClientId 
      });
      toast.success('Товар успешно добавлен!');
      navigate('/products');
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Ошибка при добавлении товара';
      toast.error(errorMsg);
    }
  };

return (
    <>
      <h1 className="page-header">3. Добавление товара к клиенту</h1>
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          
          <div className={styles.searchContainer}> 
            <label htmlFor="client_search" className={styles.label}>Поиск клиента по ФИО</label>
            <input
              type="text"
              name="client_search"
              id="client_search"
              className={styles.input} 
              value={clientSearch}
              onChange={(e) => {
                setClientSearch(e.target.value);
                setSelectedClientId(null);
              }}
              required
              placeholder="Начните вводить ФИО..."
              autoComplete="off"
            />
            
            {searchResults.length > 0 && (
              <div className={styles.searchResults}>
                {searchResults.map(client => (
                  <div 
                    key={client.id} 
                    className={styles.resultItem}
                    onClick={() => handleSelectClient(client)}
                  >
                    {client.full_name} (ID: {client.id}, Тел: {client.phone})
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {selectedClientId && (
            <p>Выбран клиент: <strong>{clientSearch} (ID: {selectedClientId})</strong></p>
          )}

          <div className="form-group">
            <label htmlFor="name">Название товара</label>
            <input
              type="text" name="name" id="name"
              value={formData.name} onChange={handleChange} required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="status">Статус</label>
            <select
              name="status" id="status"
              value={formData.status} onChange={handleChange}
            >
              <option value="in_stock">В наличии</option>
              <option value="out_of_stock">Нет в наличии</option>
              <option value="on_order">Под заказ</option>
            </select>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="button">Добавить товар</button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ProductAdd;