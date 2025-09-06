// src/pages/SignupSelect.tsx
import { Box, Paper, Stack, Typography, Button } from '@mui/material';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import VolunteerActivismOutlinedIcon from '@mui/icons-material/VolunteerActivismOutlined';
import { useNavigate } from 'react-router-dom';
import LogoImage from '../assets/logo.png';

const ORANGE = '#ff7c33';

export default function SignupSelect() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: '#fafafa', p: 2 }}>
      <Paper elevation={3} sx={{ width: '100%', maxWidth: 520, p: { xs: 3, md: 4 }, borderRadius: 2 }}>
        <Stack spacing={3} alignItems="center">
          {/* ✅ 로고 아래 여백을 늘려서 로고-버튼 간격 확대 */}
          <Box component="img" src={LogoImage} alt="로고" sx={{ height: 88, mb: 20.5 }} />

          <Box></Box>

          <Stack spacing={2} sx={{ width: '90%' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/signup/gov')}
              startIcon={<ApartmentOutlinedIcon />}
              sx={{
                borderColor: ORANGE,
                color: ORANGE,
                py: 1.7,
                borderRadius: 2,
                fontWeight: 700,
                fontSize: '1rem',
                '&:hover': { borderColor: ORANGE, backgroundColor: '#fff5ec' },
              }}
            >
              공공기관 회원가입
            </Button>

            <Button
              variant="outlined"
              onClick={() => navigate('/signup/ngo')}
              startIcon={<VolunteerActivismOutlinedIcon />}
              sx={{
                borderColor: ORANGE,
                color: ORANGE,
                py: 1.7,
                borderRadius: 2,
                fontWeight: 700,
                fontSize: '1rem', 
                '&:hover': { borderColor: ORANGE, backgroundColor: '#fff5ec' },
              }}
            >
              민간봉사단체 회원가입
            </Button>
          </Stack>

          <Button
            color="inherit"
            onClick={() => navigate('/login')}
            sx={{ textTransform: 'none', mt: 1, color: 'text.secondary' }}
          >
            로그인으로 돌아가기
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
