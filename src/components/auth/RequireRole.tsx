import { Navigate, useLocation } from 'react-router-dom';
import type { ReactElement } from 'react';
import { getAccessToken, getCurrentRole, type UserRole } from '../../auth/tokenStore';

type Props = {
  children: ReactElement;
  allow: UserRole[];
  to?: string;
};

export default function RequireRole({ children, allow, to = '/forbidden' }: Props) {
  const location = useLocation();
  const at = getAccessToken();

  if (!at) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const role = getCurrentRole();
  if (!role || !allow.includes(role)) {
    return <Navigate to={to} replace state={{ from: location }} />;
  }

  return children;
}
