// src/pages/DisasterHomePage.tsx
import { useEffect, useMemo, useState, useCallback } from 'react';
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
  // GOV 권한 확인(라우터에서 RequireRole로 가드하지만, 한 번 더 방어)
  const claims = getClaims() as any;
  const role = claims?.userRole ?? claims?.role;
  const isGov = role === 'GOV';

  const [locationLabel, setLocationLabel] = useState<string>('내 관할');
  const [stats, setStats] = useState<TodayStats>({ pending: 0, received: 0, closed: 0 });
  const [loading, setLoading] = useState(false);

  const todayLabel = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString('ko-KR', {
      year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
    });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // 위치 라벨은 내 정보에서 (표시용)
      const me = await getMyInfoCached().catch(() => null);
      const loc = me ? [me.province, me.city].filter(Boolean).join(' ') : '';
      setLocationLabel(loc || '내 관할');

      // 오늘 집계는 백엔드에서 인증 사용자 기준으로 알아서 계산
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
          {/* 헤더 */}
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

          {/* 카드 3개: 데스크톱 3열, 모바일 1열 */}
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
