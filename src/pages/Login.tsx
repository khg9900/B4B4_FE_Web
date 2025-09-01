// src/pages/LoginPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { api } from '../api/http';
import { saveTokens } from '../auth/tokenStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  // 저장된 아이디 불러오기
  useEffect(() => {
    const saved = localStorage.getItem('savedId');
    if (saved) {
      setEmail(saved);
      setRemember(true);
    }
  }, []);

  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('이메일과 비밀번호를 모두 입력해 주세요.');
      return;
    }

    setSubmitting(true);
    try {
      // 백엔드 로그인
      const res = await api.post('/auth/login', { email, password });

      // payload 안전하게 접근
      const payload = res.data?.payload;
      if (!payload?.accessToken) {
        throw new Error(res.data?.message || '토큰이 응답에 없습니다.');
      }

      // 구조 분해로 토큰 가져오기
      const { accessToken, refreshToken } = payload;

      // 토큰 저장 (메모리 + localStorage)
      saveTokens(accessToken, refreshToken);

      // 아이디 저장 체크
      if (remember) {
        localStorage.setItem('savedId', email);
      } else {
        localStorage.removeItem('savedId');
      }

      // 로그인 성공 후 목록 페이지 이동
      console.log('navigate to /posts now');
      navigate('/posts');

    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        '로그인에 실패했습니다. 입력 정보를 확인해 주세요.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <Box
      sx={{
        height: '100vh',
        backgroundColor: '#ffffff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 5,
          borderRadius: 3,
          width: '100%',
          maxWidth: 420,
          backgroundColor: '#fff',
        }}
      >
        <Box textAlign="center" mb={4}>
          <img src={logo} alt="로고" style={{ height: 110, marginBottom: '2.5rem' }} />
        </Box>

        <Box display="flex" flexDirection="column" gap={1.5} mt={2}>
          <TextField
            placeholder="이메일"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={onKeyDown}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': { borderColor: '#ff7c33' },
                '&.Mui-focused fieldset': { borderColor: '#ff7c33' },
              },
            }}
          />

          <TextField
            placeholder="비밀번호"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={onKeyDown}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': { borderColor: '#ff7c33' },
                '&.Mui-focused fieldset': { borderColor: '#ff7c33' },
              },
            }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                sx={{
                  color: '#ff7c33',
                  '&.Mui-checked': { color: '#ff7c33' },
                  p: '5px',
                }}
              />
            }
            label={<Typography variant="body2" sx={{ fontSize: '14px' }}>아이디 저장하기</Typography>}
            sx={{ mt: 0, mb: 1, ml: 0 }}
          />

          {error && (
            <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>
              {error}
            </Typography>
          )}
        </Box>

        <Box display="flex" flexDirection="column" gap={2} mt={3}>
          <Button
            variant="contained"
            onClick={handleLogin}
            fullWidth
            disabled={submitting}
            sx={{
              background: 'linear-gradient(to right, #ff7c33, #ff8800)',
              height: 48,
              fontWeight: 'bold',
              borderRadius: 1,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              '&:hover': { boxShadow: '0 2px 6px rgba(0,0,0,0.15)' },
              '&:focus': { outline: 'none' },
            }}
          >
            {submitting ? '로그인 중…' : '로그인'}
          </Button>

          <Button
            variant="outlined"
            fullWidth
            sx={{
              borderColor: '#ff7c33',
              color: '#ff7c33',
              height: 48,
              fontWeight: 'bold',
              borderRadius: 1,
              '&:hover': { backgroundColor: '#ffffff', borderColor: '#e65c00' },
              '&:focus': { outline: 'none' },
            }}
          >
            회원가입
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
