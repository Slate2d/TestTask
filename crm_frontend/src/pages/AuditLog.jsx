import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';
import styles from './AuditLog.module.css'; 

const AuditLog = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await api.get('/audit/');
        setLogs(response.data);
      } catch (err) {
        toast.error('Ошибка при загрузке логов');
      }
    };
    fetchLogs();
  }, []);

  return (
    <>
      <h1 className={styles.header}>5. Логи аудита</h1>
      <div className={styles.tableWrapper}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Время</th>
              <th>Пользователь</th>
              <th>Действие</th>
              <th>Модель</th>
              <th>ID Модели</th>
              <th>Изменения</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{log.id}</td>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
                <td>{log.user.login} (ID: {log.user_id})</td>
                <td>{log.action}</td>
                <td>{log.target_model}</td>
                <td>{log.target_id}</td>
                <td>
                  <pre style={{ margin: 0, fontSize: '12px' }}>
                    {JSON.stringify(log.changes, null, 2)}
                  </pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default AuditLog;