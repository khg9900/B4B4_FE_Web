import React from 'react';
import { Stack, TextField } from '@mui/material';

type Props = {
  volunteerDate: string;
  setVolunteerDate: React.Dispatch<React.SetStateAction<string>>;
  startTime: string;
  setStartTime: React.Dispatch<React.SetStateAction<string>>;
  endTime: string;
  setEndTime: React.Dispatch<React.SetStateAction<string>>;
  pickerSx?: object;
  errors?: { 
    volunteerDate?: string;
    startTime?: string;
    endTime?: string;
  };
};

export default function VolunteerDateSection({
  volunteerDate,
  setVolunteerDate,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  pickerSx,
  errors
}: Props) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
      <TextField
        fullWidth
        type="date"
        label="봉사 일자"
        value={volunteerDate}
        onChange={(e) => setVolunteerDate(e.target.value)}
        InputLabelProps={{ shrink: true }}
        InputProps={{ sx: pickerSx }}
        error={!!errors?.volunteerDate}
        helperText={errors?.volunteerDate}
      />
      <TextField
        fullWidth
        type="time"
        label="시작 시간"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
        InputLabelProps={{ shrink: true }}
        InputProps={{ sx: pickerSx }}
        error={!!errors?.startTime}
        helperText={errors?.startTime}
      />
      <TextField
        fullWidth
        type="time"
        label="종료 시간"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
        InputLabelProps={{ shrink: true }}
        InputProps={{ sx: pickerSx }}
        error={!!errors?.endTime}
        helperText={errors?.endTime}
      />
    </Stack>
  );
}
