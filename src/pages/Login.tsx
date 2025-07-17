import React, { useState } from 'react';
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

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    if (username === 'admin' && password === '1234') {
      alert('로그인 성공!');
      navigate('/dashboard');
    } else {
      alert('아이디 또는 비밀번호가 틀렸습니다.');
    }
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
          padding: 5,
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
            placeholder="아이디"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#ff7c33',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#ff7c33',
                },
              },
            }}
          />

          <TextField
            placeholder="비밀번호"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#ff7c33',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#ff7c33',
                },
              },
            }}
          />

          <FormControlLabel
            control={
              <Checkbox
                sx={{
                  color: '#ff7c33',
                  '&.Mui-checked': {
                    color: '#ff7c33',
                  },
                  padding: '5px',
                }}
              />
            }
            label={
              <Typography variant="body2" sx={{ fontSize: '14px' }}>
                아이디 저장하기
              </Typography>
            }
            sx={{ mt: 0, mb: 4.5, ml: 0 }}
          />
        </Box>

        <Box display="flex" flexDirection="column" gap={2}>
          <Button
            variant="contained"
            onClick={handleLogin}
            fullWidth
            sx={{
              background: 'linear-gradient(to right, #ff7c33, #ff8800)',
              height: 48,
              fontWeight: 'bold',
              borderRadius: 1,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)', // 그림자 약하게
              '&:hover': {
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              },
              '&:focus': {
                outline: 'none',
              },
            }}
          >
            로그인
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
              '&:hover': {
                backgroundColor: '#ffffff',
                borderColor: '#e65c00',
              },
              '&:focus': {
                outline: 'none',
              },
            }}
          >
            회원가입
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
