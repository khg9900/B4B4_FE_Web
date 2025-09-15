import React from 'react';
import { Stack, TextField, Button, Typography, Box } from '@mui/material';

type Props = {
  province: string;
  city: string | null;
  locationName: string;
  latitude: string;
  longitude: string;
  setLocationName: React.Dispatch<React.SetStateAction<string>>;
  onOpenModal: () => void;
  errors?: { province?: string; city?: string; placeName?: string; latitude?: string; longitude?: string }; // 상세 장소명 오류 메시지
};

export default function LocationSection({
  province,
  city,
  locationName,
  latitude,
  longitude,
  setLocationName,
  onOpenModal,
  errors
}: Props) {
  return (
    <>
      <Button variant="outlined" onClick={onOpenModal}>
        위치 선택
      </Button>

      <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Stack spacing={2}>
          <TextField
            fullWidth
            label="지역 (예: 서울특별시 관악구)"
            value={province ? (city ? `${province} ${city}` : province) : ''}
            disabled
          />
          <TextField
            fullWidth
            label="상세 장소명"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            error={!!errors?.placeName}        // 오류가 있으면 빨간색 표시
            helperText={errors?.placeName}     // 오류 메시지 표시
          />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            좌표: 위도 {latitude ? parseFloat(latitude).toFixed(4) : '-'}, 경도 {longitude ? parseFloat(longitude).toFixed(4) : '-'}
          </Typography>
        </Stack>
      </Box>
    </>
  );
}
