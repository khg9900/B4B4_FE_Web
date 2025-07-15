// src/components/RequireAuth.tsx
import { Navigate } from 'react-router-dom';

interface Props {
  children: JSX.Element;
}

function RequireAuth({ children }: Props) {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default RequireAuth;