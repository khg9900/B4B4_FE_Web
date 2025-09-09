// src/components/volunteer/LocationSection.tsx
import { useState } from 'react';
import { Box, TextField, Typography, Button, Modal, Stack, CircularProgress, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import LocationPicker, { parseRegion } from '../../LocationPicker';
import type { DetailPost } from '../../../types/volunteer';

type Props = {
  edited: DetailPost;
  setEdited: (next: DetailPost) => void;
};

export default function LocationSection({ edited, setEdited }: Props) {
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  // 초기 province, city
  const initialRegion = parseRegion(
    edited.location?.split(' ')[0] ?? '',
    edited.location?.split(' ')[1] ?? ''
  );

  const [province, setProvince] = useState(initialRegion.province);
  const [city, setCity] = useState(initialRegion.city ?? null);
  const [placeName, setPlaceName] = useState(edited.placeName ?? '');
  const [latitude, setLatitude] = useState<number | null>(edited.latitude !== undefined && edited.latitude !== null ? Number(edited.latitude) : null);
  const [longitude, setLongitude] = useState<number | null>(edited.longitude !== undefined && edited.longitude !== null ? Number(edited.longitude) : null);

  const handleConfirm = () => {
    setEdited({
      ...edited,
      location: `${province} ${city ?? ''}`.trim(),
      placeName,
      latitude,
      longitude,
    });
    setLocationModalOpen(false);
  };

  return (
    <>
      <Button variant="outlined" onClick={() => setLocationModalOpen(true)}>
        위치 변경
      </Button>

      <Modal open={locationModalOpen} onClose={() => setLocationModalOpen(false)}>
        <Box sx={{ width: 650, bgcolor: 'white', p: 3, mx: 'auto', mt: '5%', borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>위치 선택</Typography>

          <LocationPicker
            province={province}
            city={city}
            placeName={placeName}
            latitude={latitude !== null && latitude !== undefined ? String(latitude) : ''}
            longitude={longitude !== null && longitude !== undefined ? String(longitude) : ''}
            setProvince={setProvince}
            setCity={setCity}
            setPlaceName={setPlaceName}
            setLatitude={(v) => {
              const num = parseFloat(v);  // 문자열을 숫자로 변환
              if (!Number.isNaN(num)) setLatitude(num);
              else setLatitude(null); // 변환 실패 시 null 설정
            }}
            setLongitude={(v) => {
              const num = parseFloat(v);  // 문자열을 숫자로 변환
              if (!Number.isNaN(num)) setLongitude(num);
              else setLongitude(null); // 변환 실패 시 null 설정
            }}    
            modalOpen={locationModalOpen}
          />

          <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
            <Button variant="outlined" onClick={() => setLocationModalOpen(false)}>취소</Button>
            <Button variant="contained" onClick={handleConfirm}>선택 완료</Button>
          </Stack>
        </Box>
      </Modal>

      {/* 선택된 위치 미리보기 */}
      <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, mt: 2 }}>
        <Stack spacing={2}>
          <TextField fullWidth label="지역" value={`${province} ${city ?? ''}`.trim()} disabled />
          <TextField
            fullWidth
            label="상세 장소명"
            value={placeName}
            onChange={(e) => setPlaceName(e.target.value)}
          />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            좌표: 위도 {latitude !== null && latitude !== undefined ? latitude.toFixed(4) : '-'}, 경도 {longitude !== null && longitude !== undefined ? longitude.toFixed(4) : '-'}
          </Typography>
        </Stack>
      </Box>
    </>
  );
}
