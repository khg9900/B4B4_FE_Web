// src/pages/SignupGov.tsx
import { Box, Paper, Stack, Typography, TextField, Button, Autocomplete, Alert } from '@mui/material';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoImage from '../../assets/logo.png';
import useRegionsCsv from '../../hooks/useRegionsCsv';
import { signup } from '../../api/auth';
import {
  validateEmail, validatePassword, validateRequired, validatePhoneKR, formatPhoneKR
} from '../../utils/validators';

export default function SignupGov() {
  const navigate = useNavigate();

  // 지역 옵션 (CSV)
  const { provinces, citiesByProvince, loading: regionLoading, error: regionError } = useRegionsCsv('/regions.csv');

  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [org, setOrg] = useState('');
  const [phone, setPhone] = useState('');
  const [province, setProvince] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string>('');

  const cityOptions = useMemo(() => {
    if (!province) return [];
    return (citiesByProvince[province] ?? []).filter(Boolean);
  }, [province, citiesByProvince]);

  const cityRequired = useMemo(() => cityOptions.length > 0, [cityOptions]);

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const errors = useMemo(() => ({
    email: validateEmail(email),
    pw: validatePassword(pw),
    org: validateRequired(org, '공공기관 명은 필수 입력값입니다.'),
    phone: validatePhoneKR(phone, true),
    province: validateRequired(province ?? '', '담당 지역(시/도)을 선택해 주세요.'),
    city: cityRequired ? validateRequired(city ?? '', '담당 지역(시/군/구)을 선택해 주세요.') : null,
  }), [email, pw, org, phone, province, city, cityRequired]);
  const isValid = useMemo(() => Object.values(errors).every((e) => !e), [errors]);
  const markTouched = (name: string) => setTouched((t) => ({ ...t, [name]: true }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, pw: true, org: true, phone: true, province: true, city: true });
    setServerError('');
    if (!isValid) return;

    try {
      setSubmitting(true);

      // 세종 등 시군구가 없는 시/도는 빈 문자열로 전송(백엔드 선택사항 필드)
      const body = {
        email,
        password: pw,
        name: org,
        phoneNumber: phone,
        userRole: 'GOV' as const,
        province: province ?? '',
        city: cityRequired ? (city ?? '') : '', // 없으면 빈 문자열
      };

      await signup(body);

      // 성공 시 로그인으로 이동
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
              공공기관 회원가입
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
              label="공공기관 명"
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

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Autocomplete
                options={provinces}
                loading={regionLoading}
                value={province}
                onChange={(_, v) => {
                  setProvince(v);
                  const nextOptions = v ? (citiesByProvince[v] ?? []).filter(Boolean) : [];
                  setCity(nextOptions.length ? null : ''); // 선택 필요 없으면 빈 문자열로
                }}
                renderInput={(p) => (
                  <TextField
                    {...p}
                    label="담당 지역 - 시/도"
                    onBlur={() => markTouched('province')}
                    error={touched.province && Boolean(errors.province)}
                    helperText={
                      (touched.province && errors.province) ||
                      (regionError ? `지역 데이터 로드 실패: ${regionError}` : '')
                    }
                  />
                )}
                sx={{ flex: 1, minWidth: 160 }}
              />

              <Autocomplete
                options={cityOptions}
                value={cityOptions.length ? city : ''} // 옵션 없으면 빈 값 고정
                onChange={(_, v) => setCity(v)}
                disabled={!province || !cityRequired}
                renderInput={(p) => (
                  <TextField
                    {...p}
                    label="담당 지역 - 시/군/구"
                    placeholder={cityRequired ? '선택' : '해당 없음'}
                    onBlur={() => markTouched('city')}
                    error={cityRequired && touched.city && Boolean(errors.city)}
                    helperText={cityRequired && touched.city && errors.city}
                  />
                )}
                sx={{ flex: 1, minWidth: 160 }}
              />
            </Stack>

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
