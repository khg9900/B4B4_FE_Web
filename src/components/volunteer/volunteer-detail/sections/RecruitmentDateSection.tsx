import { Stack, Box, TextField } from '@mui/material';

type Props = {
  startDate?: string;
  endDate?: string;
  onChange?: (e: any) => void; // optional
  errors?: {
    startDate?: string;
    endDate?: string;
  };
};

export default function RecruitmentDateSection({
  startDate,
  endDate,
  onChange,
  errors,
}: Props) {
  const readOnly = !onChange; // onChange 없으면 읽기 전용

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
          disabled={readOnly} // 읽기 전용 처리
          InputLabelProps={{ shrink: true }}
          error={!!errors?.startDate}
          helperText={errors?.startDate}
          InputProps={{ readOnly }}
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
          disabled={readOnly} // 읽기 전용 처리
          InputLabelProps={{ shrink: true }}
          error={!!errors?.endDate}
          helperText={errors?.endDate}
          InputProps={{ readOnly }}
        />
      </Box>
    </Stack>
  );
}
