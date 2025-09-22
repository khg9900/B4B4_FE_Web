import { Navigate, useLocation } from 'react-router-dom';
import type { ReactElement } from 'react';
import { getAccessToken, getCurrentRole, type UserRole } from '../../auth/tokenStore';

interface Props {
  children: ReactElement;
  allow?: UserRole[];
}

export default function RequireAuth({ children, allow }: Props) {
  const location = useLocation();
  const at = getAccessToken();

  if (!at) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allow && allow.length > 0) {
    const role = getCurrentRole();
    if (!role || !allow.includes(role)) {
      return <Navigate to="/forbidden" replace state={{ from: location }} />;
    }
  }

  return children;
}
