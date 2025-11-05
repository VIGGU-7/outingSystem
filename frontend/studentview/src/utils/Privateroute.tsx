import type { ReactNode } from 'react';
import useAuthStore from '../utils/store';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  children: ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { authUser } = useAuthStore();


  return authUser ? <>{children}</> : <Navigate to="/login" replace />;
}
