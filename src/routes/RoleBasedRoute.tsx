import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../stores/AuthContext';
import type { Role } from '../types/api';

type RoleBasedRouteProps = {
  allowedRoles: Role[];
};

export const RoleBasedRoute = ({ allowedRoles }: RoleBasedRouteProps) => {
  const { role } = useAuth();

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
