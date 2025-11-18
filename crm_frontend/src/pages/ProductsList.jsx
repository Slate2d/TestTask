import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';
import useAuth from '../hooks/useAuth';
import ProductEditModal from '../components/ProductEditModal';
import styles from './ProductsList.module.css'; 

const ProductsList = () => {
  const { auth } = useAuth();
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    name: '',
    client_id: '',
  });
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      const params = {
        status: filters.status || null,
        name: filters.name || null,
        client_id: filters.client_id || null,
      };
      const response = await api.get('/products/', { params });
      setProducts(response.data);
    } catch (err) {
      toast.error('Ошибка при загрузке товаров');
    }
  }, [filters]); 

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };
  
  const handleDelete = async (productId) => {
    if (window.confirm('Вы уверены?')) {
      try {
        await api.delete(`/products/${productId}`);
        toast.success('Товар удален');
        fetchProducts(); 
      } catch (err) {
        toast.error('Ошибка при удалении');
      }
    }
  };
  
  return (
    <>
      <h1 className={styles.header}>4. Список и фильтр товаров</h1>
      
      <div className={styles.filterContainer}>
        <form onSubmit={handleFilterSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Название</label>
            <input type="text" name="name" id="name" value={filters.name} onChange={handleFilterChange} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="client_id">ID Клиента</label>
            <input type="number" name="client_id" id="client_id" value={filters.client_id} onChange={handleFilterChange} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="status">Статус</label>
            <select name="status" id="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">Все</option>
              <option value="in_stock">В наличии</option>
              <option value="out_of_stock">Нет в наличии</option>
              <option value="on_order">Под заказ</option>
            </select>
          </div>
          <button type="submit" className="button">Применить фильтр</button>
        </form>
      </div>

      <div className={styles.tableWrapper}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Название</th>
              <th>Статус</th>
              <th>ID Клиента</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>{product.status}</td>
                <td>{product.client_id}</td>
                <td>
                  <div className={styles.actions}>
                    <button onClick={() => setEditingProduct(product)} className="button-secondary">Ред.</button>
                    {auth.user?.role === 'admin' && (
                      <button onClick={() => handleDelete(product.id)} className="button-danger">Удалить</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <ProductEditModal 
        product={editingProduct}
        onClose={() => setEditingProduct(null)}
        onSave={() => { setEditingProduct(null); fetchProducts(); }}
      />
    </>
  );
};

export default ProductsList;