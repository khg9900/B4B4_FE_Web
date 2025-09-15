import { useEffect, useRef, useState } from 'react';
import { Box, TextField, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { loadKakaoMap, searchPlace } from '../../utils/kakaoLoader';

type Props = {
  province: string;
  city: string | null;
  placeName: string;
  latitude: string;
  longitude: string;
  setProvince: (v: string) => void;
  setCity: (v: string | null) => void;
  setPlaceName: (v: string) => void;
  setLatitude: (v: string) => void;
  setLongitude: (v: string) => void;
  modalOpen: boolean;
};


// coord2regioncode SDK 결과 기반 특수 처리
export function parseRegion(region1: string, region2: string): { province: string; city: string | null } {
  let province = region1;
  let city: string | null = region2;
  if (region1 === '세종특별자치시') city = null;
  else if (region2.endsWith('군')) city = region2;
  return { province, city };
}

export default function LocationPicker({
  province, city, placeName, latitude, longitude,
  setProvince, setCity, setPlaceName, setLatitude, setLongitude
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<any>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 지도 초기화 및 마커
  useEffect(() => {
    if (!mapRef.current) return;
    let map: any;

    loadKakaoMap().then((kakao) => {
      const lat = latitude ? parseFloat(latitude) : 37.5665;
      const lng = longitude ? parseFloat(longitude) : 126.978;
      const center = new kakao.maps.LatLng(lat, lng);
      map = new kakao.maps.Map(mapRef.current, { center, level: 4 });
      markerRef.current = new kakao.maps.Marker({ map, position: center });

      // 지도 클릭
      kakao.maps.event.addListener(map, 'click', (mouseEvent: any) => {
        const latlng = mouseEvent.latLng;
        markerRef.current.setPosition(latlng);

        setLatitude(latlng.getLat().toString());
        setLongitude(latlng.getLng().toString());

        const geocoder = new kakao.maps.services.Geocoder();
        geocoder.coord2RegionCode(latlng.getLng(), latlng.getLat(), (result: any, status: any) => {
          if (status === kakao.maps.services.Status.OK && result.length > 0) {
            const region = parseRegion(result[0].region_1depth_name, result[0].region_2depth_name);
            setProvince(region.province);
            setCity(region.city);
            setPlaceName(result[0].address_name);
          }
        });
      });
    });
  }, [mapRef, latitude, longitude]);

  // 장소 검색
  const handleSearch = async () => {
    if (!searchKeyword) return;
    setLoading(true);
    try {
      const places = await searchPlace(searchKeyword);
      setResults(places);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (place: any) => {
    setPlaceName(place.place_name);
    setLatitude(place.y);
    setLongitude(place.x);

    loadKakaoMap().then((kakao) => {
      const geocoder = new kakao.maps.services.Geocoder();
      geocoder.coord2RegionCode(place.x, place.y, (result: any, status: any) => {
        if (status === kakao.maps.services.Status.OK && result.length > 0) {
          const region = parseRegion(result[0].region_1depth_name, result[0].region_2depth_name);
          setProvince(region.province);
          setCity(region.city);
        }
      });

      if (!mapRef.current || !markerRef.current) return;
      const map = markerRef.current.getMap();
      const loc = new kakao.maps.LatLng(place.y, place.x);
      map.setCenter(loc);
      markerRef.current.setPosition(loc);
    });
  };

  return (
    <Box>
      <TextField
        fullWidth
        label="장소 검색"
        value={searchKeyword}
        onChange={(e) => setSearchKeyword(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        placeholder="예: 서울시청, 카페"
        sx={{ mb: 1 }}
      />
      <List sx={{ maxHeight: 150, overflow: 'auto' }}>
        {loading && <ListItem>검색 중...</ListItem>}
        {!loading && results.map((place) => (
          <ListItem key={place.id || place.place_name} disablePadding>
            <ListItemButton onClick={() => handleSelect(place)}>
              <ListItemText
                primary={place.place_name}
                secondary={place.road_address_name || place.address_name}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box ref={mapRef} sx={{ width: '100%', height: 300, border: '1px solid #ccc' }} />
    </Box>
  );
}
