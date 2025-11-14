import React from 'react'
import { useSelector } from 'react-redux';
import { Link, Navigate, Outlet } from 'react-router-dom';

const AuthMiddlewares = () => {
    const isAuthenticated = useSelector((state:any) => state.auth.isAuthenticated);
    return  isAuthenticated ? <Outlet/> : <Navigate to={"/login"} replace={true}/>
}

export default AuthMiddlewares