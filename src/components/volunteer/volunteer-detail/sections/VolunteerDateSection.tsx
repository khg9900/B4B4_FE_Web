import { Stack, Box, TextField } from '@mui/material';

type Props = {
  volunteerDate?: string;
  startTime?: string;
  endTime?: string;
  onChange?: (e: any) => void;
  errors?: {
    volunteerDate?: string;
    startTime?: string;
    endTime?: string;
  };
};

export default function VolunteerDateSection({ volunteerDate, startTime, endTime, onChange, errors }: Props) {
  const readOnly = !onChange;

  return (
    <>
      <TextField
        fullWidth
        type="date"
        label="봉사 일자"
        name="volunteerDate"
        value={volunteerDate ?? ''}
        onChange={onChange}
        disabled={readOnly}
        InputLabelProps={{ shrink: true }}
        inputProps={{ min: new Date().toISOString().split('T')[0], readOnly }}
        error={!!errors?.volunteerDate}
        helperText={errors?.volunteerDate}
      />
      <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
        <Box flex={1}>
          <TextField
            fullWidth
            type="time"
            label="시작 시간"
            name="volunteerStartTime"
            value={startTime ?? ''}
            onChange={onChange}
            disabled={readOnly}
            InputLabelProps={{ shrink: true }}
            InputProps={{ readOnly }}
            error={!!errors?.startTime}
            helperText={errors?.startTime}
          />
        </Box>
        <Box flex={1}>
          <TextField
            fullWidth
            type="time"
            label="종료 시간"
            name="volunteerEndTime"
            value={endTime ?? ''}
            onChange={onChange}
            disabled={readOnly}
            InputLabelProps={{ shrink: true }}
            InputProps={{ readOnly }}
            error={!!errors?.endTime}
            helperText={errors?.endTime}
          />
        </Box>
      </Stack>
    </>
  );
}
