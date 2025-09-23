import { useEffect, useState, useCallback } from 'react';
import {
  Box, CssBaseline, Grid, Paper, Typography, Stack, Button,
} from '@mui/material';
import Sidebar from '../../components/report/Sidebar';
import Topbar from '../../components/Topbar';
import { getMyInfoCached } from '../../api/user';
import { fetchTodayReportStats, type TodayStats } from '../../api/reports';
import { getClaims } from '../../auth/tokenStore';

const ORANGE = '#ff7c33';
const BLUE   = '#2196f3';
const GRAY   = '#9e9e9e';

function StatCard({
  title,
  count,
  color,
  loading,
}: {
  title: string;
  count: number;
  color: string;
  loading?: boolean;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        p: 3,
        height: '100%',
      }}
    >
      <Stack spacing={1}>
        <Typography variant="subtitle1" sx={{ color: 'text.secondary', fontWeight: 700 }}>
          {title}
        </Typography>
        <Typography variant="h2" sx={{ lineHeight: 1, fontWeight: 800, color }}>
          {loading ? '—' : count}
          <Typography component="span" variant="h6" sx={{ ml: 0.5, color: 'text.secondary', fontWeight: 500 }}>
            건
          </Typography>
        </Typography>
      </Stack>
    </Paper>
  );
}

export default function DisasterHomePage() {
  const claims = getClaims() as any;
  const role = claims?.userRole ?? claims?.role;
  const isGov = role === 'GOV';

  const [locationLabel, setLocationLabel] = useState<string>('내 관할');
  const [stats, setStats] = useState<TodayStats>({ pending: 0, received: 0, closed: 0 });
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const me = await getMyInfoCached().catch(() => null);
      const loc = me ? [me.province, me.city].filter(Boolean).join(' ') : '';
      setLocationLabel(loc || '내 관할');

      const s = await fetchTodayReportStats();
      setStats(s);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (!isGov) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h6">접근 권한이 없습니다.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#ffffff' }}>
      <CssBaseline />
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Topbar />

        <Box sx={{ px: 3, py: 2 }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            alignItems={{ xs: 'flex-start', md: 'center' }}
            justifyContent="space-between"
            spacing={1.5}
            sx={{ mb: 2 }}
          >
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
                접수 현황
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {locationLabel} 기준
              </Typography>
            </Box>

            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={() => void load()}>
                새로고침
              </Button>
            </Stack>
          </Stack>

          <Grid container spacing={2}>
            <Grid size={12}>
              <StatCard title="접수대기" count={stats.pending} color={ORANGE} loading={loading} />
            </Grid>
            <Grid size={12}>
              <StatCard title="접수완료" count={stats.received} color={BLUE} loading={loading} />
            </Grid>
            <Grid size={12}>
              <StatCard title="상황종료" count={stats.closed} color={GRAY} loading={loading} />
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}
