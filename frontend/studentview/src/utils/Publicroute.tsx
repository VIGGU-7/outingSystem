import type { ReactNode } from 'react';
import useAuthStore from '../utils/store';
import { Navigate } from 'react-router-dom';

interface PublicRouteProps {
  children: ReactNode;
}

export default function PublicRoute({ children }: PublicRouteProps) {
  const { authUser } = useAuthStore();
    console.log(authUser)

  return !authUser ? <>{children}</> : <Navigate to="/" replace />;
}
