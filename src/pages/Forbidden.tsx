import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getCurrentRole } from '../auth/tokenStore';

export default function Forbidden() {
  const nav = useNavigate();
  const role = getCurrentRole();

  const goHomeByRole = () => {
    if (role === 'GOV') nav('/dashboard', { replace: true });
    else if (role === 'NGO') nav('/posts', { replace: true });
    else nav('/login', { replace: true });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        textAlign: 'center',
        p: 3,
      }}
    >
      <div>
        <Typography variant="h4" sx={{ mb: 1.5, fontWeight: 700 }}>
          접근 권한이 없습니다
        </Typography>
        <Typography sx={{ mb: 3, color: 'text.secondary' }}>
          이 페이지는 현재 역할로 접근할 수 없어요.
        </Typography>
        <Button
          variant="contained"
          onClick={goHomeByRole}
          sx={{ bgcolor: '#ff7c33', ':hover': { bgcolor: '#ff6a14' } }}
        >
          가능한 페이지로 이동
        </Button>
      </div>
    </Box>
  );
}
