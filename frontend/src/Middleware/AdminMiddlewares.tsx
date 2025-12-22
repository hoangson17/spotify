import React from 'react'
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const AdminMiddlewares = () => {
  const user = useSelector((state: any) => state.auth.user);

  return user?.role === "admin"
    ? <Outlet />
    : <Navigate to="/" replace />;
};

export default AdminMiddlewares;
