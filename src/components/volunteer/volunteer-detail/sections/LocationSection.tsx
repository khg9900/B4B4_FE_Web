import { useState } from 'react';
import { Box, TextField, Typography, Button, Modal, Stack } from '@mui/material';
import LocationPicker, { parseRegion } from '../../LocationPicker';
import type { DetailPost } from '../../../../types/volunteer';

type Props = {
  edited: DetailPost;
  setEdited: (next: DetailPost) => void;
  isCompleted?: boolean;
};

export default function LocationSection({ edited, setEdited, isCompleted = false }: Props) {
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  const initialRegion = parseRegion(
    edited.location?.split(' ')[0] ?? '',
    edited.location?.split(' ')[1] ?? ''
  );

  const [province, setProvince] = useState(initialRegion.province);
  const [city, setCity] = useState(initialRegion.city ?? null);
  const [placeName, setPlaceName] = useState(edited.placeName ?? '');
  const [latitude, setLatitude] = useState<number | null>(
    edited.latitude != null ? Number(edited.latitude) : null
  );
  const [longitude, setLongitude] = useState<number | null>(
    edited.longitude != null ? Number(edited.longitude) : null
  );

  const handleConfirm = () => {
    if (isCompleted) return;
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
            latitude={latitude != null ? String(latitude) : ''}
            longitude={longitude != null ? String(longitude) : ''}
            setProvince={(v) => !isCompleted && setProvince(v)}
            setCity={(v) => !isCompleted && setCity(v)}
            setPlaceName={(v) => !isCompleted && setPlaceName(v)}
            setLatitude={(v) => {
              if (isCompleted) return;
              const num = parseFloat(v);
              setLatitude(!Number.isNaN(num) ? num : null);
            }}
            setLongitude={(v) => {
              if (isCompleted) return;
              const num = parseFloat(v);
              setLongitude(!Number.isNaN(num) ? num : null);
            }}
            modalOpen={locationModalOpen}
          />

          <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
            <Button variant="outlined" onClick={() => setLocationModalOpen(false)}>취소</Button>
            <Button variant="contained" onClick={handleConfirm} disabled={isCompleted}>
              선택 완료
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, mt: 2 }}>
        <Stack spacing={2}>
          <TextField
            fullWidth
            label="지역"
            value={`${province} ${city ?? ''}`.trim()}
            disabled
          />
          <TextField
            fullWidth
            label="상세 장소명"
            value={placeName}
            onChange={(e) => !isCompleted && setPlaceName(e.target.value)}
            disabled={isCompleted}
          />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            좌표: 위도 {latitude != null ? latitude.toFixed(4) : '-'}, 경도 {longitude != null ? longitude.toFixed(4) : '-'}
          </Typography>
        </Stack>
      </Box>
    </>
  );
}
