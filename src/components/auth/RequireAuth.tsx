// src/components/RequireAuth.tsx
import { Navigate, useLocation } from 'react-router-dom';
import type { ReactElement } from 'react';
import { getAccessToken, getCurrentRole, type UserRole } from '../../auth/tokenStore';

interface Props {
  children: ReactElement;
  /** 접근 허용 역할, 없으면 '로그인만 확인' 모드 */
  allow?: UserRole[];
}

/** 로그인 여부 + (옵션) 역할 제한 */
export default function RequireAuth({ children, allow }: Props) {
  const location = useLocation();
  const at = getAccessToken();

  // 미로그인 → /login
  if (!at) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 역할 제한이 있으면 검사
  if (allow && allow.length > 0) {
    const role = getCurrentRole();
    if (!role || !allow.includes(role)) {
      return <Navigate to="/forbidden" replace state={{ from: location }} />;
    }
  }

  return children;
}
