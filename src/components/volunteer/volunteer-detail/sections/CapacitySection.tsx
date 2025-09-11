import { Stack, Box, TextField, InputAdornment } from '@mui/material';

type Props = {
  teamCount: number;
  perTeamCapacity?: number;
};

export default function CapacitySection({ teamCount, perTeamCapacity }: Props) {
  return (
    <Stack direction="row" spacing={2}>
      <Box flex={1}><TextField fullWidth label="팀 개수" value={teamCount} disabled /></Box>
      <Box flex={1}>
        <TextField
          fullWidth
          label="팀당 정원"
          value={perTeamCapacity != null ? perTeamCapacity : '팀별 상이'}
          disabled
          InputProps={perTeamCapacity != null ? { endAdornment: <InputAdornment position="end">명</InputAdornment> } : undefined}
        />
      </Box>
    </Stack>
  );
}
