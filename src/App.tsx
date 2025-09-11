// src/App.tsx
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Login from './pages/auth/Login';
import SignupSelect from './pages/auth/SignupSelect';
import SignupGov from './pages/auth/SignupGov';
import SignupNgo from './pages/auth/SignupNgo';
import Dashboard from './pages/report/Dashboard';
import DisasterHomePage from './pages/report/DisasterHomePage';
import MapPage from './pages/report/MapPage';
import Post from './pages/volunteer/VolunteerPosts';
import NotFound from './pages/NotFound';
import Forbidden from './pages/Forbidden';
import RequireRole from './components/auth/RequireRole';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import { setAuthFailHandler } from './api/http';
import { getAccessToken, getCurrentRole } from './auth/tokenStore';
import { initForegroundFcmListener } from './lib/fcm';

function AuthFailBinder() {
  const navigate = useNavigate();
  useEffect(() => {
    setAuthFailHandler(() => {
      navigate('/login', { replace: true });
    });
  }, [navigate]);
  return null;
}

function RootRedirect() {
  const at = getAccessToken();
  if (!at) return <Navigate to="/login" replace />;
  const role = getCurrentRole();
  if (role === 'GOV') return <Navigate to="/dashboard" replace />;
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
        <Route path="/signup" element={<SignupSelect />} />
        <Route path="/signup/gov" element={<SignupGov />} />
        <Route path="/signup/ngo" element={<SignupNgo />} />

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
  useEffect(() => {
    void initForegroundFcmListener();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ThemeProvider>
  );
}
