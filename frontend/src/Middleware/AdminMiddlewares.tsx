import { useSelector } from "react-redux";
import { isAdmin } from "@/utils/roles";
import { Navigate, Outlet } from "react-router-dom";

const AdminMiddlewares = () => {
  const user = useSelector((state: any) => state.auth.user);

  return isAdmin(user?.role) ? <Outlet /> : <Navigate to="/" replace />;
};

export default AdminMiddlewares;
