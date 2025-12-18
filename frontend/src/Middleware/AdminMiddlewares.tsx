import React from 'react'
import { useSelector } from 'react-redux';
import { Link, Navigate, Outlet } from 'react-router-dom';

const AdminMiddlewares = () => {
    const user = useSelector((state:any) => state.auth.user);
    if(user?.role !== "admin") return <Navigate to={"/"}/>
}

export default AdminMiddlewares