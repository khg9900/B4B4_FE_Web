// src/components/DisasterMap.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import { fetchDisasterMarkers, type DisasterMarker, disasterColors } from '../api/reports';
import { loadKakaoMap } from '../utils/kakaoLoader';

declare global {
  interface Window { kakao: any; }
}

interface Props {
  height?: number;
}

const DisasterMap: React.FC<Props> = ({ height = 420 }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>();
  const [overlays, setOverlays] = useState<any[]>([]);
  const [currentLat, setCurrentLat] = useState(37.5665);
  const [currentLng, setCurrentLng] = useState(126.9780);

  // 현재 위치 가져오기
  const initGeolocation = async () => {
    return new Promise<void>((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setCurrentLat(pos.coords.latitude);
            setCurrentLng(pos.coords.longitude);
            if (map) {
              map.setCenter(new window.kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
            }
            resolve();
          },
          () => resolve(),
          { enableHighAccuracy: true }
        );
      } else resolve();
    });
  };

  // 마커 로드
  const loadMarkers = async () => {
    if (!map) return;

    try {
      console.log('📡 마커 API 호출:', currentLng, currentLat);
      const data: DisasterMarker[] = await fetchDisasterMarkers(currentLng, currentLat);

      console.log('📡 API 응답 데이터:', data);

      // 기존 오버레이 제거
      overlays.forEach(o => o.setMap(null));
      setOverlays([]);

      const newOverlays: any[] = [];

      data.forEach(d => {
        const position = new window.kakao.maps.LatLng(d.latitude, d.longitude);

        const content = document.createElement('div');
        content.style.backgroundColor = disasterColors[d.disasterType] || 'gray';
        content.style.color = 'white';
        content.style.padding = '4px 6px';
        content.style.borderRadius = '50%';
        content.style.textAlign = 'center';
        content.style.fontSize = '12px';
        content.style.fontWeight = 'bold';
        content.style.minWidth = '24px';
        content.style.minHeight = '24px';
        content.innerText = String(d.count);

        const overlay = new window.kakao.maps.CustomOverlay({
          position,
          content,
          yAnchor: 0.5,
          xAnchor: 0.5,
        });

        overlay.setMap(map);

        // 클릭 시 정보창 토글
        const infowindow = new window.kakao.maps.InfoWindow({
          content: `<div style="padding:5px;">
                      <strong>${d.disasterType}</strong><br/>
                      상태: ${d.status}<br/>
                      건수: ${d.count}
                    </div>`
        });

        content.addEventListener('click', () => {
          if (infowindow.getMap()) {
            infowindow.close();
          } else {
            infowindow.open(map, overlay);
          }
        });

        newOverlays.push(overlay);
        console.log('📍 마커 생성:', d);
      });

      setOverlays(newOverlays);
      console.log('✅ 오버레이 세팅 완료:', newOverlays.length);

    } catch (err) {
      console.error('🔥 마커 로딩 실패:', err);
    }
  };

  useEffect(() => {
    const initMap = async () => {
      console.log('🗺️ initMap useEffect 호출');
      try {
        await loadKakaoMap();
        if (!mapContainer.current) return;

        const mapInstance = new window.kakao.maps.Map(mapContainer.current, {
          center: new window.kakao.maps.LatLng(currentLat, currentLng),
          level: 7
        });
        setMap(mapInstance);
        console.log('✅ Kakao Map 로딩 완료');
      } catch (e) {
        console.error('카카오 지도 로딩 실패', e);
      }
    };

    initMap();
  }, []);

  useEffect(() => {
    if (!map) return;

    const load = async () => {
      console.log('🛰️ initGeolocation 호출');
      await initGeolocation();
      console.log('🔄 마커 로드 시작');
      await loadMarkers();
    };

    load();

    // 드래그/줌 후 마커 다시 로드
    const zoomListener = window.kakao.maps.event.addListener(map, 'zoom_changed', loadMarkers);
    const dragListener = window.kakao.maps.event.addListener(map, 'dragend', loadMarkers);

    return () => {
      window.kakao.maps.event.removeListener(map, 'zoom_changed', loadMarkers);
      window.kakao.maps.event.removeListener(map, 'dragend', loadMarkers);
    };
  }, [map, currentLat, currentLng]);

  return (
    <Box sx={{ height, border: '1px dashed', borderColor: 'divider', borderRadius: 2, position: 'relative' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
    </Box>
  );
};

export default DisasterMap;
