import { Modal, Box, Button } from '@mui/material';
import type { Dispatch, SetStateAction } from 'react';
import LocationPicker from '../LocationPicker';

type Props = {
  open: boolean;
  onClose: () => void;
  province: string;
  setProvince: Dispatch<SetStateAction<string>>;
  city: string | null;
  setCity: Dispatch<SetStateAction<string | null>>;
  placeName: string;
  setPlaceName: Dispatch<SetStateAction<string>>;
  latitude: string;
  setLatitude: Dispatch<SetStateAction<string>>;
  longitude: string;
  setLongitude: Dispatch<SetStateAction<string>>;
};

export default function LocationModal({
  open, onClose,
  province, setProvince, city, setCity,
  placeName, setPlaceName, latitude, setLatitude,
  longitude, setLongitude
}: Props) {
  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ width: 500, bgcolor: 'white', p: 2, mx: 'auto', mt: '10%', borderRadius: 2 }}>
        <LocationPicker
          province={province}
          city={city}
          placeName={placeName}
          latitude={latitude}
          longitude={longitude}
          setProvince={setProvince}
          setCity={setCity}
          setPlaceName={setPlaceName}
          setLatitude={setLatitude}
          setLongitude={setLongitude}
          modalOpen={open}
        />
        <Button onClick={onClose} sx={{ mt: 2 }}>닫기</Button>
      </Box>
    </Modal>
  );
}
