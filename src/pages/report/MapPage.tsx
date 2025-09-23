import { useEffect, useState } from 'react';
import { Box, CssBaseline, Typography, Stack } from '@mui/material';
import Sidebar from '../../components/report/Sidebar';
import Topbar from '../../components/Topbar';
import { getMyInfoCached } from '../../api/user';
import HeatmapMap from '../../components/report/HeatmapMap';

export default function MapPage() {
  const [locationLabel, setLocationLabel] = useState<string>('내 관할');

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
            <Typography variant="h5" sx={{ fontWeight: 800 }}>접수 현황</Typography>
            <Typography variant="body2" color="text.secondary">
              {locationLabel} 기준
            </Typography>
          </Stack>

          <HeatmapMap height={700} />
        </Box>
      </Box>
    </Box>
  );
}
