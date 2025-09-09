import React from 'react';
import { Stack, TextField } from '@mui/material';

type Props = {
  recruitmentStartDate: string;
  setRecruitmentStartDate: React.Dispatch<React.SetStateAction<string>>;
  recruitmentEndDate: string;
  setRecruitmentEndDate: React.Dispatch<React.SetStateAction<string>>;
  pickerSx?: object;
  errors?: {
    recruitmentStartDate?: string;
    recruitmentEndDate?: string;
  };
};

export default function RecruitmentPeriodSection({
  recruitmentStartDate,
  setRecruitmentStartDate,
  recruitmentEndDate,
  setRecruitmentEndDate,
  pickerSx,
  errors
}: Props) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
      <TextField
        fullWidth
        type="date"
        label="모집 시작"
        value={recruitmentStartDate}
        onChange={(e) => setRecruitmentStartDate(e.target.value)}
        InputLabelProps={{ shrink: true }}
        InputProps={{ sx: pickerSx }}
        error={!!errors?.recruitmentStartDate}
        helperText={errors?.recruitmentStartDate}
      />
      <TextField
        fullWidth
        type="date"
        label="모집 마감"
        value={recruitmentEndDate}
        onChange={(e) => setRecruitmentEndDate(e.target.value)}
        InputLabelProps={{ shrink: true }}
        InputProps={{ sx: pickerSx }}
        error={!!errors?.recruitmentEndDate}
        helperText={errors?.recruitmentEndDate}
      />
    </Stack>
  );
}
