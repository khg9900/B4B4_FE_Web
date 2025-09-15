import { Stack, Box, TextField } from '@mui/material';

type Props = {
  startDate?: string;
  endDate?: string;
  onChange: (e: any) => void;
  errors?: {
    startDate?: string;
    endDate?: string;
  };
};

export default function RecruitmentDateSection({ startDate, endDate, onChange, errors }: Props) {
  return (
    <Stack direction="row" spacing={2}>
      <Box flex={1}>
        <TextField
          fullWidth
          type="date"
          label="모집 시작"
          name="recruitmentStartDate"
          value={startDate ?? ''}
          onChange={onChange}
          InputLabelProps={{ shrink: true }}
          error={!!errors?.startDate}
          helperText={errors?.startDate}
        />
      </Box>
      <Box flex={1}>
        <TextField
          fullWidth
          type="date"
          label="모집 마감"
          name="recruitmentEndDate"
          value={endDate ?? ''}
          onChange={onChange}
          InputLabelProps={{ shrink: true }}
          error={!!errors?.endDate}
          helperText={errors?.endDate}
        />
      </Box>
    </Stack>
  );
}
