import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Chip
} from '@mui/material';
import { fetchDisasterMarkers, type DisasterMarker, disasterColors } from '../../api/reports';
import { loadKakaoMap } from '../../utils/kakaoLoader';
import { logger } from '../../utils/logger';

declare global { interface Window { kakao: any; } }

interface Props { height?: number; }

// HEX → rgba 변환
const hexToRgba = (hex: string, a = 0.35) => {
  const h = hex.replace('#','');
  const bigint = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  const r = (bigint >> 16) & 255, g = (bigint >> 8) & 255, b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

const DisasterMap: React.FC<Props> = ({ height = 420 }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const overlaysRef = useRef<any[]>([]);
  const [map, setMap] = useState<any>();
  const [currentLat, setCurrentLat] = useState<number | null>(null);
  const [currentLng, setCurrentLng] = useState<number | null>(null);
  const [rows, setRows] = useState<DisasterMarker[]>([]);

  const initGeolocation = async () =>
    new Promise<void>((resolve) => {
      if (!navigator.geolocation) return resolve();
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentLat(pos.coords.latitude);
          setCurrentLng(pos.coords.longitude);
          if (map) map.setCenter(new window.kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
          resolve();
        },
        () => resolve(),
        { enableHighAccuracy: true }
      );
    });

  const clearOverlays = () => {
    overlaysRef.current.forEach(o => o.setMap(null));
    overlaysRef.current = [];
  };

  const loadMarkers = useCallback(async () => {
    if (!map) return;

    // 컨텍스트 수집
    const center = map.getCenter();
    const bounds = map.getBounds();
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    const centerLng = center.getLng();
    const centerLat = center.getLat();

    try {
      clearOverlays();

      // 서버 시그니처 유지 (longitude, latitude)
      const data: DisasterMarker[] = await fetchDisasterMarkers(
        centerLng,
        centerLat,
        { swLat: sw.getLat(), swLng: sw.getLng(), neLat: ne.getLat(), neLng: ne.getLng() }
      );

      const sorted = [...data].sort((a,b) => (b.count - a.count) || a.disasterType.localeCompare(b.disasterType));
      setRows(sorted);

      const newOverlays: any[] = [];
      data.forEach(d => {
        const position = new window.kakao.maps.LatLng(d.latitude, d.longitude);
        const repeat = Math.max(1, Number(d.count ?? 1));
        for (let i = 0; i < repeat; i++) {
          const content = document.createElement('div');
          const size = 32;
          content.style.width = `${size}px`;
          content.style.height = `${size}px`;
          content.style.borderRadius = '50%';

          const key = String(d.disasterType ?? '').trim().toUpperCase();
          const raw = (disasterColors as any)?.[key];
          let bg: string;
          if (typeof raw === 'string') {
            if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(raw)) bg = hexToRgba(raw, 0.35);
            else if (/^rgba?\(/i.test(raw)) bg = raw;
            else bg = raw;
          } else bg = hexToRgba('#808080', 0.35);
          content.style.background = bg;

          content.style.border = '1px solid rgba(0,0,0,0.15)';
          content.style.boxShadow = '0 0 0 1px rgba(255,255,255,0.6) inset';
          content.style.pointerEvents = 'auto';

          const overlay = new window.kakao.maps.CustomOverlay({
            position, content, yAnchor: 0.5, xAnchor: 0.5, zIndex: 2,
          });
          overlay.setMap(map);

          const infowindow = new window.kakao.maps.InfoWindow({
            content: `<div style="padding:5px;">
                        <strong>${d.disasterType}</strong><br/>상태: ${d.status}<br/>건수: ${d.count}
                      </div>`
          });
          content.addEventListener('click', () => {
            if (infowindow.getMap()) infowindow.close(); else infowindow.open(map, overlay);
          });

          newOverlays.push(overlay);
        }
      });

      overlaysRef.current = newOverlays;
    } catch (err) {
      logger.capture('DisasterMap:loadMarkers', err, {
        centerLat, centerLng,
        swLat: sw.getLat(), swLng: sw.getLng(), neLat: ne.getLat(), neLng: ne.getLng(),
      });
      clearOverlays();
      setRows([]);
    }
  }, [map]);

  useEffect(() => {
    (async () => {
      try {
        await loadKakaoMap();
        if (!mapContainer.current) return;
        const mapInstance = new window.kakao.maps.Map(mapContainer.current, {
          center: new window.kakao.maps.LatLng(currentLat, currentLng),
          level: 7,
        });
        setMap(mapInstance);
      } catch (e) {
        logger.capture('DisasterMap:initKakao', e);
      }
    })();
  }, []);

  useEffect(() => {
    if (!map) return;
    let timer: any;
    const debouncedReload = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => { loadMarkers(); }, 120);
    };

    (async () => { await initGeolocation(); await loadMarkers(); })();

    window.kakao.maps.event.addListener(map, 'idle', debouncedReload);

    return () => {
      if (timer) clearTimeout(timer);
      window.kakao.maps.event.removeListener(map, 'idle', debouncedReload);
      clearOverlays();
    };
  }, [map, loadMarkers]);

  const ColorDot: React.FC<{ type: string }> = ({ type }) => {
    const key = String(type ?? '').trim().toUpperCase();
    const col = (disasterColors as any)?.[key] || '#808080';
    return <span style={{ display:'inline-block', width:10, height:10, borderRadius:'50%', background:col, marginRight:8, border:'1px solid rgba(0,0,0,0.2)' }} />;
  };

  return (
    <Box sx={{ display:'flex', flexDirection:'column', gap:2 }}>
      <Box sx={{ height, border:'1px dashed', borderColor:'divider', borderRadius:2, position:'relative' }}>
        <div ref={mapContainer} style={{ width:'100%', height:'100%' }} />
      </Box>

      <Paper variant="outlined">
        <Box sx={{ p:2 }}>
          <Typography variant="h6" sx={{ fontWeight:700, mb:1 }}>지도 내 재난 목록</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb:1 }}>건수별 내림차순</Typography>
          <TableContainer sx={{ maxHeight:260 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>유형</TableCell>
                  <TableCell>상태</TableCell>
                  <TableCell>건수</TableCell>
                  <TableCell>위도</TableCell>
                  <TableCell>경도</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((r, i) => (
                  <TableRow key={`${r.disasterType}-${r.latitude}-${r.longitude}-${i}`}>
                    <TableCell><ColorDot type={r.disasterType} />{r.disasterType}</TableCell>
                    <TableCell><Chip size="small" label={r.status} variant="outlined" sx={{ height:22 }} /></TableCell>
                    <TableCell>{r.count}</TableCell>
                    <TableCell>{r.latitude.toFixed(5)}</TableCell>
                    <TableCell>{r.longitude.toFixed(5)}</TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" style={{ color:'#888' }}>
                      표시할 데이터가 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>
    </Box>
  );
};

export default DisasterMap;
