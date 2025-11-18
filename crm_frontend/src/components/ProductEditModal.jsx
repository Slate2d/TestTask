import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axiosConfig';


const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  content: {
    background: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    width: '90%',
    maxWidth: '500px',
  }
};

const ProductEditModal = ({ product, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    status: 'in_stock',
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        status: product.status,
      });
    }
  }, [product]);

  if (!product) {
    return null;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/products/${product.id}`, formData);
      toast.success('Товар успешно обновлен!');
      onSave(); 
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Ошибка при обновлении');
    }
  };

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.content} onClick={(e) => e.stopPropagation()}>
        <h2 className="page-header" style={{marginTop: 0}}>Редактирование товара (ID: {product.id})</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Название товара</label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="status">Статус</label>
            <select
              name="status"
              id="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="in_stock">В наличии</option>
              <option value="out_of_stock">Нет в наличии</option>
              <option value="on_order">Под заказ</option>
            </select>
          </div>
          <div className="form-actions" style={{gap: '1rem'}}>
            <button type="submit" className="button">Сохранить</button>
            <button type="button" className="button-secondary" onClick={onClose}>Отмена</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductEditModal;