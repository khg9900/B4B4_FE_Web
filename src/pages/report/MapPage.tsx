import { useEffect, useMemo, useState } from 'react';
import { Box, CssBaseline, Typography, Stack } from '@mui/material';
<<<<<<< HEAD:src/pages/MapPage.tsx
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { getMyInfoCached } from '../api/user';
import HeatmapMap from '../components/HeatmapMap';
=======
import Sidebar from '../../components/report/Sidebar';
import Topbar from '../../components/Topbar';
import { getMyInfoCached } from '../../api/user';
import HeatmapMap from '../../components/report/HeatmapMap';
>>>>>>> 9d13e702f7c83c5d2cf8452deee62750d64d11e2:src/pages/report/MapPage.tsx

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
<<<<<<< HEAD:src/pages/MapPage.tsx
            <Typography variant="h5" sx={{ fontWeight: 800 }}>오늘접수 현황</Typography>
=======
            <Typography variant="h5" sx={{ fontWeight: 800 }}>당일 접수 현황</Typography>
>>>>>>> 9d13e702f7c83c5d2cf8452deee62750d64d11e2:src/pages/report/MapPage.tsx
            <Typography variant="body2" color="text.secondary">
              {todayLabel} · {locationLabel} 기준
            </Typography>
          </Stack>

          {/* 지도 + 히트맵 컴포넌트 */}
<<<<<<< HEAD:src/pages/MapPage.tsx
          <HeatmapMap height={420} />
=======
          <HeatmapMap height={700} />
>>>>>>> 9d13e702f7c83c5d2cf8452deee62750d64d11e2:src/pages/report/MapPage.tsx
        </Box>
      </Box>
    </Box>
  );
}
