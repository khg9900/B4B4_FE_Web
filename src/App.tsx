// src/App.tsx
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DisasterHomePage from './pages/DisasterHomePage';
import MapPage from './pages/MapPage';
import Post from './pages/VolunteerPosts';
import NotFound from './pages/NotFound';
import Forbidden from './pages/Forbidden';
import RequireRole from './components/RequireRole';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import { setAuthFailHandler } from './api/http';
import { getAccessToken, getCurrentRole } from './auth/tokenStore';

function AuthFailBinder() {
  const navigate = useNavigate();
  useEffect(() => {
    setAuthFailHandler(() => {
      navigate('/login', { replace: true });
    });
  }, [navigate]);
  return null;
}

/** 루트 접근 시 토큰/역할로 분기 */
function RootRedirect() {
  const at = getAccessToken();
  if (!at) return <Navigate to="/login" replace />;
  const role = getCurrentRole();
  if (role === 'GOV') return <Navigate to="/dashboard" replace />; // 기본은 신고 목록
  if (role === 'NGO') return <Navigate to="/posts" replace />;
  return <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <>
      <AuthFailBinder />
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />

        {/* GOV 전용 */}
        <Route
          path="/home"
          element={
            <RequireRole allow={['GOV']}>
              <DisasterHomePage />
            </RequireRole>
          }
        />
        <Route
          path="/dashboard"
          element={
            <RequireRole allow={['GOV']}>
              <Dashboard />
            </RequireRole>
          }
        />
        <Route
          path="/map"
          element={
            <RequireRole allow={['GOV']}>
              <MapPage />
            </RequireRole>
          }
        />

        {/* NGO 전용 */}
        <Route
          path="/posts"
          element={
            <RequireRole allow={['NGO']}>
              <Post />
            </RequireRole>
          }
        />

        <Route path="/forbidden" element={<Forbidden />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ThemeProvider>
  );
}
