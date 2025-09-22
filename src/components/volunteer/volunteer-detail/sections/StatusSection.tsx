import { FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';
import type { PostStatus } from '../../../../types/volunteer';

type Props = {
  status: PostStatus;
  onChange?: (e: any) => void;
  error?: boolean;
  helperText?: string;
  isCompleted?: boolean;
};

export default function StatusSection({ status, onChange, error, helperText, isCompleted = false }: Props) {
  const readOnly = !onChange || isCompleted;

  return (
    <FormControl fullWidth error={error}>
      <InputLabel id="status-label">상태</InputLabel>
      <Select<PostStatus>
        labelId="status-label"
        label="상태"
        name="status"
        value={status}
        onChange={readOnly ? undefined : onChange}
        disabled={readOnly}
      >
        <MenuItem value="모집 중">모집 중</MenuItem>
        <MenuItem value="모집 마감">모집 마감</MenuItem>
        <MenuItem value="봉사 완료">봉사 완료</MenuItem>
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
}
