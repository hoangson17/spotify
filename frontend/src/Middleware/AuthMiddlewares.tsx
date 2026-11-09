import { useSelector } from 'react-redux';
import { Navigate,Outlet } from 'react-router-dom';

const AuthMiddlewares = () => {
    const isAuthenticated = useSelector((state:any) => state.auth.isAuthenticated && state.auth.accessToken && state.auth.refreshToken);
    return  isAuthenticated ? <Outlet/> : <Navigate to={"/login"} replace={true}/>
}

export default AuthMiddlewares