import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import RequireAuth from './components/RequireAuth';
import Login from './pages/Login';
import ClientsList from './pages/ClientsList';
import ClientCreate from './pages/ClientCreate';
import ClientEdit from './pages/ClientEdit';
import ProductAdd from './pages/ProductAdd';
import ProductsList from './pages/ProductsList';
import AuditLog from './pages/AuditLog';


import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<Layout />}>
          <Route element={<RequireAuth allowedRoles={[ROLES.USER, ROLES.ADMIN]} />}>
            <Route path="/" element={<ClientsList />} />
            <Route path="create-client" element={<ClientCreate />} />
            <Route path="client/:clientId/edit" element={<ClientEdit />} />
            <Route path="add-product" element={<ProductAdd />} />
            <Route path="products" element={<ProductsList />} />
          </Route>

          <Route element={<RequireAuth allowedRoles={[ROLES.ADMIN]} />}>
            <Route path="audit" element={<AuditLog />} />
          </Route>
        </Route>
        
      </Routes>
      
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

export default App;