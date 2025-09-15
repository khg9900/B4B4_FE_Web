import React from 'react';
import { Stack, TextField, InputAdornment } from '@mui/material';

type Props = {
  attendanceStartTime: string;
  setAttendanceStartTime: React.Dispatch<React.SetStateAction<string>>;
  attendanceEndTime: string;
  setAttendanceEndTime: React.Dispatch<React.SetStateAction<string>>;
  attendanceRadius: number | '';
  setAttendanceRadius: React.Dispatch<React.SetStateAction<number | ''>>;
  pickerSx?: object;
  errors?: {
    startTime?: string;
    endTime?: string;
    radius?: string;
  };
};

export default function AttendancePolicySection({
  attendanceStartTime,
  setAttendanceStartTime,
  attendanceEndTime,
  setAttendanceEndTime,
  attendanceRadius,
  setAttendanceRadius,
  pickerSx,
  errors
}: Props) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
      <TextField
        fullWidth
        type="time"
        label="출석 시작 시간"
        value={attendanceStartTime}
        onChange={(e) => setAttendanceStartTime(e.target.value)}
        InputLabelProps={{ shrink: true }}
        InputProps={{ sx: pickerSx }}
        error={!!errors?.startTime}
        helperText={errors?.startTime}
      />
      <TextField
        fullWidth
        type="time"
        label="출석 종료 시간"
        value={attendanceEndTime}
        onChange={(e) => setAttendanceEndTime(e.target.value)}
        InputLabelProps={{ shrink: true }}
        InputProps={{ sx: pickerSx }}
        error={!!errors?.endTime}
        helperText={errors?.endTime}
      />
      <TextField
        fullWidth
        type="number"
        inputProps={{ min: 100 }}
        label="출석 인정 반경"
        value={attendanceRadius}
        onChange={(e) => setAttendanceRadius(e.target.value === '' ? '' : Number(e.target.value))}
        InputProps={{ endAdornment: <InputAdornment position="end">m</InputAdornment>, sx: pickerSx }}
        error={!!errors?.radius}
        helperText={errors?.radius}
      />
    </Stack>
  );
}
