// src/pages/SignupNgo.tsx
import { Box, Paper, Stack, Typography, TextField, Button, Alert } from '@mui/material';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoImage from '../../assets/logo.png';
import { signup } from '../../api/auth';
import {
  validateEmail, validatePassword, validateRequired, validatePhoneKR, formatPhoneKR
} from '../../utils/validators';

export default function SignupNgo() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [org, setOrg] = useState('');
  const [phone, setPhone] = useState('');

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string>('');

  const errors = useMemo(() => ({
    email: validateEmail(email),
    pw: validatePassword(pw),
    org: validateRequired(org, '단체명은 필수 입력값입니다.'),
    phone: validatePhoneKR(phone, true),
  }), [email, pw, org, phone]);

  const isValid = useMemo(() => Object.values(errors).every((e) => !e), [errors]);
  const markTouched = (name: string) => setTouched((t) => ({ ...t, [name]: true }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, pw: true, org: true, phone: true });
    setServerError('');
    if (!isValid) return;

    try {
      setSubmitting(true);
      const body = {
        email,
        password: pw,
        name: org,
        phoneNumber: phone,
        userRole: 'NGO' as const,
        // NGO는 지역 선택 없음
      };
      await signup(body);

      alert('회원가입이 완료되었습니다. 로그인 해 주세요.');
      navigate('/login', { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        '회원가입에 실패했습니다. 입력 내용을 확인해 주세요.';
      setServerError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: '#fafafa', p: 2 }}>
      <Paper elevation={3} sx={{ width: '100%', maxWidth: 520, p: { xs: 3, md: 4 }, borderRadius: 2 }}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3} alignItems="stretch">
            <Box sx={{ display: 'grid', placeItems: 'center' }}>
              <Box component="img" src={LogoImage} alt="로고" sx={{ height: 72, mb: 0.5 }} />
            </Box>
            <Typography variant="h6" align="center" sx={{ fontWeight: 800 }}>
              민간봉사단체 회원가입
            </Typography>

            {serverError && <Alert severity="error">{serverError}</Alert>}

            <TextField
              label="이메일"
              type="email"
              fullWidth
              value={email}
              onChange={e => setEmail(e.target.value)}
              onBlur={() => markTouched('email')}
              error={touched.email && Boolean(errors.email)}
              helperText={touched.email && errors.email}
            />
            <TextField
              label="비밀번호"
              type="password"
              fullWidth
              value={pw}
              onChange={e => setPw(e.target.value)}
              onBlur={() => markTouched('pw')}
              error={touched.pw && Boolean(errors.pw)}
              helperText={touched.pw && errors.pw}
            />
            <TextField
              label="단체명"
              fullWidth
              value={org}
              onChange={e => setOrg(e.target.value)}
              onBlur={() => markTouched('org')}
              error={touched.org && Boolean(errors.org)}
              helperText={touched.org && errors.org}
            />
            <TextField
              label="연락처"
              placeholder="010-0000-0000"
              fullWidth
              value={phone}
              onChange={e => setPhone(formatPhoneKR(e.target.value))}
              onBlur={() => markTouched('phone')}
              error={touched.phone && Boolean(errors.phone)}
              helperText={touched.phone && errors.phone}
              inputProps={{ inputMode: 'numeric' }}
            />

            <Button
              type="submit"
              disabled={!isValid || submitting}
              sx={{
                py: 1.4, borderRadius: 2, fontWeight: 700, color: '#fff',
                backgroundImage: 'linear-gradient(90deg, #ff7c33, #ff9a33)',
                '&:hover': { backgroundImage: 'linear-gradient(90deg, #ff6a14, #ff8614)' },
              }}
            >
              {submitting ? '가입 중…' : '회원가입'}
            </Button>

            <Button color="inherit" onClick={() => navigate('/signup')} sx={{ textTransform: 'none' }}>
              ← 유형 선택으로
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
