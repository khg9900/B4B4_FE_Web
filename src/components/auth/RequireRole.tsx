// src/components/RequireRole.tsx
import { Navigate, useLocation } from 'react-router-dom';
import type { ReactElement } from 'react';
import { getAccessToken, getCurrentRole, type UserRole } from '../../auth/tokenStore';

type Props = {
  children: ReactElement;
  allow: UserRole[];
  to?: string; // 권한 없음 이동 경로 (기본 /forbidden)
};

export default function RequireRole({ children, allow, to = '/forbidden' }: Props) {
  const location = useLocation();
  const at = getAccessToken();

  // 미로그인 → 로그인
  if (!at) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 역할 확인
  const role = getCurrentRole();
  if (!role || !allow.includes(role)) {
    return <Navigate to={to} replace state={{ from: location }} />;
  }

  return children;
}
