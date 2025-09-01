// src/App.tsx
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Post from './pages/VolunteerPosts'; // 경로가 다르면 실제 파일 경로로 수정
import NotFound from './pages/NotFound';
import RequireAuth from './components/RequireAuth';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import { setAuthFailHandler } from './api/http';

/** 재발급 실패 등 인증 오류 발생 시 로그인으로 이동시키는 바인더 */
function AuthFailBinder() {
  const navigate = useNavigate();
  useEffect(() => {
    setAuthFailHandler(() => {
      // 필요하면 토스트/알림도 여기서 처리 가능
      navigate('/login', { replace: true });
    });
  }, [navigate]);
  return null;
}

function AppRoutes() {
  return (
    <>
      <AuthFailBinder />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/posts"
          element={
            <RequireAuth>
              <Post />
            </RequireAuth>
          }
        />
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
