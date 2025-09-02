// src/pages/MapPage.tsx
import { useEffect, useMemo, useState } from 'react';
import { Box, CssBaseline, Typography, Stack } from '@mui/material';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { getMyInfoCached } from '../api/user';

export default function MapPage() {
  const [locationLabel, setLocationLabel] = useState<string>('내 관할');

  // "2025년 9월 2일 화" 형태
  const todayLabel = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  }, []);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const me = await getMyInfoCached(); // { province, city, ... }
        if (ignore) return;
        const loc = [me.province, me.city].filter(Boolean).join(' ');
        setLocationLabel(loc || '내 관할');
      } catch {
        // 실패 시 기본값 유지
      }
    })();
    return () => { ignore = true; };
  }, []);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#ffffff' }}>
      <CssBaseline />
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Topbar />

        <Box sx={{ px: 3, py: 2 }}>
          {/* 헤더 */}
          <Stack spacing={0.5} sx={{ mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              오늘접수 현황
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {todayLabel} · {locationLabel} 기준
            </Typography>
          </Stack>

          {/* 추후 지도 컴포넌트 삽입 예정인 자리 */}
          <Box
            sx={{
              height: 420,
              border: '1px dashed',
              borderColor: 'divider',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.secondary',
            }}
          >
            (지도 영역 — API 연동 예정)
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
