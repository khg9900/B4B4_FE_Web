import { useEffect, useMemo, useState } from 'react';
import { Box, CssBaseline, Typography, Stack } from '@mui/material';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { getMyInfoCached } from '../api/user';
import HeatmapMap from '../components/HeatmapMap';

export default function MapPage() {
  const [locationLabel, setLocationLabel] = useState<string>('내 관할');

  const todayLabel = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString('ko-KR', {
      year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
    });
  }, []);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const me = await getMyInfoCached();
        if (ignore) return;
        const loc = [me.province, me.city].filter(Boolean).join(' ');
        setLocationLabel(loc || '내 관할');
      } catch {}
    })();
    return () => { ignore = true; };
  }, []);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fff' }}>
      <CssBaseline />
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Topbar />
        <Box sx={{ px:3, py:2 }}>
          <Stack spacing={0.5} sx={{ mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>오늘접수 현황</Typography>
            <Typography variant="body2" color="text.secondary">
              {todayLabel} · {locationLabel} 기준
            </Typography>
          </Stack>

          {/* 지도 + 히트맵 컴포넌트 */}
          <HeatmapMap height={420} />
        </Box>
      </Box>
    </Box>
  );
}
