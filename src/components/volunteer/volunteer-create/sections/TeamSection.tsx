import React from 'react';
import { Stack, TextField } from '@mui/material';

type Props = {
  totalCapacity: number | '';
  setTotalCapacity: React.Dispatch<React.SetStateAction<number | ''>>;
  teamCount: number | '';
  setTeamCount: React.Dispatch<React.SetStateAction<number | ''>>;
  perTeam: number;
  errors?: {
    totalCapacity?: string;
    teamCount?: string;
  };
};

export default function TeamSection({
  totalCapacity,
  setTotalCapacity,
  teamCount,
  setTeamCount,
  perTeam,
  errors
}: Props) {
  const divisible =
    typeof totalCapacity === 'number' &&
    typeof teamCount === 'number' &&
    teamCount > 0 &&
    totalCapacity % teamCount === 0;

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
      <TextField
        fullWidth
        type="number"
        inputProps={{ min: 1 }}
        label="총 인원"
        value={totalCapacity}
        onChange={(e) => setTotalCapacity(e.target.value === '' ? '' : Number(e.target.value))}
        error={!!errors?.totalCapacity}
        helperText={errors?.totalCapacity}
      />
      <TextField
        fullWidth
        type="number"
        inputProps={{ min: 1 }}
        label="팀 개수"
        value={teamCount}
        onChange={(e) => setTeamCount(e.target.value === '' ? '' : Number(e.target.value))}
        helperText={
          errors?.teamCount
            ? errors.teamCount
            : typeof totalCapacity === 'number' &&
              typeof teamCount === 'number' &&
              teamCount > 0
            ? divisible
              ? `팀당 정원 자동 계산: ${perTeam}명`
              : '총 인원이 팀 개수로 나누어떨어지지 않습니다.'
            : '팀 개수를 입력하면 팀당 정원이 자동 계산됩니다.'
        }
        error={!!errors?.teamCount || (typeof totalCapacity === 'number' && typeof teamCount === 'number' && !divisible)}
      />
    </Stack>
  );
}
