import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { getAccessToken } from '../auth/tokenStore';

interface Props {
  children: ReactNode;
}

export default function RequireAuth({ children }: Props) {
  const location = useLocation();
  const at = getAccessToken();

  if (!at) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <>{children}</>;
}