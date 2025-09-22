import { Stack, Box, TextField, InputAdornment, Typography } from '@mui/material';

type Props = {
  attendanceStartTime?: string;
  attendanceEndTime?: string;
  attendanceRadius?: number;
  onChange?: (e: any) => void;
  errors?: {
    startTime?: string;
    endTime?: string;
    radius?: string;
  };
};

export default function AttendanceSection({
  attendanceStartTime,
  attendanceEndTime,
  attendanceRadius,
  onChange,
  errors,
}: Props) {

  const readOnly = !onChange
  return (
    <>
      <Typography variant="h6" sx={{ mt: 1 }}>출석 정책</Typography>

      <Stack direction="row" spacing={2}>
        <Box flex={1}>
          <TextField
            fullWidth
            type="time"
            label="출석 시작 시간"
            name="attendanceStartTime"
            value={attendanceStartTime ?? ''}
            onChange={onChange}
            disabled={readOnly}
            InputLabelProps={{ shrink: true }}
            error={!!errors?.startTime}
            helperText={errors?.startTime}
            InputProps={{ readOnly }}
          />
        </Box>
        <Box flex={1}>
          <TextField
            fullWidth
            type="time"
            label="출석 종료 시간"
            name="attendanceEndTime"
            value={attendanceEndTime ?? ''}
            onChange={onChange}
            disabled={readOnly}
            InputLabelProps={{ shrink: true }}
            InputProps={{ readOnly }}
            error={!!errors?.endTime}
            helperText={errors?.endTime}
          />
        </Box>
      </Stack>

      <Box sx={{ mt: 1 }}>
        <TextField
          fullWidth
          type="number"
          inputProps={{ min: 0, readOnly }}
          label="출석 인정 반경"
          name="attendanceRadius"
          value={attendanceRadius ?? 0}
          onChange={onChange}
          disabled={readOnly}
          InputProps={{
            endAdornment: <InputAdornment position="end">m</InputAdornment>,
          }}
          error={!!errors?.radius}
          helperText={errors?.radius}
        />
      </Box>
    </>
  );
}
