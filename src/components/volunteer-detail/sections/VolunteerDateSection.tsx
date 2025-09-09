import { Stack, Box, TextField } from '@mui/material';

type Props = {
  volunteerDate?: string;
  startTime?: string;
  endTime?: string;
  onChange: (e: any) => void;
};

export default function VolunteerDateSection({ volunteerDate, startTime, endTime, onChange }: Props) {
  return (
    <>
      <TextField
        fullWidth
        type="date"
        label="봉사 일자"
        name="volunteerDate"
        value={volunteerDate ?? ''}
        onChange={onChange}
        InputLabelProps={{ shrink: true }}
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
            InputLabelProps={{ shrink: true }}
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
            InputLabelProps={{ shrink: true }}
          />
        </Box>
      </Stack>
    </>
  );
}
